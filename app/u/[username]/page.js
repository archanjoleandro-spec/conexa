'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { getOrCreateConversation } from '@/lib/chat';
import ListingCard from '@/components/ListingCard';

export default function ProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const { user, profile, reloadProfile } = useAuth();
  const [p, setP] = useState(null);
  const [posts, setPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [counts, setCounts] = useState({ followers:0, following:0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [tab, setTab] = useState('posts');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name:'', bio:'', city:'' });

  const isMe = user && p && user.id === p.id;

  async function load() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
    if (!prof) { setP(false); return; }
    setP(prof);
    setForm({ full_name: prof.full_name||'', bio: prof.bio||'', city: prof.city||'' });
    const [{ data: po }, { data: li }, { count: fc }, { count: gc }] = await Promise.all([
      supabase.from('posts').select('*').eq('user_id', prof.id).order('created_at',{ascending:false}),
      supabase.from('listings').select('*, profiles(username)').eq('user_id', prof.id).order('created_at',{ascending:false}),
      supabase.from('follows').select('*',{count:'exact',head:true}).eq('following_id', prof.id),
      supabase.from('follows').select('*',{count:'exact',head:true}).eq('follower_id', prof.id),
    ]);
    setPosts(po||[]); setListings(li||[]); setCounts({ followers: fc||0, following: gc||0 });
    if (user) {
      const { data: f } = await supabase.from('follows').select('*').eq('follower_id',user.id).eq('following_id',prof.id).maybeSingle();
      setIsFollowing(!!f);
    }
  }
  useEffect(() => { if (username) load(); }, [username, user]);

  async function toggleFollow() {
    if (!user) return router.push('/login');
    if (isFollowing) {
      setIsFollowing(false); setCounts(c=>({...c,followers:c.followers-1}));
      await supabase.from('follows').delete().eq('follower_id',user.id).eq('following_id',p.id);
    } else {
      setIsFollowing(true); setCounts(c=>({...c,followers:c.followers+1}));
      await supabase.from('follows').insert({ follower_id:user.id, following_id:p.id });
    }
  }

  async function startChat() {
    if (!user) return router.push('/login');
    const conv = await getOrCreateConversation(user.id, p.id);
    router.push(`/messages?c=${conv.id}`);
  }

  async function saveProfile(e) {
    e.preventDefault();
    await supabase.from('profiles').update(form).eq('id', user.id);
    setEditing(false); reloadProfile && reloadProfile(); load();
  }

  if (p === false) return <p className="text-center py-10 text-gray-500">Perfil não encontrado.</p>;
  if (!p) return <p className="text-center py-10 text-gray-400">Carregando...</p>;

  return (
    <div>
      <div className="card p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-brand/15 flex items-center justify-center font-bold text-brand text-3xl">
            {(p.username||'?')[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{p.full_name || p.username}</h1>
            <p className="text-gray-500">@{p.username}{p.city?` · ${p.city}`:''}</p>
            <div className="flex gap-4 text-sm mt-1">
              <span><b>{posts.length}</b> posts</span>
              <span><b>{counts.followers}</b> seguidores</span>
              <span><b>{counts.following}</b> seguindo</span>
            </div>
          </div>
        </div>
        {p.bio && <p className="mt-3 text-gray-700">{p.bio}</p>}
        <div className="flex gap-2 mt-4">
          {isMe ? (
            <button onClick={()=>setEditing(!editing)} className="btn-ghost border border-gray-200">Editar perfil</button>
          ) : (
            <>
              <button onClick={toggleFollow} className={isFollowing?'btn-ghost border border-gray-200':'btn'}>{isFollowing?'Seguindo':'Seguir'}</button>
              <button onClick={startChat} className="btn-ghost border border-gray-200">Conversar</button>
            </>
          )}
        </div>
        {editing && (
          <form onSubmit={saveProfile} className="mt-4 space-y-2 border-t pt-4">
            <input className="input" placeholder="Nome" value={form.full_name} onChange={e=>setForm(s=>({...s,full_name:e.target.value}))} />
            <input className="input" placeholder="Cidade" value={form.city} onChange={e=>setForm(s=>({...s,city:e.target.value}))} />
            <textarea className="input" placeholder="Bio" value={form.bio} onChange={e=>setForm(s=>({...s,bio:e.target.value}))} />
            <button className="btn">Salvar</button>
          </form>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab('posts')} className={"px-4 py-1.5 rounded-full "+(tab==='posts'?'bg-brand text-white':'bg-gray-100')}>Fotos</button>
        <button onClick={()=>setTab('market')} className={"px-4 py-1.5 rounded-full "+(tab==='market'?'bg-brand text-white':'bg-gray-100')}>Anúncios</button>
      </div>

      {tab==='posts' ? (
        <div className="grid grid-cols-3 gap-1">
          {posts.map(po => <img key={po.id} src={po.image_url} className="aspect-square object-cover w-full rounded" />)}
          {posts.length===0 && <p className="col-span-3 text-center text-gray-500 py-8">Sem fotos.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {listings.map(l => <ListingCard key={l.id} l={l} />)}
          {listings.length===0 && <p className="col-span-3 text-center text-gray-500 py-8">Sem anúncios.</p>}
        </div>
      )}
    </div>
  );
}
