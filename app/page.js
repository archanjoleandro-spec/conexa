'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import PostCard from '@/components/PostCard';

export default function FeedPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: raw } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url), comments(id, body, user_id, profiles(username)), likes(user_id)')
        .order('created_at', { ascending: false })
        .limit(50);
      const mapped = (raw||[]).map(p => ({
        ...p,
        likeCount: p.likes?.length || 0,
        likedByMe: user ? p.likes?.some(l=>l.user_id===user.id) : false,
        comments: p.comments || [],
      }));
      setPosts(mapped); setReady(true);
    })();
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold">Feed</h1>
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
