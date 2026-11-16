import {describe,it,expect} from 'vitest';
import {buildMapGraph,subjectPosition,nodeId,HUB_ID} from '../apps/web/src/mapGraph';
import {continents,pathwaysIn,pathways} from '../apps/web/src/catalogue';

const valid=(g:ReturnType<typeof buildMapGraph>)=>{const ids=new Set(g.nodes.map(n=>n.id));expect(ids.size).toBe(g.nodes.length);for(const l of g.links){expect(ids.has(l.source)).toBe(true);expect(ids.has(l.target)).toBe(true);}for(const n of g.nodes)if(n.parent)expect(ids.has(n.parent)).toBe(true);};

describe('3D map graph',()=>{
 it('starts with the hub and one planet per subject',()=>{
  const g=buildMapGraph({subject:null,pathway:null});valid(g);
  expect(g.nodes.map(n=>n.kind)).toEqual(['hub',...continents.map(()=>'subject')]);
  expect(g.links).toHaveLength(continents.length);
  expect(g.links.every(l=>l.source===HUB_ID&&l.kind==='subject')).toBe(true);
 });
 it('expands a subject into its pathways only',()=>{
  const g=buildMapGraph({subject:'data-centers',pathway:null});valid(g);
  const moons=g.nodes.filter(n=>n.kind==='pathway');
  expect(moons.map(n=>n.label)).toEqual(pathwaysIn('data-centers').map(p=>p.title));
  expect(moons.every(n=>n.parent===nodeId.subject('data-centers'))).toBe(true);
  expect(g.nodes.some(n=>n.kind==='lesson')).toBe(false);
 });
 it('expands a pathway into its lessons, and ignores a pathway from another subject',()=>{
  const g=buildMapGraph({subject:'data-centers',pathway:'critical-power'});valid(g);
  const lessons=g.nodes.filter(n=>n.kind==='lesson');
  expect(lessons.map(n=>n.label)).toEqual(pathways.find(p=>p.id==='critical-power')!.lessons.map(l=>l.title));
  expect(lessons[0].label).toBe('Read a one-line diagram');
  const wrong=buildMapGraph({subject:'llms',pathway:'critical-power'});
  expect(wrong.nodes.some(n=>n.kind==='lesson')).toBe(false);
 });
 it('places subjects at fixed, distinct, finite positions',()=>{
  const ps=continents.map((_,i)=>subjectPosition(i));
  for(const p of ps)expect([p.x,p.y,p.z].every(Number.isFinite)).toBe(true);
  for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++)expect(Math.hypot(ps[i].x-ps[j].x,ps[i].y-ps[j].y,ps[i].z-ps[j].z)).toBeGreaterThan(150);
  expect(subjectPosition(3)).toEqual(subjectPosition(3));
 });
 it('draws cross-link arcs from visible pathways and lessons to other subjects only',()=>{
  expect(buildMapGraph({subject:null,pathway:null}).links.some(l=>l.kind==='cross')).toBe(false);
  const g=buildMapGraph({subject:'prediction-models',pathway:'nba-moneylines'});valid(g);
  const cross=g.links.filter(l=>l.kind==='cross');
  expect(cross.length).toBeGreaterThan(0);
  expect(cross.every(l=>l.target.startsWith('s:')&&l.target!==nodeId.subject('prediction-models'))).toBe(true);
  expect(cross.every(l=>(l.reason??'').length>20)).toBe(true);
  const targets=new Set(cross.map(l=>l.target));
  expect(targets.has(nodeId.subject('machine-learning'))).toBe(true); // probability calibration, gradient-boosted trees
  expect(targets.has(nodeId.subject('sports-gambling'))).toBe(true); // odds, closing line
  expect(cross.some(l=>l.source===nodeId.lesson('nba-moneylines/calibrating-win-probabilities'))).toBe(true);
  expect(new Set(cross.map(l=>l.source+'|'+l.target)).size).toBe(cross.length);
 });
});
