
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('elizabethmelo1507@gmail.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'elizabethmelo1507@gmail.com' && password === '123456') {
      setError('');
      navigate('/admin/dashboard');
    } else {
      setError('Credenciais inválidas. Verifique o e-mail e a senha.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-dark-accent">
      <main className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="mb-8">
          <div className="size-16 bg-dark-accent rounded-2xl flex items-center justify-center shadow-xl shadow-black/10">
            <span className="text-primary font-extrabold text-2xl tracking-tighter">MA</span>
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-2xl font-extrabold tracking-tight mb-2">Área do Corretor</h1>
          <p className="text-gray-500 text-sm px-4">Faça login para gerenciar seus imóveis e leads.</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-pulse">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">E-mail</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
              <input 
                className="w-full bg-gray-50 border-gray-100 border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-4 pl-12 pr-4 transition-all outline-none text-sm shadow-sm" 
                placeholder="nome@exemplo.com" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Senha</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
              <input 
                className="w-full bg-gray-50 border-gray-100 border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-4 pl-12 pr-12 transition-all outline-none text-sm shadow-sm" 
                placeholder="••••••••" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-dark-accent text-white font-bold h-14 rounded-2xl mt-4 transition-active shadow-lg shadow-black/10 flex items-center justify-center gap-2">
            Entrar no Painel
            <span className="material-symbols-outlined text-primary text-xl">arrow_forward</span>
          </button>
        </form>

        <div className="mt-12 flex flex-col items-center gap-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-bold text-dark-accent hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Voltar para o site
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
