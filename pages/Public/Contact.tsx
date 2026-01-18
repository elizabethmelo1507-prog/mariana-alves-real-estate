
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Contact: React.FC = () => {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    window.open('https://wa.me/5592982031507?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20falar%20com%20a%20Mariana!', '_blank');
  };

  const handleCall = () => {
    window.open('tel:5592982031507');
  };

  const handleEmail = () => {
    window.open('mailto:contato@marianaalves.com');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="font-extrabold tracking-tight text-lg">Fale Conosco</h1>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col md:flex-row">

          {/* Left Side - Hero & Info */}
          <div className="bg-dark-accent text-white p-10 md:w-1/2 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="size-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 text-primary">
                <span className="material-symbols-outlined text-4xl">support_agent</span>
              </div>
              <h2 className="text-4xl font-black mb-6 leading-tight">Como posso te ajudar hoje?</h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Estou disponível para tirar suas dúvidas, agendar visitas e encontrar o imóvel ideal para o seu momento.
              </p>
            </div>

            <div className="relative z-10 mt-12">
              <div className="flex items-center gap-3 text-primary mb-4">
                <span className="material-symbols-outlined">schedule</span>
                <span className="text-xs font-black uppercase tracking-widest">Horário de Atendimento</span>
              </div>
              <div className="space-y-2 text-sm font-medium text-gray-300">
                <p className="flex justify-between border-b border-white/10 pb-2">
                  <span>Segunda a Sexta</span>
                  <span className="text-white font-bold">08h às 18h</span>
                </p>
                <p className="flex justify-between pt-2">
                  <span>Sábado</span>
                  <span className="text-white font-bold">09h às 13h</span>
                </p>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -bottom-20 -right-20 size-80 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute top-20 -left-20 size-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>

          {/* Right Side - Actions */}
          <div className="p-10 md:w-1/2 flex flex-col justify-center space-y-6 bg-white">
            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] text-white p-6 rounded-3xl flex items-center gap-6 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#25D366]/20 group"
            >
              <div className="bg-white/20 size-16 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <span className="material-symbols-outlined text-4xl">chat</span>
              </div>
              <div className="text-left flex-1">
                <span className="block font-black text-xl mb-1">Conversar no WhatsApp</span>
                <span className="block text-sm font-bold opacity-90">Resposta rápida em 5 min</span>
              </div>
              <span className="material-symbols-outlined text-3xl opacity-50">arrow_outward</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleCall}
                className="w-full bg-gray-50 border border-gray-100 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-gray-100 hover:border-gray-200 group"
              >
                <div className="size-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-dark-accent group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">call</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-xs text-gray-400 uppercase tracking-wider mb-1">Ligar Agora</span>
                  <span className="block font-black text-dark-accent">(92) 98203-1507</span>
                </div>
              </button>

              <button
                onClick={handleEmail}
                className="w-full bg-gray-50 border border-gray-100 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-gray-100 hover:border-gray-200 group"
              >
                <div className="size-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-dark-accent group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-xs text-gray-400 uppercase tracking-wider mb-1">Enviar E-mail</span>
                  <span className="block font-black text-dark-accent text-sm">contato@mariana.com</span>
                </div>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-400 text-sm font-medium mb-4">Siga nas redes sociais</p>
              <div className="flex justify-center gap-4">
                {['Instagram', 'Facebook', 'LinkedIn'].map(social => (
                  <button key={social} className="px-6 py-3 bg-gray-50 rounded-xl text-xs font-black text-dark-accent hover:bg-primary hover:text-black transition-colors">
                    {social}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
