import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, sendLeadToWebhook, sendVisitRequestToWebhook } from '../../lib/supabase';

// Mock properties for selection (should ideally come from a context or API)
const PROPERTIES = [
    {
        id: '1',
        title: 'Residencial Aurora Premium',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUPm_C9POnrRFBXPT6HzGHXguau1s6jxf4PiTziy9XNvqPYGb4dDBtlqPEfWvXUy3_yQ4y5LGmYLoeASh3viMJgtgSp69jIaD3sO3i-lw-xSAMW67jKHInoSJ3LHxu8cHwX34S8C9qdwm4J4P3IJfn4sYDCj-qOO99B_JSCGx8ktHoq1HRB22gYVshc3vz_INM_zzmSy-ipVPsJI0AwwURwgBAqSsBLcJQDs1xmZ3JibGWtgygnSMOyGI02I1GC8ONVCpoMl1d8RU'
    },
    {
        id: '2',
        title: 'Sky Garden Flat Luxury',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHc6q72hORQK5xdXbzWnlctnhdC3dIghxO5BvXQac_oWJ4cnuvnwZzj8cAP_pewHNBdtOEyk-tqf59wpKXL6YvFgwAYWXsWvMaaUiZ8hnAU8rAShg9w3RZ3FItpGjnMplUsHy05IHA8gg7hKcL8DSMYU-dEXiPPeJ5Kt06ECQ08GvyIV4I7nnuP_rMQHOsl_IwLxwEH5nnSjcYUXGYHTCc67JDDUABIZ20mqmkj_BWGesvGc-z1mQBsPCeVn5SPnnCfF8FmPcb4wo'
    },
    {
        id: '3',
        title: 'Mansão Riviera Águas Profundas',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJIZwwSiX-4gH0pJ5abnEQF5PybRxHJxaOaliz31VzfdDxUhdIi7lWTHtvWJRvTBPt_YNEPAmlEZ7l9fhaoQwAZZaIQnqnNhtuluBM_Kiz52fhlCEQh-J9imy7oAchZwKI1ZMNK6ce9GmB4S65iZL87jR1fIsE5I0yLRmQw9TNRuAgBIbM8plFgSVJTeFcm7NZnARIPvB0q6Bm2602JVTe5M8olub-WrqhwR0lUEsKCkVrhG2fyhvJX8oeKCPphjYuJPpXi8qjTdc'
    }
];

const ScheduleVisit: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Initial state from URL or empty
    const [selectedPropertyId, setSelectedPropertyId] = useState(searchParams.get('propertyId') || '');
    const [selectedPropertyTitle, setSelectedPropertyTitle] = useState(searchParams.get('propertyTitle') || '');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        time: '',
        notes: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePropertySelect = (id: string, title: string) => {
        setSelectedPropertyId(id);
        setSelectedPropertyTitle(title);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!selectedPropertyId) {
            alert('Por favor, selecione um imóvel para visitar.');
            setLoading(false);
            return;
        }

        try {
            // 1. Create Lead
            const { data: leadData, error: leadError } = await supabase
                .from('leads')
                .insert([{
                    name: formData.name,
                    phone: formData.phone,
                    interest_type: 'visit',
                    property_id: selectedPropertyId,
                    message: formData.notes
                }])
                .select()
                .single();

            if (leadError) throw leadError;

            // Send to General Webhook
            sendLeadToWebhook(formData.name, selectedPropertyTitle, formData.phone);

            // Send to Specific Visit Webhook
            sendVisitRequestToWebhook(
                formData.name,
                selectedPropertyTitle,
                formData.date,
                formData.time,
                formData.phone
            );

            // 2. Create Visit
            const { error: visitError } = await supabase
                .from('visits')
                .insert([{
                    lead_id: leadData.id,
                    property_id: selectedPropertyId,
                    date: formData.date,
                    time: formData.time,
                    notes: formData.notes
                }]);

            if (visitError) throw visitError;

            // 3. WhatsApp Redirect
            const message = `Olá, gostaria de agendar uma visita!
      
*Nome:* ${formData.name}
*Telefone:* ${formData.phone}
*Data:* ${formData.date.split('-').reverse().join('/')}
*Horário:* ${formData.time}
*Imóvel:* ${selectedPropertyTitle}
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
                <h1 className="font-extrabold tracking-tight text-lg">Agendar Visita</h1>
            </nav>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col lg:flex-row">

                    {/* Left Side - Info */}
                    <div className="bg-dark-accent text-white p-10 lg:w-1/3 flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="size-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 text-primary">
                                <span className="material-symbols-outlined text-4xl">calendar_month</span>
                            </div>
                            <h2 className="text-3xl font-black mb-4 leading-tight">Vamos conhecer seu novo lar?</h2>
                            <p className="text-gray-400 leading-relaxed">
                                Escolha o imóvel e o melhor horário. Nossa equipe confirmará o agendamento em instantes.
                            </p>
                        </div>

                        <div className="relative z-10 mt-12 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">verified</span>
                                </div>
                                <div>
                                    <p className="font-bold">Atendimento VIP</p>
                                    <p className="text-xs text-gray-400">Acompanhamento exclusivo</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">schedule</span>
                                </div>
                                <div>
                                    <p className="font-bold">Flexibilidade</p>
                                    <p className="text-xs text-gray-400">Horários que funcionam pra você</p>
                                </div>
                            </div>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute -bottom-20 -right-20 size-64 bg-primary/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-20 -left-20 size-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="p-10 lg:w-2/3">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Property Selection */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 ml-1">Qual imóvel deseja visitar?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {PROPERTIES.map(prop => (
                                        <div
                                            key={prop.id}
                                            onClick={() => handlePropertySelect(prop.id, prop.title)}
                                            className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${selectedPropertyId === prop.id ? 'border-primary ring-4 ring-primary/10' : 'border-transparent hover:border-gray-200'}`}
                                        >
                                            <div className="aspect-[4/3]">
                                                <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className={`p-3 ${selectedPropertyId === prop.id ? 'bg-primary text-black' : 'bg-gray-50 text-gray-600'}`}>
                                                <p className="text-xs font-black leading-tight line-clamp-2">{prop.title}</p>
                                            </div>
                                            {selectedPropertyId === prop.id && (
                                                <div className="absolute top-2 right-2 bg-primary text-black size-6 rounded-full flex items-center justify-center shadow-sm">
                                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Seu Nome</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full h-14 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 font-bold transition-all outline-none"
                                        placeholder="Como gostaria de ser chamado?"
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
                                        className="w-full h-32 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 font-bold transition-all outline-none resize-none"
                                        placeholder="Alguma preferência específica ou dúvida?"
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
                                        <span className="material-symbols-outlined">send</span>
                                        Confirmar Agendamento
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

export default ScheduleVisit;
