'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ExplorePage() {
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState('');

  async function load() {
    let query = supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(40);
    if (q.trim()) query = query.or(`username.ilike.%${q.trim()}%,full_name.ilike.%${q.trim()}%,city.ilike.%${q.trim()}%`);
    const { data } = await query;
    setPeople(data || []);
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Explorar pessoas</h1>
      <div className="flex gap-2 mb-4">
        <input className="input" placeholder="Buscar por nome, usuário ou cidade..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} />
        <button onClick={load} className="btn">Buscar</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {people.map(p => (
          <Link key={p.id} href={`/u/${p.username}`} className="card p-3 flex items-center gap-3 hover:shadow">
            <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center font-bold text-brand text-lg">
              {(p.username||'?')[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{p.full_name || p.username}</p>
              <p className="text-sm text-gray-500">@{p.username}{p.city?` · ${p.city}`:''}</p>
            </div>
          </Link>
        ))}
      </div>
      {people.length===0 && <p className="text-center text-gray-500 py-10">Ninguém encontrado.</p>}
    </div>
  );
}
