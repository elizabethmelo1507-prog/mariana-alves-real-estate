import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AIAssistant from '../../components/AIAssistant';
import IntroLoader from '../../components/IntroLoader';
import { supabase } from '../../lib/supabase';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const [logoRect, setLogoRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect();
      setLogoRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  }, []);

  const quickActions = [
    { label: 'Catálogo Completo', icon: 'home_work', path: '/catalog', desc: 'Explore todos os imóveis disponíveis.' },
    { label: 'Lançamentos', icon: 'new_releases', path: '/launches', desc: 'As melhores oportunidades na planta.' },
    { label: 'Simulação de Crédito', icon: 'calculate', path: '/simulation', desc: 'Saiba quanto você pode financiar.' },
    { label: 'Avalie seu Imóvel', icon: 'analytics', path: '/evaluation', desc: 'Consultoria gratuita de mercado.' },
    { label: 'Agendar Visita', icon: 'calendar_month', path: '/schedule-visit', desc: 'Conheça seu novo lar.' },
  ];

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(3)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setFeatured(data);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const profileImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDJIZwwSiX-4gH0pJ5abnEQF5PybRxHJxaOaliz31VzfdDxUhdIi7lWTHtvWJRvTBPt_YNEPAmlEZ7l9fhaoQwAZZaIQnqnNhtuluBM_Kiz52fhlCEQh-J9imy7oAchZwKI1ZMNK6ce9GmB4S65iZL87jR1fIsE5I0yLRmQw9TNRuAgBIbM8plFgSVJTeFcm7NZnARIPvB0q6Bm2602JVTe5M8olub-WrqhwR0lUEsKCkVrhG2fyhvJX8oeKCPphjYuJPpXi8qjTdc";

  return (
    <div className="min-h-screen bg-white">
      {showIntro && (
        <IntroLoader
          targetRect={logoRect}
          onComplete={() => {
            // Wait for the move animation to finish (1.2s) before swapping
            setTimeout(() => {
              setIntroFinished(true);
              // Remove loader immediately to prevent duplication/overlap
              setShowIntro(false);
            }, 1200);
          }}
        />
      )}
      <AIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Hero Header */}
      <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onDoubleClick={() => navigate('/admin/login')}
          >
            <div ref={logoRef} className="size-10 flex items-center justify-center transition-transform group-hover:rotate-12">
              {/* Replaced 'domain' icon with the House SVG */}
              <svg
                viewBox="0 0 24 24"
                className={`size-6 text-primary transition-opacity duration-500 ${introFinished ? 'opacity-100' : 'opacity-0'}`}
                style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h1 className="font-black text-xl tracking-tighter text-dark-accent">MA Real Estate</h1>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/catalog')} className="text-sm font-bold text-gray-500 hover:text-dark-accent transition-colors">Propriedades</button>
            <button onClick={() => navigate('/launches')} className="text-sm font-bold text-gray-500 hover:text-dark-accent transition-colors">Lançamentos</button>
            <button onClick={() => navigate('/simulation')} className="text-sm font-bold text-gray-500 hover:text-dark-accent transition-colors">Simulação</button>
            <button onClick={() => navigate('/contact')} className="bg-primary text-black px-6 py-2.5 rounded-full text-sm font-black transition-active shadow-lg shadow-primary/20">Falar com Mariana</button>
          </div>

          <button onClick={() => navigate('/contact')} className="md:hidden p-2 rounded-full text-primary">
            <span className="material-symbols-outlined text-2xl">chat</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-12 md:py-20 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in order-2 md:order-1">
            {/* Mobile Profile Image */}
            <div className="md:hidden flex flex-col items-center mb-8">
              <div className="relative">
                <div className="size-32 rounded-full ring-4 ring-primary/20 p-1 overflow-hidden">
                  <img
                    src={profileImageUrl}
                    className="size-full rounded-full object-cover shadow-lg"
                    alt="Mariana Alves"
                  />
                </div>
                <div className="absolute bottom-1 right-1 bg-primary text-black size-8 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm font-bold">verified</span>
                </div>
              </div>
              <div className="text-center mt-3">
                <h2 className="text-xl font-black text-dark-accent">Mariana Alves</h2>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[2px]">CRECI AM-12345</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 w-full md:w-auto justify-center md:justify-start">
              <span className="size-2 bg-primary rounded-full animate-pulse"></span>
              Imóveis de Alto Padrão em Manaus
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-dark-accent leading-[1] md:leading-[0.9] tracking-tighter mb-8 text-center md:text-left">
              Onde o luxo <br className="hidden md:block" />encontra a <span className="text-primary">Amazônia.</span>
            </h2>
            <p className="text-base md:text-lg text-gray-500 mb-10 max-w-md leading-relaxed text-center md:text-left mx-auto md:mx-0">
              Encontre sua nova residência nos bairros mais nobres de Manaus com consultoria especializada e atendimento personalizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/catalog')} className="bg-dark-accent text-white h-16 px-10 rounded-2xl font-black text-lg transition-active flex items-center justify-center gap-3">
                Ver Catálogo
                <span className="material-symbols-outlined">map</span>
              </button>
              <button onClick={() => setIsAiOpen(true)} className="bg-white border-2 border-gray-100 h-16 px-10 rounded-2xl font-black text-lg transition-active flex items-center justify-center gap-3">
                Consultoria IA
                <span className="material-symbols-outlined text-primary">smart_toy</span>
              </button>
            </div>
          </div>

          <div className="hidden md:block relative order-1 md:order-2">
            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl rotate-2 transition-transform hover:rotate-0 duration-700">
              <img
                src={profileImageUrl}
                className="w-full object-cover"
                alt="Mariana Alves"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl z-20 border border-gray-100">
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">CRECI AM-12345</p>
              <p className="text-xl font-black text-dark-accent">Mariana Alves</p>
              <div className="flex items-center gap-1 text-gray-400 mt-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="text-xs font-bold">Corretora Credenciada</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Quick Access */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-black tracking-tight mb-4">Serviços Exclusivos</h3>
          <p className="text-gray-500">Tudo o que você precisa para realizar o melhor negócio imobiliário.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {quickActions.map(action => (
            <div
              key={action.path}
              onClick={() => navigate(action.path)}
              className="btn-liquido bg-slate-50 p-8 rounded-[32px] hover:shadow-2xl hover:shadow-primary/10 border-2 border-transparent transition-all cursor-pointer group flex flex-col items-start text-left h-full"
            >
              <div className="bg-white size-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-transparent group-hover:border-2 group-hover:border-black transition-colors z-10 relative">
                <span className="material-symbols-outlined text-dark-accent text-3xl group-hover:text-black">{action.icon}</span>
              </div>
              <h4 className="font-black text-xl mb-2 relative z-10 group-hover:text-black">{action.label}</h4>
              <p className="text-sm text-gray-500 leading-relaxed relative z-10 group-hover:text-black/70">{action.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Grid */}
      <section className="py-24 bg-dark-accent text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <h3 className="text-4xl font-black tracking-tight mb-4">Propriedades em Destaque</h3>
              <p className="text-gray-400 max-w-md">Uma seleção rigorosa dos imóveis mais luxuosos de Manaus prontos para você.</p>
            </div>
            <button onClick={() => navigate('/catalog')} className="text-primary font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:translate-x-2 transition-transform">
              Ver Catálogo Completo
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-white/5 rounded-[32px] animate-pulse" />
              ))
            ) : featured.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white/5 rounded-[32px]">
                <p className="text-gray-400 font-bold">Novas oportunidades em breve.</p>
              </div>
            ) : (
              featured.map(item => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-6">
                    <img src={item.image} className="size-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold">{item.neighborhood}</div>
                  </div>
                  <h4 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-primary text-3xl font-black mb-6">
                    {item.is_under_consultation ? 'Sob Consulta' : formatCurrency(item.price)}
                  </p>
                  <button onClick={() => navigate(`/property/${item.id}`)} className="w-full bg-white/5 border border-white/10 hover:bg-primary hover:text-black h-14 rounded-2xl font-black transition-all">
                    Detalhes do Imóvel
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer Desktop */}
      <footer className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-dark-accent size-12 rounded-2xl flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="size-7 text-primary"
                  style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <h2 className="font-black text-2xl tracking-tighter">MA Real Estate</h2>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed mb-8">
              Referência em mercado imobiliário de alto padrão no Amazonas. Transformando a experiência de compra e venda de imóveis.
            </p>
            <div className="flex gap-4">
              {['instagram', 'facebook', 'linkedin'].map(i => (
                <div key={i} className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black cursor-pointer transition-all">
                  <span className="material-symbols-outlined text-xl">share</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-black text-lg mb-6 tracking-tight">Navegação</h5>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><button onClick={() => navigate('/catalog')} className="hover:text-primary transition-colors">Catálogo Completo</button></li>
              <li><button onClick={() => navigate('/launches')} className="hover:text-primary transition-colors">Lançamentos</button></li>
              <li><button onClick={() => navigate('/simulation')} className="hover:text-primary transition-colors">Simulador Financeiro</button></li>
              <li><button onClick={() => navigate('/evaluation')} className="hover:text-primary transition-colors">Avaliação Profissional</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-black text-lg mb-6 tracking-tight">Contato</h5>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">phone</span>
                (92) 99999-9999
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">mail</span>
                contato@marianaalves.com.br
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Adrianópolis, Manaus - AM
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">© 2024 Mariana Alves Corretora de Imóveis • CRECI AM-12345</p>
          <button onDoubleClick={() => navigate('/admin/login')} className="text-gray-300 text-[10px] uppercase font-black hover:text-primary transition-colors underline decoration-dotted">Acesso Restrito</button>
        </div>
      </footer>

      {/* Floating Action Mobile */}
      <div className="fixed bottom-6 right-6 z-[100] md:hidden">
        <button
          onClick={() => setIsAiOpen(true)}
          className="bg-primary text-black rounded-full p-5 shadow-2xl shadow-primary/40 hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-3xl font-bold">smart_toy</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
