
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { getGeminiModel } from '../../lib/gemini';

interface Property {
    id: string;
    title: string;
    code: string;
    neighborhood: string;
    description: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
}

const AICreatives: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [creativeType, setCreativeType] = useState<'instagram' | 'facebook' | 'whatsapp' | 'description'>('instagram');
    const [tone, setTone] = useState<'professional' | 'persuasive' | 'emotional' | 'luxury'>('persuasive');
    const [result, setResult] = useState('');
    const [generatingImage, setGeneratingImage] = useState(false);
    const [generatedImage, setGeneratedImage] = useState('');

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateCreative = async () => {
        if (!selectedProperty) {
            alert('Por favor, selecione um imóvel primeiro.');
            return;
        }

        setGenerating(true);
        setResult('');

        try {
            const model = getGeminiModel();

            const prompt = `
        Você é um especialista em marketing imobiliário de alto padrão.
        Crie um conteúdo de ${creativeType} para o seguinte imóvel:
        
        Título: ${selectedProperty.title}
        Código: ${selectedProperty.code}
        Bairro: ${selectedProperty.neighborhood}
        Preço: R$ ${selectedProperty.price.toLocaleString('pt-BR')}
        Quartos: ${selectedProperty.bedrooms}
        Banheiros: ${selectedProperty.bathrooms}
        Área: ${selectedProperty.area}m²
        Descrição Original: ${selectedProperty.description}
        
        O tom de voz deve ser: ${tone}.
        Idioma: Português do Brasil.
        
        Se for Instagram: Inclua emojis, uma chamada para ação (CTA) forte e hashtags relevantes.
        Se for Facebook: Foco em benefícios para a família e qualidade de vida.
        Se for WhatsApp: Mensagem direta, persuasiva e com gatilhos mentais.
        Se for Descrição: Uma nova descrição otimizada para portais imobiliários, focada em SEO e conversão.
        
        Não inclua introduções como "Aqui está o seu texto", vá direto ao conteúdo.
      `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            setResult(response.text());
        } catch (error: any) {
            console.error('Error generating creative:', error);
            alert(error.message || 'Erro ao gerar criativo. Verifique sua conexão ou chave de API.');
        } finally {
            setGenerating(false);
        }
    };

    const generateImage = async () => {
        if (!selectedProperty) {
            alert('Por favor, selecione um imóvel primeiro.');
            return;
        }

        setGeneratingImage(true);
        setGeneratedImage('');

        try {
            const model = getGeminiModel();

            const prompt = `A highly realistic, professional architectural photography of a luxury real estate property in ${selectedProperty.neighborhood}, Manaus. ${selectedProperty.title}. Modern design, high-end finishes, golden hour lighting, 8k resolution, cinematic composition.`;

            const imageUrl = await model.generateImage(prompt);
            setGeneratedImage(imageUrl);
        } catch (error: any) {
            console.error('Error generating image:', error);
            alert(error.message || 'Erro ao gerar imagem. Verifique se sua chave API possui faturamento ativado.');
        } finally {
            setGeneratingImage(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        alert('Copiado para a área de transferência! ✅');
    };

    return (
        <AdminLayout activeTab="creatives">
            <div className="p-6 md:p-8 animate-fade-in">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/20 p-2 rounded-xl">
                            <span className="material-symbols-outlined text-primary font-bold">auto_awesome</span>
                        </div>
                        <h1 className="text-2xl font-black text-dark-accent">Criativos com IA</h1>
                    </div>
                    <p className="text-gray-500 text-sm">Gere copies de alta conversão para seus imóveis em segundos.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar - Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Configurações</h2>

                            <div className="space-y-6">
                                {/* Property Selection */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Selecionar Imóvel</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary/20"
                                        value={selectedProperty?.id || ''}
                                        onChange={(e) => {
                                            const prop = properties.find(p => p.id === e.target.value);
                                            setSelectedProperty(prop || null);
                                        }}
                                    >
                                        <option value="">Escolha um imóvel...</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Creative Type */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Tipo de Conteúdo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'instagram', label: 'Instagram', icon: 'photo_camera' },
                                            { id: 'facebook', label: 'Facebook', icon: 'facebook' },
                                            { id: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
                                            { id: 'description', label: 'Descrição', icon: 'description' }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setCreativeType(type.id as any)}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${creativeType === type.id ? 'border-primary bg-primary/5 text-dark-accent' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                            >
                                                <span className="material-symbols-outlined text-xl">{type.icon}</span>
                                                <span className="text-[10px] font-black uppercase tracking-tighter">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tone */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Tom de Voz</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary/20"
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value as any)}
                                    >
                                        <option value="professional">Profissional & Informativo</option>
                                        <option value="persuasive">Persuasivo & Vendedor</option>
                                        <option value="emotional">Emocional & Inspirador</option>
                                        <option value="luxury">Exclusivo & Luxuoso</option>
                                    </select>
                                </div>

                                <button
                                    onClick={generateCreative}
                                    disabled={generating || generatingImage || !selectedProperty}
                                    className="w-full bg-dark-accent text-white h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-primary hover:text-black transition-all shadow-xl shadow-dark-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {generating ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Gerando Texto...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">magic_button</span>
                                            Gerar Texto
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={generateImage}
                                    disabled={generating || generatingImage || !selectedProperty}
                                    className="w-full bg-white border-2 border-dark-accent text-dark-accent h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {generatingImage ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Gerando Imagem...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">image</span>
                                            Gerar Imagem IA
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tips Card */}
                        <div className="bg-primary/10 p-6 rounded-[32px] border border-primary/20">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-primary font-bold">lightbulb</span>
                                <h3 className="font-black text-dark-accent text-sm">Dica Pro</h3>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                Use o tom <strong>Luxuoso</strong> para coberturas e mansões, e o tom <strong>Emocional</strong> para casas de família. A IA adapta os gatilhos mentais automaticamente.
                            </p>
                        </div>
                    </div>

                    {/* Main Content - Result */}
                    <div className="lg:col-span-2">
                        <div className="bg-white h-full min-h-[500px] rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <header className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-gray-400">article</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-dark-accent text-sm">Resultado da Geração</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">IA Nano Banana</p>
                                    </div>
                                </div>
                                {result && (
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                        Copiar
                                    </button>
                                )}
                            </header>

                            <div className="flex-1 p-8 relative overflow-y-auto">
                                {generating || generatingImage ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                                        <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                            <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <p className="font-black text-dark-accent animate-pulse">
                                            {generating ? 'A IA está escrevendo...' : 'A IA está pintando...'}
                                        </p>
                                    </div>
                                ) : null}

                                <div className="space-y-8">
                                    {generatedImage && (
                                        <div className="rounded-[32px] overflow-hidden border border-gray-100 shadow-lg">
                                            <img src={generatedImage} alt="IA Generated" className="w-full h-auto object-cover" />
                                            <div className="p-4 bg-gray-50 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Imagem Gerada por IA</span>
                                                <a
                                                    href={generatedImage}
                                                    download={`criativo-${selectedProperty?.code}.png`}
                                                    className="text-xs font-black text-primary hover:underline"
                                                >
                                                    Baixar Imagem
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {result && (
                                        <div className="prose prose-slate max-w-none">
                                            <div className="whitespace-pre-wrap font-medium text-gray-700 leading-relaxed text-sm md:text-base">
                                                {result}
                                            </div>
                                        </div>
                                    )}

                                    {!result && !generatedImage && !generating && !generatingImage && (
                                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-gray-300">
                                            <span className="material-symbols-outlined text-6xl mb-4">auto_awesome_motion</span>
                                            <p className="font-black text-lg">Pronto para criar?</p>
                                            <p className="text-sm font-bold max-w-xs">Selecione um imóvel e clique em gerar para ver a mágica acontecer.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {result && (
                                <footer className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        Gerado em {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setResult('')}
                                            className="px-4 py-2 text-xs font-black text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                </footer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AICreatives;
