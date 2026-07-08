'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import ListingCard from '@/components/ListingCard';

const CATS = ['todos','eletronicos','moveis','moda','veiculos','imoveis','servicos','outros'];

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

export default function MarketPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('todos');
  const [city, setCity] = useState('');
  const [buscou, setBuscou] = useState('');

  async function load() {
    let query = supabase.from('listings').select('*, profiles(username)').eq('status','ativo').order('created_at',{ascending:false}).limit(60);
    if (cat !== 'todos') query = query.eq('category', cat);
    if (city.trim()) query = query.ilike('city', `%${city.trim()}%`);
    if (q.trim()) query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,category.ilike.%${q.trim()}%`);
    const { data } = await query;
    setItems(data || []);
    setBuscou(q.trim());
  }
  useEffect(() => { load(); }, [cat]);

  const semResultado = items.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Mercado</h1>
        {user && <Link href="/market/new" className="btn">+ Anunciar</Link>}
      </div>
      <div className="card p-3 mb-4 space-y-2">
        <div className="flex gap-2">
          <input className="input" placeholder="Buscar produto/serviço..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') load(); }} />
          <input className="input w-40" placeholder="Cidade" value={city} onChange={e=>setCity(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') load(); }} />
          <button onClick={load} className="btn">Buscar</button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATS.map(c => (<button key={c} onClick={()=>setCat(c)} className={"px-3 py-1 rounded-full text-sm "+(cat===c?'bg-brand text-white':'bg-gray-100 text-gray-600')}>{c}</button>))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map(l => <ListingCard key={l.id} l={l} />)}
      </div>

      {semResultado && !buscou && (
        <p className="text-center text-gray-500 py-10">Nenhum anúncio ainda. {user && <Link href="/market/new" className="text-brand underline">Seja o primeiro a anunciar!</Link>}</p>
      )}

      {semResultado && buscou && (
        <div className="mt-2">
          <div className="card p-5 bg-amber-50 border border-amber-200 text-center mb-4">
            <p className="text-gray-700 font-medium">Não temos <span className="font-bold">"{buscou}"</span> ofertado na nossa plataforma ainda.</p>
            <p className="text-sm text-gray-500 mt-1">Veja estas ofertas encontradas na internet 👇 {user && <>ou <Link href="/market/new" className="text-brand underline font-semibold">anuncie o seu</Link></>}.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {lojas(buscou).map(l => (
              <a key={l.nome} href={l.url} target="_blank" rel="noopener noreferrer" className="rounded-xl p-3 font-bold text-sm text-center shadow-sm hover:opacity-90 transition" style={{ background: l.cor, color: l.fg || '#fff' }}>{l.nome} →</a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
