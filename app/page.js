'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import PostCard from '@/components/PostCard';

const brl = (v) => v == null ? 'A combinar' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FeedPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [ready, setReady] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    (async () => {
      const [{ data: raw }, { data: prod }, { data: news }] = await Promise.all([
        supabase.from('posts').select('*, profiles(username, avatar_url), comments(id, body, user_id, profiles(username)), likes(user_id)').order('created_at', { ascending: false }).limit(50),
        supabase.from('listings').select('*, profiles(username)').eq('status', 'ativo').order('created_at', { ascending: false }).limit(8),
        supabase.from('news_articles').select('id,titulo,imagem_url,categoria_id,fonte_nome').order('score', { ascending: false }).limit(8),
      ]);
      const mapped = (raw || []).map(p => ({
        ...p,
        likeCount: p.likes?.length || 0,
        likedByMe: user ? p.likes?.some(l => l.user_id === user.id) : false,
        comments: p.comments || [],
      }));
      setPosts(mapped); setProdutos(prod || []); setNoticias(news || []); setReady(true);
    })();
  }, [user]);

  return (
    <div>
      <Link href="/descubra" className="block rounded-2xl overflow-hidden mb-5 bg-gradient-to-r from-fuchsia-600 to-brand text-white p-5 shadow-lg hover:opacity-95 transition">
        <span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5">🔥 EM ALTA</span>
        <p className="text-lg font-extrabold mt-2 leading-tight">Veja o que tá bombando hoje no Mostra e Vende</p>
        <p className="text-white/90 text-sm">Notícias, esportes, novelas e curiosidades → toque para Descobrir</p>
      </Link>

      {produtos.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold flex items-center gap-2">🛒 Produtos em alta</h2>
            <Link href="/market" className="text-sm text-brand font-semibold">Ver mercado →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {produtos.map(l => (
              <Link key={l.id} href={`/u/${l.profiles?.username}`} className="min-w-[150px] max-w-[150px] card overflow-hidden hover:shadow">
                <div className="aspect-square bg-gray-100">
                  {l.image_url ? <img src={l.image_url} className="w-full h-full object-cover" alt="" /> :
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🛍️</div>}
                </div>
                <div className="p-2">
                  <p className="font-bold text-brand text-sm">{brl(l.price)}</p>
                  <p className="text-xs line-clamp-1">{l.title}</p>
                  <p className="text-[11px] text-gray-400 line-clamp-1">{l.city || 'Sem local'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {noticias.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold flex items-center gap-2">📰 Bombando agora</h2>
            <Link href="/descubra" className="text-sm text-brand font-semibold">Ver tudo →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {noticias.map(n => (
              <Link key={n.id} href="/descubra" className="min-w-[220px] max-w-[220px] card overflow-hidden hover:shadow">
                <div className="h-24 bg-gray-100">
                  {n.imagem_url && <img src={n.imagem_url} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="p-2">
                  <span className="text-[10px] font-bold uppercase text-fuchsia-600">{n.categoria_id}</span>
                  <p className="text-sm font-medium line-clamp-2">{n.titulo}</p>
                  <p className="text-[11px] text-gray-400">{n.fonte_nome}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between mb-4 pt-1 border-t border-gray-100">
        <h1 className="text-lg font-bold">📸 Feed</h1>
        {user && <Link href="/post/new" className="btn">+ Nova foto</Link>}
      </div>
      {!user && !loading && (
        <div className="card p-5 mb-5 text-center">
          <p className="mb-3 text-gray-600">Entre para postar, curtir, comentar e anunciar.</p>
          <Link href="/login" className="btn">Entrar / Cadastrar</Link>
        </div>
      )}
      {ready && posts.length === 0 && <p className="text-gray-500 text-center py-10">Nenhuma foto ainda. Seja o primeiro!</p>}
      {posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
