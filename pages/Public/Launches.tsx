
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Launches: React.FC = () => {
  const navigate = useNavigate();

  const projects = [
    {
      id: '1',
      title: 'Splendor Residence',
      location: 'Ponta Negra, Manaus',
      tag: 'Pré-venda',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUPm_C9POnrRFBXPT6HzGHXguau1s6jxf4PiTziy9XNvqPYGb4dDBtlqPEfWvXUy3_yQ4y5LGmYLoeASh3viMJgtgSp69jIaD3sO3i-lw-xSAMW67jKHInoSJ3LHxu8cHwX34S8C9qdwm4J4P3IJfn4sYDCj-qOO99B_JSCGx8ktHoq1HRB22gYVshc3vz_INM_zzmSy-ipVPsJI0AwwURwgBAqSsBLcJQDs1xmZ3JibGWtgygnSMOyGI02I1GC8ONVCpoMl1d8RU'
    },
    {
      id: '2',
      title: 'Horizon View',
      location: 'Adrianópolis, Manaus',
      tag: 'Na Planta',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHc6q72hORQK5xdXbzWnlctnhdC3dIghxO5BvXQac_oWJ4cnuvnwZzj8cAP_pewHNBdtOEyk-tqf59wpKXL6YvFgwAYWXsWvMaaUiZ8hnAU8rAShg9w3RZ3FItpGjnMplUsHy05IHA8gg7hKcL8DSMYU-dEXiPPeJ5Kt06ECQ08GvyIV4I7nnuP_rMQHOsl_IwLxwEH5nnSjcYUXGYHTCc67JDDUABIZ20mqmkj_BWGesvGc-z1mQBsPCeVn5SPnnCfF8FmPcb4wo'
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="font-extrabold tracking-tight text-lg">Lançamentos</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
        <section>
          <div className="relative aspect-[4/5] md:aspect-[21/9] rounded-[32px] overflow-hidden shadow-2xl group">
            <img src={projects[0].image} className="absolute inset-0 size-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Featured" />
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="bg-primary text-black text-xs font-black uppercase px-4 py-2 rounded-full shadow-lg">Destaque</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
              <div className="max-w-3xl">
                <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Novo Projeto</p>
                <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">{projects[0].title}</h2>
                <div className="flex items-center gap-2 text-gray-300 text-lg mb-8">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>{projects[0].location}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-primary text-black font-extrabold h-14 px-8 rounded-2xl flex items-center justify-center gap-2 transition-active hover:scale-105">
                    <span className="material-symbols-outlined">send</span>
                    Receber material exclusivo
                  </button>
                  <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold h-14 px-8 rounded-2xl flex items-center justify-center gap-2 transition-active hover:bg-white/20">
                    <span className="material-symbols-outlined">play_circle</span>
                    Ver Vídeo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-black tracking-tight">Próximos Projetos</h3>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Ver Mapa</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(1).map(p => (
              <div key={p.id} className="flex flex-col gap-4 group">
                <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all">
                  <img src={p.image} className="size-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.title} />
                  <div className="absolute top-4 right-4 bg-white text-dark-accent text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm">
                    {p.tag}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-extrabold tracking-tight">{p.title}</h4>
                      <p className="text-gray-500 text-sm font-bold">{p.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Previsão</p>
                      <p className="font-bold text-sm">Dez 2026</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Infinity Pool', 'Rooftop Lounge', 'Smart Home'].map(feat => (
                      <span key={feat} className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-[11px] font-bold text-gray-600">
                        {feat}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-primary text-black font-extrabold h-12 rounded-xl flex items-center justify-center gap-2 transition-active shadow-lg shadow-primary/10 hover:scale-[1.02]">
                      <span className="material-symbols-outlined text-lg">chat</span>
                      WhatsApp
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-500 font-bold h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                      <span className="material-symbols-outlined text-lg">download</span>
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Launches;
