import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeadCaptureModal from '../../components/LeadCaptureModal';
import { Property } from '../../types';
import { supabase } from '../../lib/supabase';

const PropertyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeItem, setActiveItem] = useState(0);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
    window.scrollTo(0, 0);
  }, [id]);

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
        setProperty({
          id: data.id,
          code: data.code,
          title: data.title,
          price: data.price,
          isPriceUnderConsultation: data.is_under_consultation,
          location: 'Manaus',
          neighborhood: data.neighborhood,
          image: data.image,
          gallery: data.gallery || [],
          area: data.area,
          rooms: data.rooms,
          bathrooms: data.bathrooms,
          suites: data.suites,
          parking: data.parking,
          description: data.description,
          features: data.amenities || [],
          status: data.status,
          type: data.type,
          purpose: data.purpose,
          pageViews: data.page_views,
          whatsappClicks: data.whatsapp_clicks,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          lastActivityAt: data.updated_at,
          videoUrl: data.video_url,
          tourUrl: data.tour_url,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address
        });

        // Increment page views
        await supabase.rpc('increment_page_views', { property_id: data.id });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const galleryItems = useMemo(() => {
    if (!property) return [];
    const items = [
      { type: 'image', url: property.image },
      ...property.gallery.map(url => ({ type: 'image', url })),
    ];

    if (property.videoUrl) {
      const ytId = getYoutubeId(property.videoUrl);
      if (ytId) {
        items.push({
          type: 'video',
          url: property.videoUrl,
          thumb: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          ytId
        });
      }
    }

    return items;
  }, [property]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleWhatsAppClick = () => {
    setIsLeadModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <h1 className="text-2xl font-black text-dark-accent mb-4">Imóvel não encontrado</h1>
        <button onClick={() => navigate('/catalog')} className="bg-primary text-black px-8 py-3 rounded-xl font-black">Voltar ao Catálogo</button>
      </div>
    );
  }

  const activeMedia = galleryItems[activeItem];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar Transparente */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur-md text-white size-10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="flex gap-2">
          <button className="bg-white/20 backdrop-blur-md text-white size-10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
            <span className="material-symbols-outlined">share</span>
          </button>
          <button className="bg-white/20 backdrop-blur-md text-white size-10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
            <span className="material-symbols-outlined">favorite_border</span>
          </button>
        </div>
      </nav>

      {/* Hero Gallery */}
      <header className="relative h-[60vh] md:h-[75vh] bg-gray-900 overflow-hidden">
        {activeMedia?.type === 'video' ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${activeMedia.ytId}?autoplay=1&mute=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <img
            src={activeMedia?.url}
            className="w-full h-full object-cover transition-opacity duration-500"
            alt="Imóvel destaque"
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary text-black text-[10px] font-black uppercase tracking-widest px-2 py-1">{property.purpose}</span>
                  <span className="border border-white/30 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1">{property.neighborhood}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-2">{property.title}</h1>
                <p className="text-gray-300 text-sm md:text-base max-w-2xl">{property.location} - {property.neighborhood}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Valor do Imóvel</p>
                <p className="text-3xl md:text-4xl font-black text-white">
                  {property.isPriceUnderConsultation ? 'Sob Consulta' : formatCurrency(property.price)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Thumbs */}
        <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 flex gap-2 overflow-x-auto max-w-[70%] md:max-w-md hide-scrollbar p-2">
          {galleryItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveItem(idx)}
              className={`flex-shrink-0 size-16 md:size-20 border-2 transition-all rounded-xl overflow-hidden relative ${activeItem === idx ? 'border-primary scale-110 z-10 shadow-xl' : 'border-white/20 opacity-60 hover:opacity-100'}`}
            >
              <img src={item.type === 'video' ? item.thumb : item.url} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="material-symbols-outlined text-white text-2xl">play_circle</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Content */}
        <div className="lg:col-span-2 space-y-12">

          {/* Specs */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-100 pb-12">
            {[
              { label: 'Área Útil', val: `${property.area}m²`, icon: 'square_foot' },
              { label: 'Quartos', val: `${property.rooms} Quartos`, icon: 'bed' },
              { label: 'Suítes', val: `${property.suites} Suítes`, icon: 'meeting_room' },
              { label: 'Vagas', val: `${property.parking} Vagas`, icon: 'directions_car' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                  <p className="font-bold text-dark-accent">{item.val}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Description */}
          <section>
            <h3 className="text-xl font-black text-dark-accent mb-4 uppercase tracking-tight">Sobre o Imóvel</h3>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
              {property.description}
            </p>
          </section>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <section>
              <h3 className="text-xl font-black text-dark-accent mb-6 uppercase tracking-tight">Diferenciais</h3>
              <div className="flex flex-wrap gap-3">
                {property.features.map((feature, i) => (
                  <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {feature}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tour Virtual */}
          {property.tourUrl && (
            <section>
              <h3 className="text-xl font-black text-dark-accent mb-6 uppercase tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined">360</span>
                Tour Virtual 360°
              </h3>
              <div className="aspect-video w-full bg-gray-100 rounded-3xl overflow-hidden border border-gray-100">
                <iframe src={property.tourUrl} className="w-full h-full" allowFullScreen></iframe>
              </div>
            </section>
          )}

          {/* Location Info */}
          <section>
            <h3 className="text-xl font-black text-dark-accent mb-6 uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined">location_on</span>
              Localização
            </h3>
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
              <p className="text-gray-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Bairro</p>
              <p className="text-2xl font-black text-dark-accent mb-4">{property.neighborhood}</p>
              {property.address && (
                <>
                  <p className="text-gray-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Endereço</p>
                  <p className="text-lg font-bold text-gray-700">{property.address}</p>
                </>
              )}
            </div>
          </section>

        </div>

        {/* Right Sidebar (Sticky Actions) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-gray-100 p-8 rounded-[32px] shadow-2xl shadow-black/5">
            <div className="mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Código do Imóvel</p>
              <p className="text-lg font-black text-primary">{property.code}</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-[#25D366] text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl shadow-[#25D366]/20"
              >
                <span className="material-symbols-outlined text-2xl">chat</span>
                Falar no WhatsApp
              </button>

              <button
                onClick={() => navigate(`/schedule-visit?propertyId=${property.id}&propertyTitle=${encodeURIComponent(property.title)}`)}
                className="w-full bg-dark-accent text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-black"
              >
                <span className="material-symbols-outlined text-2xl">calendar_month</span>
                Agendar Visita
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-gray-200 overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Mariana+Alves&background=0D8ABC&color=fff" alt="Corretora" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Sua Corretora</p>
                  <p className="font-black text-dark-accent">Mariana Alves</p>
                  <p className="text-[10px] text-primary font-black">CRECI 1234-AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        property={{
          id: property.id,
          code: property.code,
          title: property.title,
          neighborhood: property.neighborhood
        }}
      />
    </div>
  );
};

export default PropertyDetail;
