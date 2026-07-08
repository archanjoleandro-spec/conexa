'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const SUGESTOES = ['Vasco', 'iPhone', 'Novela', 'Receita de bolo', 'PlayStation', 'Fofoca', 'Sofá', 'Copa'];
const fmt = (v) => v == null ? 'A combinar' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const tempo = (d) => { if (!d) return ''; const m = (Date.now() - new Date(d).getTime()) / 60000; if (m < 60) return `há ${Math.max(1, Math.round(m))} min`; if (m < 1440) return `há ${Math.round(m / 60)}h`; return `há ${Math.round(m / 1440)}d`; };

function web(q) {
  const t = encodeURIComponent(q);
  return {
    google: `https://www.google.com/search?q=${t}`,
    noticias: `https://news.google.com/search?q=${t}&hl=pt-BR&gl=BR&ceid=BR:pt-419`,
    shopping: `https://www.google.com/search?tbm=shop&q=${t}`,
    ml: `https://lista.mercadolivre.com.br/${t}`,
    amazon: `https://www.amazon.com.br/s?k=${t}`,
    olx: `https://www.olx.com.br/brasil?q=${t}`,
    magalu: `https://www.magazineluiza.com.br/busca/${t}/`,
  };
}

function Busca() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [news, setNews] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setQ(sp.get('q') || ''); }, [sp]);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!q.trim()) { setNews([]); setItems([]); setDone(false); return; }
    setLoading(true); setDone(false);
    timer.current = setTimeout(async () => {
      const term = q.trim();
      const [nr, lr] = await Promise.all([
        supabase.from('news_articles').select('id,titulo,resumo,url_fonte,imagem_url,categoria_id,publicado_em').or(`titulo.ilike.%${term}%,resumo.ilike.%${term}%`).order('publicado_em', { ascending: false }).limit(12),
        supabase.from('listings').select('*, profiles(username)').eq('status', 'ativo').or(`title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`).limit(12),
      ]);
      setNews(nr.data || []); setItems(lr.data || []); setLoading(false); setDone(true);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);

  const w = web(q || '');

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1">Buscar</h1>
      <p className="text-sm text-gray-500 mb-4">Notícias, produtos e ofertas — tudo num lugar</p>

      <div className="flex items-center gap-2 bg-white border-2 border-brand/30 focus-within:border-brand rounded-full px-4 py-2 shadow-sm">
        <span className="text-gray-400">🔎</span>
        <input autoFocus className="flex-1 outline-none bg-transparent" placeholder="Digite o que procura (ex: Vasco, iPhone...)" value={q} onChange={e=>setQ(e.target.value)} />
        {q && <button onClick={()=>setQ('')} className="text-gray-400 text-sm">✕</button>}
      </div>

      {!q && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-gray-600 mb-2">Buscas populares</p>
          <div className="flex gap-2 flex-wrap">
            {SUGESTOES.map(s => (<button key={s} onClick={()=>setQ(s)} className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm hover:border-brand">{s}</button>))}
          </div>
        </div>
      )}

      {q && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 mb-5">
            <a href={w.google} target="_blank" rel="noopener noreferrer" className="rounded-xl py-3 px-3 font-bold text-white text-center shadow-sm hover:opacity-90 transition" style={{ background: '#4285F4' }}>🔎 Buscar no Google →</a>
            <a href={w.noticias} target="_blank" rel="noopener noreferrer" className="rounded-xl py-3 px-3 font-bold text-white text-center shadow-sm hover:opacity-90 transition" style={{ background: '#D93025' }}>📰 Notícias no Google →</a>
            <a href={w.shopping} target="_blank" rel="noopener noreferrer" className="rounded-xl py-3 px-3 font-bold text-white text-center shadow-sm hover:opacity-90 transition" style={{ background: '#34A853' }}>🛒 Ofertas (Shopping) →</a>
          </div>

          <div className="mb-6">
            <h2 className="font-bold mb-2">📰 Notícias no Mostra e Vende</h2>
            {loading && <p className="text-gray-400 text-sm py-3">Buscando...</p>}
            {done && !loading && news.length === 0 && (
              <p className="text-sm text-gray-500 card p-4">Nenhuma notícia nossa sobre <b>"{q}"</b> ainda — toque em <a href={w.noticias} target="_blank" rel="noopener noreferrer" className="text-brand underline font-semibold">📰 Notícias no Google</a> acima.</p>
            )}
            <div className="space-y-2">
              {news.map(n => (
                <a key={n.id} href={n.url_fonte} target="_blank" rel="noopener noreferrer" className="card p-2 flex items-center gap-3 group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">{n.imagem_url && <img src={n.imagem_url} className="w-full h-full object-cover" alt="" />}</div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-brand">{n.categoria_id}</span>
                    <p className="font-medium line-clamp-2 group-hover:text-brand">{n.titulo}</p>
                    <p className="text-xs text-gray-400">{tempo(n.publicado_em)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-bold mb-2">🛒 No Mercado</h2>
            {done && !loading && items.length === 0 && (
              <div className="card p-4 bg-amber-50 border border-amber-200 text-center text-sm text-gray-700">
                Ninguém está ofertando <b>"{q}"</b> na nossa plataforma ainda. Veja as ofertas na web nos botões acima, ou <Link href="/market/new" className="text-brand underline font-semibold">anuncie você mesmo</Link>.
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map(l => (
                <div key={l.id} className="card overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    {l.image_url ? <img src={l.image_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🛍️</div>}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-brand">{fmt(l.price)}</p>
                    <p className="font-medium line-clamp-1">{l.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{l.city || 'Sem local'} · {l.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold mb-2 text-sm text-gray-500">Buscar "{q}" em outras lojas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a href={w.ml} target="_blank" rel="noopener noreferrer" className="rounded-lg py-2 text-sm font-bold text-center" style={{ background: '#FFE600', color: '#2D3277' }}>Mercado Livre →</a>
              <a href={w.amazon} target="_blank" rel="noopener noreferrer" className="rounded-lg py-2 text-sm font-bold text-center text-white" style={{ background: '#FF9900' }}>Amazon →</a>
              <a href={w.olx} target="_blank" rel="noopener noreferrer" className="rounded-lg py-2 text-sm font-bold text-center text-white" style={{ background: '#6E0AD6' }}>OLX →</a>
              <a href={w.magalu} target="_blank" rel="noopener noreferrer" className="rounded-lg py-2 text-sm font-bold text-center text-white" style={{ background: '#0086FF' }}>Magalu →</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return <Suspense fallback={<p className="text-center py-10 text-gray-400">Carregando...</p>}><Busca /></Suspense>;
}
