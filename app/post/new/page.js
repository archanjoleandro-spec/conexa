'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/upload';
import { useAuth } from '@/components/AuthProvider';

export default function NewPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [trackId, setTrackId] = useState(null);
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    supabase.from('tracks').select('*').order('titulo').then(({ data }) => setTracks(data || []));
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  if (!user) return <div className="card p-6 text-center">Entre para postar. <a href="/login" className="text-brand underline">Login</a></div>;

  function pick(e) {
    const f = e.target.files?.[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  function previewTrack(t) {
    if (!audioRef.current) audioRef.current = new Audio();
    if (playing === t.id) { audioRef.current.pause(); setPlaying(null); return; }
    audioRef.current.src = t.url_audio;
    audioRef.current.play().catch(() => {});
    audioRef.current.onended = () => setPlaying(null);
    setPlaying(t.id);
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return alert('Escolha uma imagem');
    setLoading(true);
    try {
      const url = await uploadImage(file, user.id, 'posts');
      const { error } = await supabase.from('posts').insert({ user_id: user.id, image_url: url, caption, track_id: trackId });
      if (error) throw error;
      if (audioRef.current) audioRef.current.pause();
      router.push('/');
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h1 className="text-lg font-bold mb-4">Nova foto</h1>
      <form onSubmit={submit} className="space-y-4">
        <input type="file" accept="image/*" onChange={pick} />
        {preview && <img src={preview} className="w-full rounded-lg max-h-80 object-cover" />}
        <textarea className="input" rows={3} placeholder="Legenda..." value={caption} onChange={e=>setCaption(e.target.value)} />
        <div>
          <p className="font-semibold text-sm mb-2 flex items-center gap-2">🎵 Trilha sonora <span className="text-xs font-normal text-gray-400">(opcional · músicas livres)</span></p>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {tracks.map(t => (
              <div key={t.id} onClick={() => setTrackId(trackId === t.id ? null : t.id)} className={'flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ' + (trackId === t.id ? 'border-brand bg-brand/5' : 'border-transparent hover:bg-gray-50')}>
                <button type="button" onClick={(e) => { e.stopPropagation(); previewTrack(t); }} className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center shrink-0">{playing === t.id ? '⏸' : '▶'}</button>
                <img src={t.capa_url} alt="" className="w-9 h-9 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.titulo}</p>
                  <p className="text-xs text-gray-400 truncate">{t.artista} · {t.genero}</p>
                </div>
                {trackId === t.id && <span className="text-brand text-sm font-bold">✓</span>}
              </div>
            ))}
          </div>
        </div>
        <button className="btn w-full" disabled={loading}>{loading ? 'Enviando...' : 'Publicar'}</button>
      </form>
    </div>
  );
}
