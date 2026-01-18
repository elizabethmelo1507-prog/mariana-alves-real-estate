import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const AMENITIES_OPTIONS = [
  'Academia', 'Piscina', 'Sauna', 'Portaria 24h', 'Gerador Full', 'Automação',
  'Varanda Gourmet', 'Churrasqueira', 'Salão de Festas', 'Espaço Pet', 'Playground',
  'Vista para o Rio', 'Mobiliado', 'Ar condicionado', 'Garagem Coberta'
];

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: `MA-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'Apartamento',
    purpose: 'Venda',
    neighborhood: '',
    price: '',
    isUnderConsultation: false,
    area: '',
    rooms: '',
    bathrooms: '',
    suites: '',
    parking: '',
    description: '',
    amenities: [] as string[],
    condoFee: '',
    iptu: '',
    commission: '',
    videoUrl: '',
    tourUrl: '',
    image: '', // Main image URL
    gallery: [] as string[], // Additional images
    ownerName: '',
    ownerPhone: '',
    latitude: null as number | null,
    longitude: null as number | null,
    address: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchProperty();
    } else {
      fetchNextCode();
    }
  }, [id]);

  const fetchNextCode = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_property_code');
      if (error) throw error;
      if (data) setFormData(prev => ({ ...prev, code: data }));
    } catch (error) {
      console.error('Error fetching next code:', error);
    }
  };

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          code: data.code || '',
          type: data.type || 'Apartamento',
          purpose: data.purpose || 'Venda',
          neighborhood: data.neighborhood || '',
          price: data.price ? data.price.toString() : '',
          isUnderConsultation: data.is_under_consultation || false,
          area: data.area ? data.area.toString() : '',
          rooms: data.rooms ? data.rooms.toString() : '',
          bathrooms: data.bathrooms ? data.bathrooms.toString() : '',
          suites: data.suites ? data.suites.toString() : '',
          parking: data.parking ? data.parking.toString() : '',
          description: data.description || '',
          amenities: data.amenities || [],
          condoFee: data.condo_fee ? data.condo_fee.toString() : '',
          iptu: data.iptu ? data.iptu.toString() : '',
          commission: data.commission || '',
          videoUrl: data.video_url || '',
          tourUrl: data.tour_url || '',
          image: data.image || '',
          gallery: data.gallery || [],
          ownerName: data.owner_name || '',
          ownerPhone: data.owner_phone || '',
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      alert('Erro ao carregar imóvel.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      if (isGallery) {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...uploadedUrls] }));
      } else {
        setFormData(prev => ({ ...prev, image: uploadedUrls[0] }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        code: formData.code,
        type: formData.type,
        purpose: formData.purpose,
        neighborhood: formData.neighborhood,
        price: formData.price ? parseFloat(formData.price.replace(/[^0-9.]/g, '')) : 0,
        is_under_consultation: formData.isUnderConsultation,
        area: formData.area ? parseFloat(formData.area) : 0,
        rooms: formData.rooms ? parseInt(formData.rooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        suites: formData.suites ? parseInt(formData.suites) : 0,
        parking: formData.parking ? parseInt(formData.parking) : 0,
        description: formData.description,
        amenities: formData.amenities,
        condo_fee: formData.condoFee ? parseFloat(formData.condoFee.replace(/[^0-9.]/g, '')) : 0,
        iptu: formData.iptu ? parseFloat(formData.iptu.replace(/[^0-9.]/g, '')) : 0,
        commission: formData.commission,
        video_url: formData.videoUrl,
        tour_url: formData.tourUrl,
        image: formData.image,
        gallery: formData.gallery,
        owner_name: formData.ownerName,
        owner_phone: formData.ownerPhone,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        const { error } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
        alert('Imóvel atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([payload]);
        if (error) throw error;
        alert('Imóvel criado com sucesso!');
      }

      navigate('/admin/manage');

    } catch (error) {
      console.error('Error saving property:', error);
      alert('Erro ao salvar imóvel.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing && !formData.title) {
    return (
      <AdminLayout activeTab="properties">
        <div className="flex items-center justify-center h-screen">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="properties">
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/admin/manage')} className="size-10 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm transition-active">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{isEditing ? 'Editar Imóvel' : 'Novo Imóvel'}</h1>
            <p className="text-gray-500 text-sm">{isEditing ? 'Atualize as informações do anúncio.' : 'Preencha as informações para publicar o anúncio.'}</p>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center gap-2 mt-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step === 1 ? 'bg-primary text-black' : 'bg-gray-100 text-gray-400'}`}>
            <span className="font-black text-xs">01</span>
            <span className="font-bold text-xs uppercase tracking-widest">Essencial</span>
          </div>
          <div className="w-8 h-px bg-gray-200"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step === 2 ? 'bg-primary text-black' : 'bg-gray-100 text-gray-400'}`}>
            <span className="font-black text-xs">02</span>
            <span className="font-bold text-xs uppercase tracking-widest">Detalhes & Mídia</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 pb-32">
        {step === 1 ? (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-black text-lg tracking-tight mb-6">Informações Básicas</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Título do Imóvel</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold focus:ring-2 focus:ring-primary/20"
                    placeholder="Ex: Mansão em Adrianópolis"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Código Interno</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold focus:ring-2 focus:ring-primary/20"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Tipo</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option>Apartamento</option>
                    <option>Casa</option>
                    <option>Cobertura</option>
                    <option>Terreno</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Finalidade</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold"
                    value={formData.purpose}
                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  >
                    <option>Venda</option>
                    <option>Aluguel</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Bairro</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold"
                    placeholder="Ponta Negra, Adrianópolis..."
                    value={formData.neighborhood}
                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Preço Sugerido</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">R$</span>
                    <input
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-5 font-black text-lg focus:ring-2 focus:ring-primary/20"
                      placeholder="0.000,00"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <button
                    onClick={() => setFormData({ ...formData, isUnderConsultation: !formData.isUnderConsultation })}
                    className={`size-6 rounded-lg flex items-center justify-center transition-all ${formData.isUnderConsultation ? 'bg-primary text-black' : 'bg-gray-100'}`}
                  >
                    {formData.isUnderConsultation && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                  </button>
                  <span className="text-sm font-bold text-gray-600">Preço Sob Consulta</span>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-black text-lg tracking-tight mb-6">Estrutura (Metragens & Cômodos)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Área (m²)', key: 'area', icon: 'square_foot' },
                  { label: 'Quartos', key: 'rooms', icon: 'bed' },
                  { label: 'Suítes', key: 'suites', icon: 'meeting_room' },
                  { label: 'Banheiros', key: 'bathrooms', icon: 'bathtub' },
                  { label: 'Vagas', key: 'parking', icon: 'directions_car' },
                ].map(item => (
                  <div key={item.key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{item.label}</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg">{item.icon}</span>
                      <input
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-primary/20"
                        type="number"
                        placeholder="0"
                        value={formData[item.key as keyof typeof formData] as string}
                        onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-black text-lg tracking-tight mb-6">Localização</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Endereço Completo (Opcional)</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold focus:ring-2 focus:ring-primary/20"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-400 ml-1">Este endereço será exibido publicamente na página do imóvel.</p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="font-black text-lg tracking-tight mb-6">Mídia do Anúncio</h3>

              <div className="space-y-6">
                {/* Main Image */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    onClick={() => document.getElementById('main-image-upload')?.click()}
                    className="md:col-span-2 aspect-video bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 group hover:border-primary transition-all cursor-pointer relative overflow-hidden"
                  >
                    <input
                      id="main-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                    {formData.image ? (
                      <>
                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-black text-sm">Trocar Foto de Capa</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="size-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                        </div>
                        <div className="text-center">
                          <p className="font-black text-sm">Capa do Anúncio</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Clique para selecionar da sua galeria</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Dica de Foto</label>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Use fotos na horizontal (paisagem) para a capa. Isso garante que o imóvel apareça bem em todos os dispositivos.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Vídeo (YouTube/Instagram)</label>
                      <input
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold"
                        placeholder="URL do vídeo (Ex: YouTube)"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <div className="pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest">Galeria de Fotos</h4>
                    <button
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                      className="text-xs font-black text-primary flex items-center gap-1 hover:underline"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Adicionar Fotos
                    </button>
                    <input
                      id="gallery-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {formData.gallery.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                        <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }))}
                          className="absolute top-2 right-2 size-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-all bg-gray-50"
                    >
                      <span className="material-symbols-outlined">add_photo_alternate</span>
                      <span className="text-[10px] font-black uppercase">Adicionar</span>
                    </button>
                  </div>
                </div>

                {/* Tour 360 */}
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Tour Virtual 360°</label>
                  <input
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold"
                    placeholder="Link Matterport ou outros"
                    value={formData.tourUrl}
                    onChange={(e) => setFormData({ ...formData, tourUrl: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="font-black text-lg tracking-tight mb-6">Comodidades & Diferenciais</h3>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${formData.amenities.includes(amenity)
                      ? 'bg-primary border-primary text-black'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-primary/40'
                      }`}
                  >
                    {amenity}
                  </button>
                ))}
                <button className="px-4 py-2.5 rounded-xl text-xs font-black bg-gray-50 text-gray-400 border-2 border-dashed border-gray-200">+ Custom</button>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="font-black text-lg tracking-tight mb-6">Descrição Comercial</h3>
              <textarea
                className="w-full bg-gray-50 border-none rounded-[24px] p-6 text-sm font-medium leading-relaxed min-h-[200px] focus:ring-2 focus:ring-primary/20"
                placeholder="Descreva os pontos fortes do imóvel, acabamentos, localização e o que torna este imóvel único..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </section>

            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="font-black text-lg tracking-tight mb-6">Dados Privados (Apenas Admin)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-b border-gray-50 pb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nome do Proprietário</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold"
                    placeholder="Nome completo"
                    value={formData.ownerName}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Telefone do Proprietário</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold"
                    placeholder="(92) 99999-9999"
                    value={formData.ownerPhone}
                    onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Condomínio (Mensal)</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold"
                    placeholder="R$ 0,00"
                    value={formData.condoFee}
                    onChange={e => setFormData({ ...formData, condoFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">IPTU (Anual)</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold"
                    placeholder="R$ 0,00"
                    value={formData.iptu}
                    onChange={e => setFormData({ ...formData, iptu: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Comissão Acordada (%)</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-primary"
                    placeholder="6%"
                    value={formData.commission}
                    onChange={e => setFormData({ ...formData, commission: e.target.value })}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 inset-x-0 md:left-64 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-6 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => step === 2 ? setStep(1) : navigate('/admin/manage')}
            className="px-8 py-4 font-black text-sm text-gray-400 hover:text-dark-accent transition-colors"
          >
            {step === 2 ? 'Voltar Etapa' : 'Cancelar'}
          </button>

          <div className="flex gap-4">
            <button className="hidden md:block px-8 py-4 font-black text-sm text-dark-accent bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all">
              Salvar Rascunho
            </button>
            <button
              onClick={() => step === 1 ? setStep(2) : handleSubmit()}
              disabled={loading}
              className="bg-primary text-black px-12 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-active flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  {step === 1 ? 'Próxima Etapa' : (isEditing ? 'Salvar Alterações' : 'Publicar Anúncio')}
                  <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </AdminLayout>
  );
};

export default AddProperty;
