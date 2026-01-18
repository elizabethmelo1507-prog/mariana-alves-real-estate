import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../../types';
import LeadCaptureModal from '../../components/LeadCaptureModal';
import { supabase } from '../../lib/supabase';

interface CatalogProps {
  title: string;
  showPriceSuffix?: string;
}

const Catalog: React.FC<CatalogProps> = ({ title, showPriceSuffix = "" }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ['Todos', 'Apartamentos', 'Casas', 'Terrenos', 'Comercial'];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedProperties: Property[] = data.map(p => ({
          id: p.id,
          code: p.code,
          title: p.title,
          price: p.price,
          isPriceUnderConsultation: p.is_under_consultation,
          location: 'Manaus',
          neighborhood: p.neighborhood,
          image: p.image,
          gallery: p.gallery || [],
          area: p.area,
          rooms: p.rooms,
          bathrooms: p.bathrooms,
          suites: p.suites,
          parking: p.parking,
          description: p.description,
          features: p.amenities || [],
          status: p.status,
          type: p.type,
          purpose: p.purpose,
          pageViews: p.page_views || 0,
          whatsappClicks: p.whatsapp_clicks || 0,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          lastActivityAt: p.updated_at,
        }));
        setProperties(mappedProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(p => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Apartamentos') return p.type === 'Apartamento';
    if (activeFilter === 'Casas') return p.type === 'Casa';
    if (activeFilter === 'Terrenos') return p.type === 'Terreno';
    if (activeFilter === 'Comercial') return p.type === 'Comercial';
    return true;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined">chevron_left</span>
              Início
            </button>
            <h1 className="text-xl font-black tracking-tight border-l border-gray-200 pl-4">{title}</h1>
          </div>
          <div className="hidden md:flex bg-gray-100 rounded-full px-4 py-2 items-center gap-2 w-96">
            <span className="material-symbols-outlined text-gray-400">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full" placeholder="Buscar por bairro ou condomínio..." type="text" />
          </div>
          <button className="bg-dark-accent text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-active">Mapa Interativo</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block w-72 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h4 className="font-black text-lg mb-4 tracking-tight">Categorias</h4>
              <div className="flex flex-col gap-2">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeFilter === f ? 'bg-primary text-black' : 'text-gray-500 hover:bg-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-black text-lg mb-4 tracking-tight">Bairros Populares</h4>
              <div className="space-y-3">
                {['Ponta Negra', 'Adrianópolis', 'Vieiralves', 'Tarumã'].map(b => (
                  <label key={b} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="size-5 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-bold text-gray-500 group-hover:text-dark-accent">{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-dark-accent p-6 rounded-3xl text-white">
              <p className="font-black mb-2 leading-tight">Quer uma recomendação personalizada?</p>
              <p className="text-xs text-gray-400 mb-6">Fale agora com nosso assistente inteligente.</p>
              <button onClick={() => navigate('/contact')} className="w-full bg-primary text-black h-12 rounded-xl font-black text-sm transition-active">Abrir Chat</button>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-400 text-sm font-bold">
              {loading ? 'Buscando imóveis...' : `${filteredProperties.length} imóveis encontrados`}
            </p>
            <div className="flex gap-2">
              <button className="bg-white p-2 rounded-lg border border-gray-200"><span className="material-symbols-outlined">grid_view</span></button>
              <button className="bg-white p-2 rounded-lg border border-gray-200 text-gray-300"><span className="material-symbols-outlined">view_list</span></button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[16/10] bg-gray-100 rounded-[32px] animate-pulse" />
              ))
            ) : filteredProperties.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">home_off</span>
                <p className="text-gray-400 font-bold">Nenhum imóvel encontrado nesta categoria.</p>
              </div>
            ) : (
              filteredProperties.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-black/5 transition-all group cursor-pointer"
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={p.image} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" alt={p.title} />
                    <div className="absolute top-4 left-4 bg-primary text-black px-4 py-1.5 rounded-full text-sm font-black shadow-lg">
                      {p.isPriceUnderConsultation ? 'Sob Consulta' : formatCurrency(p.price)}{showPriceSuffix}
                    </div>
                    <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500 transition-colors">
                      <span className="material-symbols-outlined">favorite</span>
                    </button>
                  </div>
                  <div className="p-8">
                    <div className="mb-6">
                      <h3 className="text-2xl font-black tracking-tight mb-2 leading-tight">{p.title}</h3>
                      <p className="text-gray-400 text-sm flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-primary text-lg">location_on</span> {p.neighborhood}, Manaus
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-50 mb-8">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Área</p>
                        <p className="font-black text-dark-accent">{p.area}m²</p>
                      </div>
                      <div className="text-center border-x border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dorms</p>
                        <p className="font-black text-dark-accent">{p.rooms}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vagas</p>
                        <p className="font-black text-dark-accent">{p.parking}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProperty(p);
                          setIsLeadModalOpen(true);
                        }}
                        className="w-full bg-primary text-black font-black h-14 rounded-2xl flex items-center justify-center gap-2 transition-active shadow-lg shadow-primary/20"
                      >
                        <span className="material-symbols-outlined">chat</span>
                        Tenho Interesse
                      </button>
                      <button onClick={() => navigate(`/property/${p.id}`)} className="w-full bg-slate-50 text-dark-accent font-black h-14 rounded-2xl transition-active">
                        Mais Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {selectedProperty && (
        <LeadCaptureModal
          isOpen={isLeadModalOpen}
          onClose={() => {
            setIsLeadModalOpen(false);
            setSelectedProperty(null);
          }}
          property={{
            id: selectedProperty.id,
            code: selectedProperty.code,
            title: selectedProperty.title,
            neighborhood: selectedProperty.neighborhood
          }}
        />
      )}
    </div>
  );
};

export default Catalog;
