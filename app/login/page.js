'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username: username || email.split('@')[0] } },
        });
        if (error) throw error;
        setMsg('Conta criada! Se a confirmação por e-mail estiver ativa, verifique sua caixa. Tentando entrar...');
      }
      const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
      if (e2) throw e2;
      router.push('/');
    } catch (err) {
      setMsg(err.message || 'Erro');
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-sm mx-auto card p-6 mt-6">
      <h1 className="text-2xl font-bold mb-1 text-brand">Vai Lá</h1>
      <p className="text-sm text-gray-500 mb-5">{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</p>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && (
          <div>
            <label className="label">Nome de usuário</label>
            <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="seu_usuario" />
          </div>
        )}
        <div>
          <label className="label">E-mail</label>
          <input type="email" required className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Senha</label>
          <input type="password" required minLength={6} className="input" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button className="btn w-full" disabled={loading}>{loading ? '...' : (mode==='login'?'Entrar':'Cadastrar')}</button>
      </form>
      {msg && <p className="text-sm mt-3 text-gray-600">{msg}</p>}
      <button onClick={()=>setMode(mode==='login'?'signup':'login')} className="text-sm text-brand mt-4 hover:underline">
        {mode==='login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
      </button>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username: username || email.split('@')[0] } },
        });
        if (error) throw error;
        setMsg('Conta criada! Se a confirmação por e-mail estiver ativa, verifique sua caixa. Tentando entrar...');
      }
      const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
      if (e2) throw e2;
      router.push('/');
    } catch (err) {
      setMsg(err.message || 'Erro');
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-sm mx-auto card p-6 mt-6">
      <h1 className="text-2xl font-bold mb-1 text-brand">Conexa</h1>
      <p className="text-sm text-gray-500 mb-5">{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</p>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && (
          <div>
            <label className="label">Nome de usuário</label>
            <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="seu_usuario" />
          </div>
        )}
        <div>
          <label className="label">E-mail</label>
          <input type="email" required className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Senha</label>
          <input type="password" required minLength={6} className="input" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button className="btn w-full" disabled={loading}>{loading ? '...' : (mode==='login'?'Entrar':'Cadastrar')}</button>
      </form>
      {msg && <p className="text-sm mt-3 text-gray-600">{msg}</p>}
      <button onClick={()=>setMode(mode==='login'?'signup':'login')} className="text-sm text-brand mt-4 hover:underline">
        {mode==='login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
      </button>
    </div>
  );
}
