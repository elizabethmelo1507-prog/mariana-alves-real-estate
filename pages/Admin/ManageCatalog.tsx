import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Property } from '../../types';
import { supabase } from '../../lib/supabase';

const ManageCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [kitProperty, setKitProperty] = useState<Property | null>(null);

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

      const mappedProperties: Property[] = (data || []).map((p: any) => ({
        id: p.id,
        code: p.code,
        title: p.title,
        price: p.price,
        isPriceUnderConsultation: p.is_under_consultation,
        location: 'Manaus', // Default or add to schema
        neighborhood: p.neighborhood,
        image: p.image || 'https://via.placeholder.com/400x300?text=Sem+Imagem',
        gallery: p.gallery || [],
        area: p.area,
        rooms: p.rooms,
        bathrooms: p.bathrooms,
        suites: p.suites,
        parking: p.parking,
        description: p.description,
        features: p.amenities || [],
        status: p.status as any,
        type: p.type as any,
        purpose: p.purpose as any,
        pageViews: p.page_views,
        whatsappClicks: p.whatsapp_clicks,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        lastActivityAt: p.updated_at,
        condoFee: p.condo_fee,
        iptu: p.iptu,
        commission: p.commission,
        videoUrl: p.video_url,
        tourUrl: p.tour_url
      }));

      setProperties(mappedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKit = (prop: Property) => {
    setKitProperty(prop);
  };

  const handleCloseKit = () => {
    setKitProperty(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const getPublicLink = (id: string) => {
    return `${window.location.origin}/#/property/${id}`;
  };

  const getWhatsAppLink = (prop: Property) => {
    const text = `Olá, gostaria de mais informações sobre o imóvel ${prop.code} - ${prop.title}`;
    return `https://wa.me/5592982031507?text=${encodeURIComponent(text)}`;
  };

  const getFullKit = (prop: Property) => {
    return `*${prop.title}*\n\n${prop.description}\n\n*Valor:* ${formatCurrency(prop.price)}\n*Bairro:* ${prop.neighborhood}\n\n*Veja mais detalhes:* ${getPublicLink(prop.id)}\n\n*Fale comigo no WhatsApp:* ${getWhatsAppLink(prop)}`;
  };

  const getHealth = (prop: Property) => {
    const lastActivity = new Date(prop.lastActivityAt);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24));

    if (diffDays <= 7) return { label: 'Saudável', color: 'text-green-500', bg: 'bg-green-50', days: diffDays };
    if (diffDays <= 21) return { label: 'Atenção', color: 'text-amber-500', bg: 'bg-amber-50', days: diffDays };
    return { label: 'Parado', color: 'text-red-500', bg: 'bg-red-50', days: diffDays };
  };

  const handleDuplicate = async (prop: Property) => {
    if (!window.confirm('Deseja duplicar este imóvel?')) return;

    try {
      const { data: original } = await supabase
        .from('properties')
        .select('*')
        .eq('id', prop.id)
        .single();

      if (!original) return;

      const { id, created_at, updated_at, ...rest } = original;
      const newProp = {
        ...rest,
        code: `${rest.code}-COPY`,
        title: `${rest.title} (Cópia)`,
        page_views: 0,
        whatsapp_clicks: 0
      };

      const { error } = await supabase.from('properties').insert([newProp]);
      if (error) throw error;

      fetchProperties();
      alert('Imóvel duplicado com sucesso!');

    } catch (error) {
      console.error('Error duplicating property:', error);
      alert('Erro ao duplicar imóvel.');
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, properties]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <AdminLayout activeTab="properties">
      <header className="px-6 pt-8 pb-4 bg-white border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-dark-accent">Central de Imóveis</h1>
            <p className="text-gray-500 text-sm">Gerencie seu inventário e monitore a performance dos anúncios.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}
              >
                <span className="material-symbols-outlined">list</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}
              >
                <span className="material-symbols-outlined">grid_view</span>
              </button>
            </div>
            <button
              onClick={() => navigate('/admin/add')}
              className="bg-primary text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-primary/20 transition-active"
            >
              <span className="material-symbols-outlined">add</span>
              Novo Imóvel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="Buscar por título, bairro ou código..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20"
          >
            <option>Todos</option>
            <option>Disponível</option>
            <option>Reservado</option>
            <option>Em negociação</option>
            <option>Vendido</option>
            <option>Alugado</option>
          </select>
          <select className="bg-gray-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 font-bold">
            <option>Mais Recentes</option>
            <option>Mais Visitados</option>
            <option>Maior Performance</option>
            <option>Menor Performance</option>
          </select>
        </div>
      </header>

      <main className="px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando imóveis...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Nenhum imóvel encontrado.</div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Imóvel</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Saúde</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Performance</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProperties.map(prop => {
                  const health = getHealth(prop);
                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img src={prop.image} className="size-16 rounded-2xl object-cover border border-gray-100" />
                          <div className="min-w-0">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">{prop.code}</span>
                            <h3 className="font-black text-sm text-dark-accent truncate">{prop.title}</h3>
                            <p className="text-xs text-gray-400 font-bold">{prop.neighborhood} • {formatCurrency(prop.price)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${prop.status === 'Disponível' ? 'bg-green-50 text-green-600' :
                          prop.status === 'Vendido' ? 'bg-gray-100 text-gray-400' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`inline-flex flex-col items-center justify-center p-2 rounded-xl min-w-[80px] ${health.bg}`}>
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${health.color}`}>{health.label}</span>
                          <span className="text-[9px] font-bold text-gray-400">{health.days}d parados</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-3 text-gray-500 font-black text-xs">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {prop.pageViews}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-green-500">chat</span> {prop.whatsappClicks}</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden max-w-[80px]">
                            <div className="bg-primary h-full" style={{ width: `${Math.min((prop.whatsappClicks / (prop.pageViews || 1)) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/admin/edit/${prop.id}`)} className="p-2 text-gray-400 hover:text-dark-accent transition-colors">
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button onClick={() => handleDuplicate(prop)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Duplicar">
                            <span className="material-symbols-outlined text-xl">content_copy</span>
                          </button>
                          <button onClick={() => handleOpenKit(prop)} className="p-2 text-gray-400 hover:text-purple-500 transition-colors" title="Kit Brinde">
                            <span className="material-symbols-outlined text-xl">inventory_2</span>
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(prop => (
              <div key={prop.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group">
                <div className="relative aspect-video">
                  <img src={prop.image} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{prop.status}</span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className={`px-4 py-2 rounded-2xl bg-white/90 backdrop-blur shadow-lg flex flex-col items-center min-w-[80px] ${getHealth(prop).bg}`}>
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${getHealth(prop).color}`}>{getHealth(prop).label}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{prop.code}</span>
                      <h3 className="font-black text-lg tracking-tight truncate">{prop.title}</h3>
                      <p className="text-gray-400 text-sm font-bold">{prop.neighborhood}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-dark-accent text-lg leading-tight">{formatCurrency(prop.price)}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Venda</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 py-4 border-y border-gray-50 mb-6">
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-gray-300">visibility</span> <span className="text-sm font-black">{prop.pageViews}</span></div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-green-500">chat</span> <span className="text-sm font-black">{prop.whatsappClicks}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/admin/edit/${prop.id}`)} className="flex-1 bg-dark-accent text-white h-12 rounded-xl font-black text-xs transition-active">Editar</button>
                    <button onClick={() => handleDuplicate(prop)} className="bg-primary text-black size-12 rounded-xl flex items-center justify-center transition-active" title="Duplicar">
                      <span className="material-symbols-outlined">content_copy</span>
                    </button>
                    <button onClick={() => handleOpenKit(prop)} className="bg-purple-100 text-purple-600 size-12 rounded-xl flex items-center justify-center transition-active hover:bg-purple-200" title="Kit Brinde">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


      {/* Kit Brinde Modal */}
      {
        kitProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleCloseKit}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-black text-dark-accent">Kit do Imóvel</h2>
                  <p className="text-sm text-gray-500">Material pronto para envio ao cliente</p>
                </div>
                <button onClick={handleCloseKit} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Preview Card */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <img src={kitProperty.image} className="w-24 h-24 rounded-xl object-cover" />
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{kitProperty.code}</span>
                    <h3 className="font-bold text-dark-accent">{kitProperty.title}</h3>
                    <p className="text-sm text-gray-500">{kitProperty.neighborhood}</p>
                    <p className="font-black mt-1">{formatCurrency(kitProperty.price)}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-gray-400">Descrição Completa</label>
                    <button onClick={() => copyToClipboard(kitProperty.description)} className="text-xs font-bold text-primary hover:underline">Copiar</button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100">
                    {kitProperty.description}
                  </div>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase text-gray-400">Link do Site</label>
                      <button onClick={() => copyToClipboard(getPublicLink(kitProperty.id))} className="text-xs font-bold text-primary hover:underline">Copiar</button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100 truncate font-mono">
                      {getPublicLink(kitProperty.id)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase text-gray-400">Link WhatsApp</label>
                      <button onClick={() => copyToClipboard(getWhatsAppLink(kitProperty))} className="text-xs font-bold text-primary hover:underline">Copiar</button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100 truncate font-mono">
                      {getWhatsAppLink(kitProperty)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={handleCloseKit} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">
                  Fechar
                </button>
                <button
                  onClick={() => copyToClipboard(getFullKit(kitProperty))}
                  className="px-6 py-3 rounded-xl font-black bg-dark-accent text-white hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-black/10"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                  Copiar Kit Completo
                </button>
              </div>
            </div>
          </div>
        )
      }
    </AdminLayout >
  );
};

export default ManageCatalog;
