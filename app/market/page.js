'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import ListingCard from '@/components/ListingCard';

const CATS = ['todos','eletronicos','moveis','moda','veiculos','imoveis','servicos','outros'];

export default function MarketPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('todos');
  const [city, setCity] = useState('');

  async function load() {
    let query = supabase.from('listings').select('*, profiles(username)').eq('status','ativo').order('created_at',{ascending:false}).limit(60);
    if (cat !== 'todos') query = query.eq('category', cat);
    if (city.trim()) query = query.ilike('city', `%${city.trim()}%`);
    if (q.trim()) query = query.ilike('title', `%${q.trim()}%`);
    const { data } = await query;
    setItems(data || []);
  }
  useEffect(() => { load(); }, [cat]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Mercado</h1>
        {user && <Link href="/market/new" className="btn">+ Anunciar</Link>}
      </div>
      <div className="card p-3 mb-4 space-y-2">
        <div className="flex gap-2">
          <input className="input" placeholder="Buscar produto/serviço..." value={q} onChange={e=>setQ(e.target.value)} />
          <input className="input w-40" placeholder="Cidade" value={city} onChange={e=>setCity(e.target.value)} />
          <button onClick={load} className="btn">Buscar</button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATS.map(c => (
            <button key={c} onClick={()=>setCat(c)} className={"px-3 py-1 rounded-full text-sm "+(cat===c?'bg-brand text-white':'bg-gray-100 text-gray-600')}>{c}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map(l => <ListingCard key={l.id} l={l} />)}
      </div>
      {items.length===0 && <p className="text-center text-gray-500 py-10">Nenhum anúncio encontrado.</p>}
    </div>
  );
}
