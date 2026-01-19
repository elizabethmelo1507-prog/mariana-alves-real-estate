import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import SitePreview from '../../../components/SitePreview';
import { supabase } from '../../../lib/supabase';

const SiteEditor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'appearance' | 'content' | 'sections' | 'form'>('appearance');
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('site_configs')
                        .select('config')
                        .eq('user_id', user.id)
                        .single();

                    if (data && data.config) {
                        setConfig(prev => ({ ...prev, ...data.config }));
                    }
                }
            } catch (error) {
                console.error('Error fetching site config:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const [config, setConfig] = useState({
        brandColor: '#00ff88',
        backgroundColor: '#ffffff',
        logoUrl: '',
        title: 'Mariana Alves | Real Estate',
        description: 'Imóveis de Alto Padrão em Manaus. Consultoria especializada e atendimento personalizado.',
        template: 'Minimalista' as 'Minimalista' | 'Luxo' | 'Foco em Leads',
        regions: 'Ponta Negra, Adrianópolis, Vieiralves',
        subdomain: 'marianaalves',
        sections: [
            { id: 'hero', label: 'Capa (Hero)', enabled: true, fixed: true },
            { id: 'stats', label: 'Estatísticas Rápidas', enabled: true },
            { id: 'services', label: 'Serviços Exclusivos', enabled: true },
            { id: 'featured', label: 'Destaques da Semana', enabled: true },
            { id: 'testimonials', label: 'Depoimentos', enabled: true },
            { id: 'about', label: 'Sobre Mim', enabled: true },
            { id: 'faq', label: 'Perguntas Frequentes', enabled: true }
        ],
        formFields: [
            { id: 'name', label: 'Nome', enabled: true, required: true },
            { id: 'phone', label: 'Telefone (WhatsApp)', enabled: true, required: true },
            { id: 'email', label: 'E-mail', enabled: true, required: false },
            { id: 'price_range', label: 'Faixa de Preço', enabled: false, required: false },
            { id: 'location', label: 'Bairro de Interesse', enabled: false, required: false },
            { id: 'message', label: 'Mensagem', enabled: true, required: false }
        ]
    });

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setConfig(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert('Você precisa estar logado para publicar.');
                setIsPublishing(false);
                return;
            }

            const { error } = await supabase
                .from('site_configs')
                .upsert({
                    user_id: user.id,
                    slug: config.subdomain,
                    config: config
                }, { onConflict: 'user_id' });

            if (error) throw error;

            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error publishing site:', error);
            alert('Erro ao publicar o site. Tente novamente.');
        } finally {
            setIsPublishing(false);
        }
    };

    const toggleSection = (id: string) => {
        setConfig(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id && !s.fixed ? { ...s, enabled: !s.enabled } : s)
        }));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...config.sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setConfig(prev => ({ ...prev, sections: newSections }));
    };

    const toggleFormField = (id: string, field: 'enabled' | 'required') => {
        setConfig(prev => ({
            ...prev,
            formFields: prev.formFields.map(f => f.id === id ? { ...f, [field]: !f[field] } : f)
        }));
    };

    return (
        <AdminLayout activeTab="site-editor" as any>
            <div className="p-6 md:p-8 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                    <div>
                        <h1 className="text-2xl font-black text-dark-accent tracking-tight">Editor do Site</h1>
                        <p className="text-sm text-gray-500">Personalize seu site em tempo real.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center">
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-gray-100 text-dark-accent' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <span className="material-symbols-outlined text-lg">smartphone</span>
                            </button>
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-gray-100 text-dark-accent' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <span className="material-symbols-outlined text-lg">desktop_mac</span>
                            </button>
                        </div>
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="px-4 py-2 bg-primary text-dark-accent rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-green-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPublishing ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-accent"></span>
                                    Publicando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                                    Publicar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex gap-8 overflow-hidden">
                    {/* Left Panel - Controls */}
                    <div className="w-full md:w-[400px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden shrink-0">
                        {/* Tabs */}
                        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100">
                            {[
                                { id: 'appearance', label: 'Aparência' },
                                { id: 'content', label: 'Conteúdo' },
                                { id: 'sections', label: 'Seções' },
                                { id: 'form', label: 'Form' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-4 text-xs font-bold transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary bg-gray-50' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Controls Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeTab === 'appearance' && (
                                <>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Identidade Visual</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-2">Cor Principal</label>
                                                <div className="flex items-center gap-2 border border-gray-200 p-2 rounded-lg">
                                                    <input
                                                        type="color"
                                                        className="size-8 rounded cursor-pointer border-0 p-0"
                                                        value={config.brandColor}
                                                        onChange={(e) => setConfig({ ...config, brandColor: e.target.value })}
                                                    />
                                                    <span className="text-xs font-mono text-gray-600">{config.brandColor}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-2">Fundo</label>
                                                <div className="flex items-center gap-2 border border-gray-200 p-2 rounded-lg">
                                                    <input
                                                        type="color"
                                                        className="size-8 rounded cursor-pointer border-0 p-0"
                                                        value={config.backgroundColor}
                                                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                                                    />
                                                    <span className="text-xs font-mono text-gray-600">{config.backgroundColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Logotipo</h3>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                        />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                                        >
                                            {config.logoUrl ? (
                                                <div className="relative">
                                                    <img src={config.logoUrl} alt="Logo Preview" className="h-16 mx-auto object-contain mb-2" />
                                                    <p className="text-xs text-primary font-bold">Clique para trocar</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-3xl text-gray-300 group-hover:text-primary mb-2">cloud_upload</span>
                                                    <p className="text-xs font-bold text-gray-500 group-hover:text-primary">Fazer upload do logo</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Template</h3>
                                        <div className="space-y-3">
                                            {['Minimalista', 'Luxo', 'Foco em Leads'].map(template => (
                                                <div
                                                    key={template}
                                                    onClick={() => setConfig({ ...config, template: template as any })}
                                                    className={`border rounded-xl p-3 cursor-pointer flex items-center gap-3 transition-all ${config.template === template
                                                        ? 'border-primary bg-primary/5 shadow-sm'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className={`size-10 rounded-lg ${template === 'Luxo' ? 'bg-black' : 'bg-gray-100'}`}></div>
                                                    <div>
                                                        <p className={`text-sm font-bold ${config.template === template ? 'text-dark-accent' : 'text-gray-600'}`}>{template}</p>
                                                        <p className="text-[10px] text-gray-400">Layout otimizado para {template.toLowerCase()}</p>
                                                    </div>
                                                    {config.template === template && (
                                                        <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'content' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Endereço do Site (Slug)</label>
                                        <div className="flex items-center">
                                            <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-r-0 border-gray-200 text-gray-500 text-sm font-medium whitespace-nowrap">
                                                brokerlink.netlify.app/s/
                                            </div>
                                            <input
                                                type="text"
                                                className="flex-1 px-3 py-2 rounded-r-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                                                value={config.subdomain}
                                                onChange={(e) => setConfig({ ...config, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                                placeholder="nome-da-corretora"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">Este será o link que você enviará para seus clientes.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Título do Site</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                                            value={config.title}
                                            onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Descrição (Bio)</label>
                                        <textarea
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm h-24 resize-none"
                                            value={config.description}
                                            onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Regiões Atendidas</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                                            value={config.regions}
                                            onChange={(e) => setConfig({ ...config, regions: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'sections' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Organizar Seções</h3>
                                    <div className="space-y-2">
                                        {config.sections.map((section, index) => (
                                            <div key={section.id} className={`flex items-center justify-between p-3 border rounded-xl transition-all ${section.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => moveSection(index, 'up')}
                                                            disabled={index === 0}
                                                            className="text-gray-300 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                                                        </button>
                                                        <button
                                                            onClick={() => moveSection(index, 'down')}
                                                            disabled={index === config.sections.length - 1}
                                                            className="text-gray-300 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                                                        </button>
                                                    </div>
                                                    <span className="font-bold text-gray-700 text-sm">{section.label}</span>
                                                </div>

                                                {!section.fixed && (
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={section.enabled}
                                                            onChange={() => toggleSection(section.id)}
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                )}
                                                {section.fixed && (
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">Fixo</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'form' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Configurar Formulário</h3>
                                    <p className="text-xs text-gray-500 mb-4">Personalize os campos do seu formulário de contato.</p>

                                    <div className="space-y-3">
                                        {config.formFields.map(field => (
                                            <div key={field.id} className="p-3 border border-gray-100 rounded-xl bg-white hover:border-gray-200 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-gray-700 text-sm">{field.label}</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={field.enabled}
                                                            onChange={() => toggleFormField(field.id, 'enabled')}
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>

                                                {field.enabled && (
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                                                        <input
                                                            type="checkbox"
                                                            id={`req-${field.id}`}
                                                            checked={field.required}
                                                            onChange={() => toggleFormField(field.id, 'required')}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                        />
                                                        <label htmlFor={`req-${field.id}`} className="text-xs text-gray-500 select-none cursor-pointer">
                                                            Campo Obrigatório
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Live Preview */}
                    <div className="flex-1 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center p-8 overflow-hidden relative">
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <SitePreview config={config} viewMode={viewMode} />
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                        <div className="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-dark-accent mb-2">Site Publicado!</h2>
                        <p className="text-center text-gray-500 mb-8">Seu site já está no ar e pronto para receber visitas.</p>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 flex items-center justify-between gap-3">
                            <span className="text-sm font-mono text-gray-600 truncate">
                                https://brokerlink.netlify.app/s/{config.subdomain}
                            </span>
                            <button
                                onClick={() => navigator.clipboard.writeText(`https://brokerlink.netlify.app/s/${config.subdomain}`)}
                                className="text-primary hover:text-green-600 font-bold text-xs uppercase"
                            >
                                Copiar
                            </button>
                        </div>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 bg-primary text-dark-accent rounded-xl font-bold hover:bg-green-400 transition-colors"
                        >
                            Voltar para o Editor
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default SiteEditor;
