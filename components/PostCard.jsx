'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [comments, setComments] = useState(post.comments || []);
  const [text, setText] = useState('');
  const [track, setTrack] = useState(post.tracks || null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const prof = post.profiles || {};

  useEffect(() => {
    if (!track && post.track_id) {
      supabase.from('tracks').select('*').eq('id', post.track_id).single().then(({ data }) => setTrack(data));
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [post.track_id]);

  function togglePlay() {
    if (!track) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(track.url_audio);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  }

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
      <div className="relative">
        <img src={post.image_url} alt="" className="w-full bg-gray-100 object-cover max-h-[520px]" />
        {track && (
          <button onClick={togglePlay} className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur text-white rounded-full pl-1.5 pr-3 py-1.5 max-w-[75%] shadow-lg">
            <span className={'w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-xs shrink-0 ' + (playing ? 'animate-pulse' : '')}>{playing ? '⏸' : '▶'}</span>
            <span className="text-xs font-medium truncate">🎵 {track.artista} · {track.titulo}</span>
          </button>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-4">
          <button onClick={toggleLike} className={"font-medium "+(liked?'text-red-600':'text-gray-700')}>
            {liked ? '♥' : '♡'} {likes}
          </button>
          {track && (
            <button onClick={togglePlay} className="text-sm text-gray-500 flex items-center gap-1">
              <span>{playing ? '⏸' : '▶'}</span> {track.titulo}
            </button>
          )}
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
