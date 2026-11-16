import {describe,it,expect} from 'vitest';
import catalogue from '../apps/web/src/catalogue.json';

describe('captured Kinnu learning catalogue',()=>{
 it('retains all 100 pathways and seven continents',()=>{
  expect(catalogue).toHaveLength(100);
  expect(new Set(catalogue.map(p=>p.id)).size).toBe(100);
  expect([...new Set(catalogue.map(p=>p.category))].sort()).toEqual(['culture','history','lifestyle','philosophy','psychology','science','technology']);
 });
 it('retains 899 distinct source lessons in their pathway',()=>{
  const urls=catalogue.flatMap(p=>p.lessons.map(l=>l.url));
  expect(urls).toHaveLength(899);
  expect(new Set(urls).size).toBe(899);
  for(const pathway of catalogue){
   expect(pathway.title.trim().length).toBeGreaterThan(2);
   expect(pathway.lessons.length).toBeGreaterThan(0);
   for(const lesson of pathway.lessons){
    expect(lesson.title.trim().length).toBeGreaterThan(0);
    expect(lesson.url.startsWith(`/kinnuverse/${pathway.category}/${pathway.id}/`)).toBe(true);
   }
  }
 });
});
