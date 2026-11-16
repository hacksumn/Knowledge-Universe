import {describe,it,expect} from 'vitest';
import {continents,pathways,continentById,pathwaysIn,totalLessons,matchesQuery,matchingLesson} from '../apps/web/src/catalogue';

describe('Knowledge Universe catalogue',()=>{
 it('defines the eight subjects with a color, tagline and description',()=>{
  expect(continents.map(c=>c.name)).toEqual(['Machine Learning','Agents','Data Centers','Prediction Models','Sports Gambling','LLMs','Possible Use Cases for AI','PCB Diagnostics']);
  expect(new Set(continents.map(c=>c.id)).size).toBe(continents.length);
  expect(new Set(continents.map(c=>c.color)).size).toBe(continents.length);
  for(const c of continents){expect(c.color).toMatch(/^#[0-9a-f]{6}$/);expect(c.tagline.length).toBeGreaterThan(10);expect(c.description.length).toBeGreaterThan(30);}
 });
 it('gives every subject 2–4 pathways and every pathway stub lessons',()=>{
  for(const c of continents){const n=pathwaysIn(c.id).length;expect(n).toBeGreaterThanOrEqual(2);expect(n).toBeLessThanOrEqual(4);}
  expect(new Set(pathways.map(p=>p.id)).size).toBe(pathways.length);
  const lessonIds=pathways.flatMap(p=>p.lessons.map(l=>l.id));
  expect(new Set(lessonIds).size).toBe(lessonIds.length);
  expect(totalLessons).toBe(lessonIds.length);
  for(const p of pathways){
   expect(continentById[p.continent]).toBeDefined();
   expect(p.lessons.length).toBeGreaterThanOrEqual(3);
   for(const l of p.lessons){expect(l.id.startsWith(`${p.id}/`)).toBe(true);expect(l.title.trim()).not.toBe('');expect(l.summary.length).toBeGreaterThan(20);}
  }
 });
 it('includes the two example pathways first',()=>{
  expect(pathways[0]).toMatchObject({continent:'data-centers',title:'Critical Power'});
  expect(pathways[0].lessons.map(l=>l.title)).toContain('Read a one-line diagram');
  expect(pathways[1]).toMatchObject({continent:'prediction-models',title:'NBA Moneylines'});
  expect(pathways[1].lessons.map(l=>l.title)).toContain('Walk-forward validation');
 });
 it('searches pathway, subject and lesson text with all terms, case-insensitively',()=>{
  const ids=(q:string)=>pathways.filter(p=>matchesQuery(p,q)).map(p=>p.id);
  expect(ids('')).toHaveLength(pathways.length);
  expect(ids('  ONE-LINE  ')).toEqual(['critical-power']);
  expect(ids('walk-forward')).toEqual(['nba-moneylines']);
  expect(ids('pcb diagnostics')).toEqual(pathwaysIn('pcb-diagnostics').map(p=>p.id));
  expect(ids('kelly')).toEqual(['bankroll-and-risk']);
  expect(ids('nonexistent123')).toEqual([]);
  expect(matchingLesson(pathways[1],'walk-forward')?.title).toBe('Walk-forward validation');
  expect(matchingLesson(pathways[1],'')).toBeUndefined();
 });
});
