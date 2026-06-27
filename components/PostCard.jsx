'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [comments, setComments] = useState(post.comments || []);
  const [text, setText] = useState('');
  const prof = post.profiles || {};

  async function toggleLike() {
    if (!user) return alert('Entre para curtir');
    if (liked) {
      setLiked(false); setLikes(l=>l-1);
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
    } else {
      setLiked(true); setLikes(l=>l+1);
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
    }
  }

  async function addComment(e) {
    e.preventDefault();
    if (!user) return alert('Entre para comentar');
    if (!text.trim()) return;
    const { data } = await supabase.from('comments')
      .insert({ post_id: post.id, user_id: user.id, body: text.trim() })
      .select('*, profiles(username)').single();
    if (data) setComments(c=>[...c, data]);
    setText('');
  }

  return (
    <article className="card overflow-hidden mb-5">
      <div className="flex items-center gap-3 p-3">
        <div className="w-9 h-9 rounded-full bg-brand/15 flex items-center justify-center font-bold text-brand">
          {(prof.username||'?')[0]?.toUpperCase()}
        </div>
        <Link href={`/u/${prof.username}`} className="font-semibold hover:underline">{prof.username || 'usuário'}</Link>
      </div>
      <img src={post.image_url} alt="" className="w-full bg-gray-100 object-cover max-h-[520px]" />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-4">
          <button onClick={toggleLike} className={"font-medium "+(liked?'text-red-600':'text-gray-700')}>
            {liked ? '♥' : '♡'} {likes}
          </button>
        </div>
        {post.caption && <p><span className="font-semibold">{prof.username}</span> {post.caption}</p>}
        <div className="space-y-1">
          {comments.map(c => (
            <p key={c.id} className="text-sm"><span className="font-semibold">{c.profiles?.username||'…'}</span> {c.body}</p>
          ))}
        </div>
        <form onSubmit={addComment} className="flex gap-2 pt-1">
          <input className="input flex-1 py-1.5" placeholder="Comentar..." value={text} onChange={e=>setText(e.target.value)} />
          <button className="btn-ghost text-brand">Enviar</button>
        </form>
      </div>
    </article>
  );
}
