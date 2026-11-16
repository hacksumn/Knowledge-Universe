import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowRight, Search, X, ChevronRight, ChevronDown, Compass, Bookmark, BookOpen, Sparkles, Globe2, Menu, Check, Layers } from 'lucide-react';
import { continents, continentById, pathways, pathwaysIn, totalLessons, matchesQuery, matchingLesson, type ContinentId, type Pathway } from './catalogue';
import { SubjectArt } from './art';
import './styles.css';

const SAVED_KEY = 'ku-saved-v2';
const knownIds = new Set(pathways.map(p => p.id));
function readSaved(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string' && knownIds.has(x)) : [];
  } catch { return []; }
}
// Hero hex tiles: the first seven subjects (the seventh tile is faded by CSS).
const heroSubjects = continents.slice(0, 7);

function App() {
  const [category, setCategory] = useState<'all' | ContinentId>('all');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<string[]>(readSaved);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<Pathway | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const search = useRef<HTMLInputElement>(null), close = useRef<HTMLButtonElement>(null), lastFocus = useRef<HTMLElement | null>(null);

  const filtered = pathways.filter(p => (category === 'all' || p.continent === category) && (!savedOnly || saved.includes(p.id)) && matchesQuery(p, query));

  useEffect(() => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch { /* storage unavailable */ } }, [saved]);
  useEffect(() => {
    if (!selected) return;
    lastFocus.current = document.activeElement as HTMLElement;
    close.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; lastFocus.current?.focus(); };
  }, [selected]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelected(null); setMenu(false); }
      if (e.key === '/' && !(e.target as HTMLElement).matches('input')) { e.preventDefault(); search.current?.focus(); explore(); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  function openPathway(p: Pathway) { setOpenLesson(null); setSelected(p); }
  function save(id: string) { setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function explore() { document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' }); }
  function home() { setCategory('all'); setQuery(''); setSavedOnly(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function collection() { setSavedOnly(true); setCategory('all'); setQuery(''); explore(); }
  function resetFilters() { setCategory('all'); setQuery(''); setSavedOnly(false); }
  const showSubjects = category === 'all' && !query && !savedOnly;
  const selectedContinent = selected ? continentById[selected.continent] : null;

  return <>
    <header className="header">
      <a href="#" className="brand" onClick={e => { e.preventDefault(); home(); }} aria-label="Knowledge Universe home"><span className="brand-mark" />knowledge<span className="brand-universe">universe</span><span className="brand-beta">EXPLORER</span></a>
      <nav aria-label="Main navigation">
        <button className={!savedOnly ? 'nav-active' : ''} onClick={() => { setSavedOnly(false); explore(); }}>Explore</button>
        <button className={savedOnly ? 'nav-active' : ''} onClick={collection}>My collection <span>{saved.length}</span></button>
      </nav>
      <button className="header-cta" onClick={explore}>Start exploring <ArrowUpRight size={16} /></button>
      <button className="mobile-menu icon-button" aria-label="Toggle navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu /></button>
      {menu && <div className="mobile-nav"><button onClick={() => { setSavedOnly(false); setMenu(false); explore(); }}>Explore</button><button onClick={() => { collection(); setMenu(false); }}>My collection ({saved.length})</button></div>}
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> AI, DATA AND THE MACHINES BEHIND THEM</div>
          <h1>From power feed<br />to <span>prediction.</span></h1>
          <p>Learn how modern AI works end to end: the data centers that run it,<br className="desktop" /> the models that learn, the agents that act and the markets they forecast.</p>
          <button className="primary" onClick={explore}>Explore the subjects <ArrowRight size={18} /></button>
          <div className="hero-facts"><span><Globe2 size={14} />{continents.length} subjects</span><i /><span><Layers size={14} />{pathways.length} pathways</span><i /><span><BookOpen size={14} />{totalLessons} lessons</span></div>
        </div>
        <div className="hex-world">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="tiny-star star-one">✦</div><div className="tiny-star star-two">✧</div>
          <div className="hex-cluster">
            {heroSubjects.map((c, i) => <button key={c.id} className={`hex hex-${i}`} aria-label={`Explore ${c.name}`} title={c.name} onClick={() => { setCategory(c.id); setQuery(''); setSavedOnly(false); explore(); }}><SubjectArt id={c.id} color={c.color} /></button>)}
          </div>
          <div className="floating-caption"><span /> PICK A SUBJECT TO BEGIN</div>
        </div>
      </section>

      <section className="explorer" id="explore">
        <div className="section-heading">
          <div><div className="eyebrow">YOUR NEXT LESSON STARTS HERE</div><h2>{savedOnly ? 'Your saved pathways' : 'Where do you want to start?'}</h2><p>{savedOnly ? 'Everything you’ve bookmarked for later.' : `${continents.length} subjects. ${pathways.length} pathways. Pick one and work through it lesson by lesson.`}</p></div>
          <div className="catalogue-stat"><strong>{savedOnly ? saved.length : pathways.length}</strong><span>{savedOnly ? 'saved pathways' : 'pathways to explore'}</span><Compass size={33} /></div>
        </div>
        <div className="filter-bar">
          <div className="filter-tabs" role="group" aria-label="Filter by subject">
            <button className={category === 'all' ? 'active' : ''} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>All subjects</button>
            {continents.map(c => <button key={c.id} aria-pressed={category === c.id} className={category === c.id ? 'active' : ''} onClick={() => setCategory(c.id)}><span style={{ background: c.color }} />{c.name}</button>)}
          </div>
          <label className="search"><Search size={17} /><input ref={search} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search pathways and lessons…" aria-label="Search pathways and lessons" />{query ? <button aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button> : <kbd>/</kbd>}</label>
        </div>

        {showSubjects ? <>
          <div className="results-line"><span>EXPLORE BY SUBJECT</span><span>From silicon to strategy.</span></div>
          <div className="continent-grid">
            {continents.map((c, i) => <button key={c.id} className="continent-card" onClick={() => setCategory(c.id)} style={{ '--accent': c.color } as React.CSSProperties}>
              <div className="continent-image"><SubjectArt id={c.id} color={c.color} /><span className="continent-index">{String(i + 1).padStart(2, '0')} / SUBJECT</span><span className="card-arrow"><ArrowUpRight size={21} /></span></div>
              <div className="continent-info"><div className="card-meta"><span className="color-dot" />{pathwaysIn(c.id).length} pathways</div><h3>{c.name}</h3><p className="tagline">{c.tagline}</p><p>{c.description}</p><span className="card-link">Discover {c.name} <ArrowRight size={16} /></span></div>
            </button>)}
          </div>
        </> : <>
          <div className="results-line" aria-live="polite"><span>{filtered.length} PATHWAY{filtered.length === 1 ? '' : 'S'} {query ? `FOR “${query.trim()}”` : category === 'all' ? '' : `IN ${continentById[category].name.toUpperCase()}`}</span><button onClick={resetFilters}>Reset filters <X size={12} /></button></div>
          {category !== 'all' && !query && !savedOnly && <div className="subject-intro" style={{ '--accent': continentById[category].color } as React.CSSProperties}><span className="color-dot" /><strong>{continentById[category].tagline}</strong> {continentById[category].description}</div>}
          <div className="pathway-grid">
            {filtered.map(p => {
              const c = continentById[p.continent];
              const isSaved = saved.includes(p.id);
              const preview = matchingLesson(p, query) ?? p.lessons[0];
              return <article className="pathway-card" key={p.id} style={{ '--accent': c.color } as React.CSSProperties}>
                <button className={`save-button ${isSaved ? 'is-saved' : ''}`} aria-label={`${isSaved ? 'Unsave' : 'Save'} ${p.title}`} aria-pressed={isSaved} onClick={() => save(p.id)}><Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} /></button>
                <button className="pathway-open" onClick={() => openPathway(p)}>
                  <span className="card-meta"><span className="color-dot" />{c.name}</span>
                  <h3>{p.title}</h3>
                  <span className="pathway-description">{p.description}</span>
                  <span className="lesson-preview">{query && matchingLesson(p, query) ? 'Lesson match: ' : 'Starts with: '}{preview.title}</span>
                  <span className="pathway-footer"><span><BookOpen size={14} />{p.lessons.length} lessons</span><ArrowUpRight size={19} /></span>
                </button>
              </article>;
            })}
          </div>
          {!filtered.length && <div className="empty"><Compass size={36} /><h3>{savedOnly && !saved.length ? 'Nothing saved yet.' : 'No pathways found.'}</h3><p>{savedOnly && !saved.length ? 'Use the bookmark on any pathway to keep it here.' : 'Try another search, or explore a different subject.'}</p><button className="primary" onClick={resetFilters}>Explore all subjects <ArrowRight size={17} /></button></div>}
        </>}

        {showSubjects && <div className="curiosity-banner"><div className="banner-star">✳</div><div><h3>Not sure where to begin?</h3><p>Open a random pathway and see where it leads.</p></div><button onClick={() => openPathway(pathways[Math.floor(Math.random() * pathways.length)])}>Surprise me <Sparkles size={17} /></button></div>}
      </section>
    </main>
    <footer><a className="footer-brand" href="#" onClick={e => { e.preventDefault(); home(); }}><span className="brand-mark" />Knowledge Universe</a><p>Built for curious minds.</p><span>{totalLessons} lessons across {pathways.length} pathways in {continents.length} subjects.</span></footer>

    {selected && selectedContinent && <div className="drawer-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}>
      <section className="drawer" role="dialog" aria-modal="true" aria-labelledby="pathway-title" style={{ '--accent': selectedContinent.color } as React.CSSProperties} onKeyDown={e => { if (e.key === 'Tab') { const elements = e.currentTarget.querySelectorAll<HTMLElement>('button,a[href]'); const first = elements[0], last = elements[elements.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } }}>
        <div className="drawer-image"><SubjectArt id={selectedContinent.id} color={selectedContinent.color} className="drawer-art" /><button ref={close} className="drawer-close icon-button" aria-label="Close pathway" onClick={() => setSelected(null)}><X /></button><span className="eyebrow">{selectedContinent.tagline.toUpperCase()}</span></div>
        <div className="drawer-body">
          <div className="breadcrumb"><button onClick={() => { setCategory(selectedContinent.id); setQuery(''); setSavedOnly(false); setSelected(null); explore(); }}>{selectedContinent.name}</button><ChevronRight size={13} /><span>Learning pathway</span></div>
          <h2 id="pathway-title">{selected.title}</h2>
          <div className="drawer-meta"><span><BookOpen size={16} />{selected.lessons.length} lessons</span><button onClick={() => save(selected.id)}>{saved.includes(selected.id) ? <Check size={16} /> : <Bookmark size={16} />} {saved.includes(selected.id) ? 'Saved to collection' : 'Save for later'}</button></div>
          <p className="lesson-intro">{selected.description}</p>
          <ol className="lessons">
            {selected.lessons.map((l, i) => {
              const open = openLesson === l.id;
              return <li key={l.id} className={open ? 'open' : ''}>
                <button aria-expanded={open} onClick={() => setOpenLesson(open ? null : l.id)}>
                  <span className="lesson-number">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lesson-title">{l.title}{!l.body && <span className="draft-badge">Draft</span>}</span>
                  <ChevronDown size={16} />
                </button>
                {open && <div className="lesson-body"><p className="lesson-summary">{l.summary}</p>{l.body ? l.body.split(/\n{2,}/).map((para, j) => <p key={j}>{para}</p>) : <p className="stub-note">This lesson is a stub. Add a <code>body</code> to it in <code>apps/web/src/catalogue.ts</code> to publish it.</p>}</div>}
              </li>;
            })}
          </ol>
        </div>
      </section>
    </div>}
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
