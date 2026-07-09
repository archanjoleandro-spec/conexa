'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const SUGESTOES = ['Vasco', 'Casa moderna', 'iPhone', 'Novela', 'Receita de bolo', 'Fofoca', 'Copa', 'Viagem barata'];
const fmt = (v) => v == null ? 'A combinar' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const tempo = (d) => { if (!d) return ''; const m = (Date.now() - new Date(d).getTime()) / 60000; if (m < 60) return `há ${Math.max(1, Math.round(m))} min`; if (m < 1440) return `há ${Math.round(m / 60)}h`; if (m < 43200) return `há ${Math.round(m / 1440)}d`; return `há ${Math.round(m / 43200)} meses`; };

function comprar(q) {
  const t = encodeURIComponent(q);
  return [
    { nome: 'Shopping', cor: '#34A853', url: `https://www.google.com/search?tbm=shop&q=${t}` },
    { nome: 'Mercado Livre', cor: '#FFE600', fg: '#2D3277', url: `https://lista.mercadolivre.com.br/${t}` },
    { nome: 'Amazon', cor: '#FF9900', url: `https://www.amazon.com.br/s?k=${t}` },
    { nome: 'OLX', cor: '#6E0AD6', url: `https://www.olx.com.br/brasil?q=${t}` },
  ];
}

function Busca() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [web, setWeb] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setQ(sp.get('q') || ''); }, [sp]);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!q.trim()) { setWeb([]); setItems([]); setDone(false); return; }
    setLoading(true); setDone(false);
    timer.current = setTimeout(async () => {
      const term = q.trim();
      const [fn, lr] = await Promise.all([
        supabase.functions.invoke('search-web', { body: { q: term } }),
        supabase.from('listings').select('*, profiles(username)').eq('status', 'ativo').or(`title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`).limit(8),
      ]);
      let w = (fn && fn.data && fn.data.items) || [];
      w = w.sort((a, b) => new Date(b.publicado_em) - new Date(a.publicado_em));
      setWeb(w); setItems(lr.data || []); setLoading(false); setDone(true);
    }, 400);
    return () => clearTimeout(timer.current);
  }, [q]);

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1">Buscar</h1>
      <p className="text-sm text-gray-500 mb-4">Notícias, informações e produtos — na própria página</p>

      <div className="flex items-center gap-2 bg-white border-2 border-brand/30 focus-within:border-brand rounded-full px-4 py-2 shadow-sm">
        <span className="text-gray-400">🔎</span>
        <input autoFocus className="flex-1 outline-none bg-transparent" placeholder="Digite o que procura (ex: Vasco, casa moderna...)" value={q} onChange={e=>setQ(e.target.value)} />
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
          <div className="mt-5 mb-6">
            <h2 className="font-bold mb-2 flex items-center gap-2">🔎 Resultados para "<span className="text-brand">{q}</span>"</h2>
            {loading && <p className="text-gray-400 text-sm py-6 text-center">Buscando as notícias mais recentes...</p>}
            {done && !loading && web.length === 0 && (
              <p className="card p-4 text-sm text-gray-500">Não encontramos resultados agora. Tente outro termo.</p>
            )}
            <div className="space-y-2">
              {web.map((n, i) => (
                <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="card p-3 flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center shrink-0 text-lg">📰</div>
                  <div className="min-w-0">
                    <p className="font-medium leading-snug line-clamp-2 group-hover:text-brand">{n.titulo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.fonte} · {tempo(n.publicado_em)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-bold mb-2">🛒 No Mercado</h2>
            {done && !loading && items.length === 0 && (
              <div className="card p-4 bg-amber-50 border border-amber-200 text-center text-sm text-gray-700">
                Ninguém está ofertando <b>"{q}"</b> na nossa plataforma ainda — <Link href="/market/new" className="text-brand underline font-semibold">anuncie você mesmo</Link> ou veja onde comprar abaixo.
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
            <h2 className="font-bold mb-2 text-sm text-gray-500">Onde comprar "{q}"</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {comprar(q).map(l => (
                <a key={l.nome} href={l.url} target="_blank" rel="noopener noreferrer" className="rounded-lg py-2 text-sm font-bold text-center shadow-sm hover:opacity-90 transition" style={{ background: l.cor, color: l.fg || '#fff' }}>{l.nome} →</a>
              ))}
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
