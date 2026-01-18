
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, sendLeadToWebhook, sendEvaluationRequestToWebhook } from '../../lib/supabase';

const Evaluation: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'Apartamento',
    address: '',
    area: '',
    rooms: '',
    date: '',
    time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          phone: formData.phone,
          interest_type: 'evaluation',
          message: `Avaliação de Imóvel: ${formData.type} em ${formData.address}`
        }])
        .select()
        .single();

      if (leadError) throw leadError;

      // Send to General Webhook
      sendLeadToWebhook(formData.name, `Avaliação: ${formData.type} em ${formData.address}`, formData.phone);

      // Send to Specific Evaluation Webhook
      sendEvaluationRequestToWebhook(formData);

      // 2. Create Visit (Evaluation Visit)
      const { error: visitError } = await supabase
        .from('visits')
        .insert([{
          lead_id: leadData.id,
          notes: `Solicitação de Avaliação: ${formData.type}, ${formData.area}m², ${formData.rooms} quartos. Endereço: ${formData.address}`,
          status: 'evaluation_requested',
          date: formData.date,
          time: formData.time
        }]);

      if (visitError) throw visitError;

      // 3. WhatsApp Redirect
      const message = `Olá, gostaria de solicitar uma avaliação do meu imóvel!
      
*Nome:* ${formData.name}
*Telefone:* ${formData.phone}
*Tipo:* ${formData.type}
*Endereço:* ${formData.address}
*Área:* ${formData.area}m²
*Quartos:* ${formData.rooms}
*Data Preferida:* ${formData.date.split('-').reverse().join('/')}
*Horário:* ${formData.time}
${formData.notes ? `*Obs:* ${formData.notes}` : ''}`;

      const whatsappUrl = `https://wa.me/5592982031507?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      alert('Solicitação enviada com sucesso!');
      navigate('/');

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="font-extrabold tracking-tight text-lg">Avalie seu Imóvel</h1>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col md:flex-row">

          {/* Left Side - Info */}
          <div className="bg-dark-accent text-white p-10 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="size-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 text-primary">
                <span className="material-symbols-outlined text-4xl">analytics</span>
              </div>
              <h2 className="text-3xl font-black mb-4 leading-tight">Quanto vale o seu patrimônio?</h2>
              <p className="text-gray-400 leading-relaxed">
                Receba uma avaliação técnica e de mercado precisa para venda ou locação do seu imóvel.
              </p>
            </div>

            <div className="relative z-10 mt-12 space-y-6">
              {[
                { icon: 'trending_up', title: 'Análise de Mercado', desc: 'Baseada em dados reais' },
                { icon: 'speed', title: 'Agilidade', desc: 'Venda mais rápido' },
                { icon: 'verified', title: 'Segurança', desc: 'Avaliação certificada' }
              ].map(item => (
                <div key={item.title} className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative circles */}
            <div className="absolute -bottom-20 -right-20 size-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute top-20 -left-20 size-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          {/* Right Side - Form */}
          <div className="p-10 md:w-3/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Seu Nome</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full h-14 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 font-bold transition-all outline-none"
                      placeholder="Nome completo"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">WhatsApp</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full h-14 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 font-bold transition-all outline-none"
                      placeholder="(92) 99999-9999"
                      type="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Tipo de Imóvel</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full h-14 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 font-bold transition-all outline-none appearance-none"
                  >
                    <option value="Apartamento">Apartamento</option>
                    <option value="Casa">Casa</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Cobertura">Cobertura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Endereço ou Bairro</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full h-14 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 font-bold transition-all outline-none"
                    placeholder="Ex: Ponta Negra, Condomínio..."
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Metragem (m²)</label>
                    <input
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full h-14 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 font-bold transition-all outline-none"
                      placeholder="0"
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Dormitórios</label>
                    <input
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleChange}
                      className="w-full h-14 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 font-bold transition-all outline-none"
                      placeholder="0"
                      type="number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Data Preferida</label>
                    <input
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full h-14 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 font-bold transition-all outline-none text-gray-600"
                      type="date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Horário</label>
                    <input
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full h-14 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 font-bold transition-all outline-none text-gray-600"
                      type="time"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Observações (Opcional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full h-24 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 font-bold transition-all outline-none resize-none"
                    placeholder="Detalhes adicionais..."
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-black font-black h-16 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">assignment</span>
                    Solicitar Avaliação Grátis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
