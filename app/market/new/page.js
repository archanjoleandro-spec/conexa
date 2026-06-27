'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/upload';
import { useAuth } from '@/components/AuthProvider';

const CATS = ['eletronicos','moveis','moda','veiculos','imoveis','servicos','outros'];

export default function NewListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ title:'', description:'', price:'', category:'outros', kind:'produto', city:'' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return <div className="card p-6 text-center">Entre para anunciar. <a href="/login" className="text-brand underline">Login</a></div>;
  const set = (k,v) => setF(s=>({...s,[k]:v}));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let url = null;
      if (file) url = await uploadImage(file, user.id, 'listings');
      const { error } = await supabase.from('listings').insert({
        user_id: user.id, title: f.title, description: f.description,
        price: f.price ? Number(f.price) : null, category: f.category, kind: f.kind,
        city: f.city, image_url: url,
      });
      if (error) throw error;
      router.push('/market');
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h1 className="text-lg font-bold mb-4">Novo anúncio</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><label className="label">Título</label><input required className="input" value={f.title} onChange={e=>set('title',e.target.value)} /></div>
        <div><label className="label">Descrição</label><textarea className="input" rows={3} value={f.description} onChange={e=>set('description',e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Preço (R$)</label><input type="number" step="0.01" className="input" value={f.price} onChange={e=>set('price',e.target.value)} placeholder="Vazio = a combinar" /></div>
          <div><label className="label">Tipo</label>
            <select className="input" value={f.kind} onChange={e=>set('kind',e.target.value)}>
              <option value="produto">Produto</option><option value="servico">Serviço</option>
            </select></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Categoria</label>
            <select className="input" value={f.category} onChange={e=>set('category',e.target.value)}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select></div>
          <div><label className="label">Cidade</label><input className="input" value={f.city} onChange={e=>set('city',e.target.value)} /></div>
        </div>
        <div><label className="label">Foto</label><input type="file" accept="image/*" onChange={e=>{const x=e.target.files?.[0];setFile(x); if(x) setPreview(URL.createObjectURL(x));}} /></div>
        {preview && <img src={preview} className="w-full rounded-lg max-h-60 object-cover" />}
        <button className="btn w-full" disabled={loading}>{loading?'Publicando...':'Publicar anúncio'}</button>
      </form>
    </div>
  );
}
