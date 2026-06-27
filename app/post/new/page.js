'use client';
import { useState } from 'react';
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

  if (!user) return <div className="card p-6 text-center">Entre para postar. <a href="/login" className="text-brand underline">Login</a></div>;

  function pick(e) {
    const f = e.target.files?.[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return alert('Escolha uma imagem');
    setLoading(true);
    try {
      const url = await uploadImage(file, user.id, 'posts');
      const { error } = await supabase.from('posts').insert({ user_id: user.id, image_url: url, caption });
      if (error) throw error;
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
        <button className="btn w-full" disabled={loading}>{loading?'Enviando...':'Publicar'}</button>
      </form>
    </div>
  );
}
