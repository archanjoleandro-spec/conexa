'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [q, setQ] = useState('');
  const router = useRouter();
  function go(e) {
    e.preventDefault();
    const t = q.trim();
    if (t) router.push('/buscar?q=' + encodeURIComponent(t));
  }
  return (
    <div className="sticky top-14 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-100">
      <form onSubmit={go} className="max-w-2xl mx-auto px-4 py-2">
        <div className="flex items-center gap-2 bg-white border border-gray-200 focus-within:border-brand rounded-full px-4 py-1.5 shadow-sm">
          <span className="text-gray-400">🔎</span>
          <input
            className="flex-1 outline-none bg-transparent text-sm"
            placeholder="Buscar produtos, serviços e ofertas na web..."
            value={q}
            onChange={e=>setQ(e.target.value)}
          />
          <button className="text-brand font-semibold text-sm shrink-0">Buscar</button>
        </div>
      </form>
    </div>
  );
}
