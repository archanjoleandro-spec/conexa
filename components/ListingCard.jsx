'use client';
import Link from 'next/link';

const fmt = (v) => v==null ? 'A combinar' : Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

export default function ListingCard({ l }) {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square bg-gray-100">
        {l.image_url ? <img src={l.image_url} className="w-full h-full object-cover" /> :
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🛍️</div>}
      </div>
      <div className="p-3">
        <p className="font-bold text-brand">{fmt(l.price)}</p>
        <p className="font-medium line-clamp-1">{l.title}</p>
        <p className="text-xs text-gray-500 line-clamp-1">{l.city || 'Sem local'} · {l.category}</p>
        <Link href={`/u/${l.profiles?.username}`} className="text-xs text-gray-400 hover:underline">@{l.profiles?.username}</Link>
      </div>
    </div>
  );
}
