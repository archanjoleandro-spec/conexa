'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

function tempo(d) {
  if (!d) return '';
  const diff = (Date.now() - new Date(d).getTime()) / 60000;
  if (diff < 60) return `há ${Math.max(1, Math.round(diff))} min`;
  if (diff < 1440) return `há ${Math.round(diff / 60)}h`;
  return `há ${Math.round(diff / 1440)}d`;
}
const nfmt = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n || 0);

export default function DescubraPage() {
  const { user } = useAuth();
  const [cats, setCats] = useState([]);
  const [arts, setArts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [novelas, setNovelas] = useState([]);
  const [aba, setAba] = useState('todos');
  const [saved, setSaved] = useState(new Set());
  const [liked, setLiked] = useState(new Set());
  const [ready, setReady] = useState(false);
  const [spot, setSpot] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: a }, { data: mm }, { data: nv }] = await Promise.all([
        supabase.from('news_categories').select('*').order('ordem'),
        supabase.from('news_articles').select('*').order('publicado_em', { ascending: false }).limit(60),
        supabase.from('live_matches').select('*').limit(40),
        supabase.from('novelas').select('*').limit(12),
      ]);
      setCats(c || []); setArts(a || []); setMatches(mm || []); setNovelas(nv || []); setReady(true);
      if (user) {
        const [{ data: s }, { data: l }] = await Promise.all([
          supabase.from('news_saves').select('article_id').eq('user_id', user.id),
          supabase.from('news_likes').select('article_id').eq('user_id', user.id),
        ]);
        setSaved(new Set((s || []).map((x) => x.article_id)));
        setLiked(new Set((l || []).map((x) => x.article_id)));
      }
    })();
  }, [user]);

  useEffect(() => { const t = setInterval(() => setSpot((s) => s + 1), 5000); return () => clearInterval(t); }, []);
  useEffect(() => { try { const c = new URLSearchParams(window.location.search).get('cat'); if (c) setAba(c); } catch (e) {} }, []);

  const corDe = (id) => cats.find((c) => c.id === id)?.cor || '#7c3aed';
  const nomeDe = (id) => cats.find((c) => c.id === id)?.nome || id;

  const lista = aba === 'todos' ? arts : arts.filter((a) => a.categoria_id === aba);
  const destaques = arts.filter((a) => a.destaque).slice(0, 3);
  const emAlta = [...arts].sort((x, y) => (y.views || 0) - (x.views || 0)).slice(0, 6);
  const fmtData = (d) => { if (!d) return ''; const x = new Date(d); return x.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + x.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
  const proximos = matches.filter((m) => m.status === 'agendado').sort((a, b) => new Date(a.inicio) - new Date(b.inicio)).slice(0, 4);
  const resultados = matches.filter((m) => m.status === 'encerrado').sort((a, b) => new Date(b.inicio) - new Date(a.inicio)).slice(0, 4);
  const jogos = [...proximos, ...resultados];

  const _porCat = {};
  arts.forEach((a) => { (_porCat[a.categoria_id] = _porCat[a.categoria_id] || []).push(a); });
  const mix = []; let _r = 0; let _added = true;
  while (_added && mix.length < 14) { _added = false; for (const k of Object.keys(_porCat)) { if (_porCat[k][_r]) { mix.push(_porCat[k][_r]); _added = true; } } _r++; }

  async function toggleSave(id) {
    if (!user) return alert('Entre para salvar');
    const has = saved.has(id); const ns = new Set(saved);
    if (has) { ns.delete(id); await supabase.from('news_saves').delete().eq('article_id', id).eq('user_id', user.id); }
    else { ns.add(id); await supabase.from('news_saves').insert({ article_id: id, user_id: user.id }); }
    setSaved(ns);
  }
  async function toggleLike(id) {
    if (!user) return alert('Entre para curtir');
    const has = liked.has(id); const nl = new Set(liked);
    if (has) { nl.delete(id); await supabase.from('news_likes').delete().eq('article_id', id).eq('user_id', user.id); }
    else { nl.add(id); await supabase.from('news_likes').insert({ article_id: id, user_id: user.id }); }
    setLiked(nl);
  }

  const Tag = ({ id }) => (
    <span className="text-[11px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: corDe(id) }}>{nomeDe(id)}</span>
  );

  function Card({ a, big }) {
    return (
      <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group flex flex-col">
        <div className={'relative overflow-hidden bg-gray-100 ' + (big ? 'h-56' : 'h-40')}>
          {a.imagem_url && <img src={a.imagem_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />}
          <span className="absolute top-2 left-2"><Tag id={a.categoria_id} /></span>
          {a.ao_vivo && <span className="absolute top-2 right-2 text-[11px] font-bold bg-red-600 text-white rounded-full px-2 py-0.5 animate-pulse">🔴 AO VIVO</span>}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className={'font-bold leading-snug ' + (big ? 'text-lg' : 'text-base')}>{a.titulo}</h3>
          {a.resumo && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.resumo}</p>}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 pt-2 border-t border-gray-50">
            <span className="truncate max-w-[110px]">{a.fonte_nome || 'Fonte'}</span><span>·</span><span className="whitespace-nowrap">{tempo(a.publicado_em)}</span>
            <div className="ml-auto flex items-center gap-3">
              <button onClick={() => toggleLike(a.id)} className={liked.has(a.id) ? 'text-red-600 font-semibold' : 'hover:text-gray-600'}>{liked.has(a.id) ? '♥' : '♡'} {nfmt(a.views)}</button>
              <button onClick={() => toggleSave(a.id)} className={saved.has(a.id) ? 'text-brand font-semibold' : 'hover:text-gray-600'}>🔖</button>
              {a.url_fonte && <a href={a.url_fonte} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold">ler mais →</a>}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl mb-5 bg-gradient-to-br from-gray-900 via-indigo-900 to-fuchsia-900 text-white p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-fuchsia-500/30 rounded-full blur-3xl" />
        <div className="absolute right-24 bottom-0 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-lg">
          <span className="inline-block text-xs font-bold bg-white/15 rounded-full px-3 py-1 mb-3">🚀 EM ALTA AGORA</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Tudo que tá bombando,<br />num só lugar</h1>
          <p className="mt-2 text-white/80 max-w-md">Notícias, esportes, novelas, famosos, economia e curiosidades — atualizado o dia todo.</p>
          <a href="#giro" className="inline-block mt-4 bg-white text-gray-900 font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-gray-100 transition">Ver agora</a>
        </div>
        <svg viewBox="0 0 200 200" className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 w-44 h-44 opacity-95" fill="none">
          <ellipse cx="100" cy="172" rx="34" ry="8" fill="#000" opacity="0.25" />
          <path d="M100 30c26 18 34 46 34 74l-20 20H86l-20-20c0-28 8-56 34-74z" fill="#ffffff" />
          <circle cx="100" cy="86" r="14" fill="#6d28d9" />
          <circle cx="100" cy="86" r="7" fill="#c4b5fd" />
          <path d="M66 118l-18 10 4-26 18-6z" fill="#ec4899" />
          <path d="M134 118l18 10-4-26-18-6z" fill="#ec4899" />
          <path d="M86 148h28l-8 22-6 8-6-8z" fill="#f59e0b" />
          <path d="M92 158h16l-4 14-4 6-4-6z" fill="#fbbf24" />
        </svg>
      </div>

      {mix.length > 0 && (() => { const s = mix[spot % mix.length]; return (
        <a id="giro" href={s.url_fonte} target="_blank" rel="noopener noreferrer" className="block relative rounded-2xl overflow-hidden mb-5 shadow-lg min-h-[200px]">
          {s.imagem_url && <img src={s.imagem_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="relative p-5 sm:p-6 flex flex-col justify-end min-h-[200px] text-white">
            <div className="flex items-center gap-2 mb-2">
              <Tag id={s.categoria_id} />
              <span className="text-[11px] font-bold bg-white/20 rounded-full px-2 py-0.5">🔄 GIRO DO MOMENTO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight line-clamp-3">{s.titulo}</h2>
            <div className="flex items-center gap-1.5 mt-3">
              {mix.slice(0, 10).map((_, i) => (<span key={i} onClick={(e) => { e.preventDefault(); setSpot(i); }} className={'h-1.5 rounded-full cursor-pointer transition-all ' + ((spot % mix.length) === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50')} />))}
            </div>
          </div>
        </a>
      ); })()}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {[{ id: 'todos', nome: 'Para você' }, ...cats].map((c) => (
          <button key={c.id} onClick={() => setAba(c.id)} className={'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ' + (aba === c.id ? 'bg-brand text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand')}>{c.nome}</button>
        ))}
      </div>

      <div className="lg:flex lg:gap-6">
        <div className="lg:flex-1 min-w-0">
          {(aba === 'todos' || aba === 'esportes') && jogos.length > 0 && (
            <div className="mb-6">
              <h2 className="font-bold mb-2 flex items-center gap-2">⚽ Placar &amp; Jogos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jogos.map((m) => (
                  <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400 truncate">{m.campeonato}</span>
                      {m.status === 'encerrado'
                        ? <span className="text-gray-500 font-bold">ENCERRADO</span>
                        : <span className="text-green-600 font-semibold whitespace-nowrap">📅 {fmtData(m.inicio)}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm flex-1 truncate">{m.time_casa}</span>
                      <span className="font-extrabold text-brand">{m.status === 'encerrado' ? ((m.placar_casa ?? 0) + ' x ' + (m.placar_fora ?? 0)) : 'x'}</span>
                      <span className="font-semibold text-sm flex-1 truncate text-right">{m.time_fora}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aba === 'todos' && destaques.length > 0 && (
            <div className="mb-6">
              <h2 className="font-bold mb-2">⭐ Destaques do dia</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {destaques.map((a) => <Card key={a.id} a={a} big />)}
              </div>
            </div>
          )}

          {aba === 'novelas' && novelas.length > 0 && (
            <div className="mb-6">
              <h2 className="font-bold mb-2 flex items-center gap-2">📺 Novelas em cartaz</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {novelas.map((nv) => (
                  <div key={nv.id} className="min-w-[150px] max-w-[150px] bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="aspect-[3/4] bg-gray-100">{nv.capa_url && <img src={nv.capa_url} className="w-full h-full object-cover" alt="" />}</div>
                    <div className="p-2">
                      <p className="font-bold text-sm line-clamp-1">{nv.nome}</p>
                      <p className="text-[11px] text-gray-500">{nv.emissora}</p>
                      <p className="text-[11px] text-pink-600 font-semibold">{nv.horario}</p>
                      {nv.streaming && <span className="inline-block mt-1 text-[10px] font-bold bg-pink-100 text-pink-700 rounded px-1.5 py-0.5">▶ {nv.streaming}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="font-bold mb-2">{aba === 'todos' ? '📰 Para você' : nomeDe(aba)}</h2>
          {!ready && <p className="text-gray-400 py-8 text-center">Carregando...</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lista.map((a) => <Card key={a.id} a={a} />)}
          </div>
          {ready && lista.length === 0 && <p className="text-gray-500 text-center py-8">Nada por aqui ainda.</p>}
        </div>

        <aside className="lg:w-80 lg:shrink-0 mt-8 lg:mt-0 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">🔥 Em alta</h3>
            <div className="space-y-3">
              {emAlta.map((a, i) => (
                <a key={a.id} href={a.url_fonte || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                  <span className="text-lg font-extrabold text-gray-300 w-5 text-center">{i + 1}</span>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">{a.imagem_url && <img src={a.imagem_url} className="w-full h-full object-cover" alt="" />}</div>
                  <div className="min-w-0">
                    <Tag id={a.categoria_id} />
                    <p className="text-sm font-medium line-clamp-2 mt-0.5 group-hover:text-brand">{a.titulo}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white rounded-2xl p-5">
            <h3 className="font-bold text-lg">Anuncie e venda hoje</h3>
            <p className="text-white/85 text-sm mt-1">É rápido, fácil e seguro. Coloque seu produto no Mercado.</p>
            <a href="/market/new" className="inline-block mt-3 bg-white text-gray-900 font-semibold rounded-lg px-4 py-2 text-sm">Anunciar agora</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
