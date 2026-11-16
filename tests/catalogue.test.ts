import {describe,it,expect} from 'vitest';
import {continents,pathways,continentById,pathwaysIn,totalLessons,matchesQuery,matchingLesson} from '../apps/web/src/catalogue';
import {lessonBodies,parseLessonFile} from '../apps/web/src/lessons';
import {parseBlocks} from '../apps/web/src/lessonMarkdown';

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
 it('has a written body of roughly 400–600 words for every lesson, with no orphan sections',()=>{
  const ids=new Set(pathways.flatMap(p=>p.lessons.map(l=>l.id)));
  expect(Object.keys(lessonBodies).filter(k=>!ids.has(k))).toEqual([]);
  for(const p of pathways)for(const l of p.lessons){
   expect(l.body,l.id).toBeTruthy();
   const words=l.body!.replace(/[|#>*`-]/g,' ').split(/\s+/).filter(Boolean).length;
   expect(words,l.id).toBeGreaterThanOrEqual(400);
   expect(words,l.id).toBeLessThanOrEqual(650);
   expect(l.body,l.id).toMatch(/\*\*Key takeaway:\*\*/);
  }
 });
 it('parses lesson files and the Markdown subset used in lessons',()=>{
  expect(parseLessonFile('p','@@ a\r\nOne.\r\n\r\n@@ b\nTwo.\n')).toEqual({'p/a':'One.','p/b':'Two.'});
  const blocks=parseBlocks('## Head\n\nPara **bold**\nwraps.\n\n- x\n- y\n\n1. one\n2. two\n\n> **Key takeaway:** z\n\n| A | B |\n|---|---|\n| 1 | 2 |');
  expect(blocks.map(b=>b.type)).toEqual(['heading','p','ul','ol','callout','table']);
  expect(blocks[1]).toEqual({type:'p',text:'Para **bold** wraps.'});
  expect(blocks[5]).toEqual({type:'table',header:['A','B'],rows:[['1','2']]});
 });
});
