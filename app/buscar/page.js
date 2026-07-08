'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const SUGESTOES = ['iPhone', 'Sofá', 'Bicicleta', 'Notebook', 'Geladeira', 'Diarista', 'PlayStation', 'Tênis'];
const fmt = (v) => v == null ? 'A combinar' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function lojas(q) {
  const t = encodeURIComponent(q);
  return [
    { nome: 'Google', cor: '#4285F4', url: `https://www.google.com/search?q=${t}` },
    { nome: 'Google Shopping', cor: '#34A853', url: `https://www.google.com/search?tbm=shop&q=${t}` },
    { nome: 'Mercado Livre', cor: '#FFE600', fg: '#2D3277', url: `https://lista.mercadolivre.com.br/${t}` },
    { nome: 'Amazon', cor: '#FF9900', url: `https://www.amazon.com.br/s?k=${t}` },
    { nome: 'OLX', cor: '#6E0AD6', url: `https://www.olx.com.br/brasil?q=${t}` },
    { nome: 'Magalu', cor: '#0086FF', url: `https://www.magazineluiza.com.br/busca/${t}/` },
  ];
}

function WebOffers({ q }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {lojas(q).map(l => (
        <a key={l.nome} href={l.url} target="_blank" rel="noopener noreferrer"
          className="rounded-xl p-3 font-bold text-sm text-center shadow-sm hover:opacity-90 transition"
          style={{ background: l.cor, color: l.fg || '#fff' }}>{l.nome} →</a>
      ))}
    </div>
  );
}

function Busca() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setQ(sp.get('q') || ''); }, [sp]);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!q.trim()) { setItems([]); setDone(false); return; }
    setLoading(true); setDone(false);
    timer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('listings')
        .select('*, profiles(username)')
        .eq('status', 'ativo')
        .or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,category.ilike.%${q.trim()}%`)
        .limit(20);
      setItems(data || []); setLoading(false); setDone(true);
    }, 350);
    return () => clearTimeout(timer.current);
  }, [q]);

  const semItens = done && !loading && items.length === 0;

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1">Buscar</h1>
      <p className="text-sm text-gray-500 mb-4">Primeiro no Mostra e Vende — e as ofertas da web</p>

      <div className="flex items-center gap-2 bg-white border-2 border-brand/30 focus-within:border-brand rounded-full px-4 py-2 shadow-sm">
        <span className="text-gray-400">🔎</span>
        <input autoFocus className="flex-1 outline-none bg-transparent" placeholder="O que você está procurando?" value={q} onChange={e=>setQ(e.target.value)} />
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
          <div className="mt-6">
            <h2 className="font-bold mb-2">📍 No Mostra e Vende</h2>
            {loading && <p className="text-gray-400 text-sm py-4">Buscando...</p>}
            {semItens && (
              <div className="card p-5 bg-amber-50 border border-amber-200 text-center">
                <p className="text-gray-700 font-medium">Ninguém está ofertando <span className="font-bold">"{q}"</span> na nossa plataforma ainda.</p>
                <p className="text-sm text-gray-500 mt-1">Encontramos estas ofertas na internet 👇 — ou <Link href="/market/new" className="text-brand underline font-semibold">anuncie você mesmo</Link>.</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map(l => (
                <div key={l.id} className="card overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    {l.image_url ? <img src={l.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🛍️</div>}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-brand">{fmt(l.price)}</p>
                    <p className="font-medium line-clamp-1">{l.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{l.city || 'Sem local'} · {l.category}</p>
                    <Link href={`/u/${l.profiles?.username}`} className="text-xs text-gray-400 hover:underline">@{l.profiles?.username}</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-bold mb-2 flex items-center gap-2">🌐 Ofertas na web para "<span className="text-brand">{q}</span>"</h2>
            <WebOffers q={q} />
            <p className="text-[11px] text-gray-400 mt-1">Os links abrem a busca real de cada site em nova aba.</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return <Suspense fallback={<p className="text-center py-10 text-gray-400">Carregando...</p>}><Busca /></Suspense>;
}
