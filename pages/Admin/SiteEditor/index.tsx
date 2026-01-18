import React, { useState, useRef } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import SitePreview from '../../../components/SitePreview';

const SiteEditor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'appearance' | 'content' | 'sections' | 'form'>('appearance');
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [config, setConfig] = useState({
        brandColor: '#00ff88',
        backgroundColor: '#ffffff',
        logoUrl: '',
        title: 'Mariana Alves | Real Estate',
        description: 'Imóveis de Alto Padrão em Manaus. Consultoria especializada e atendimento personalizado.',
        template: 'Minimalista' as 'Minimalista' | 'Luxo' | 'Foco em Leads',
        regions: 'Ponta Negra, Adrianópolis, Vieiralves',
        subdomain: 'marianaalves',
        sections: {
            'Destaques da Semana': true,
            'Serviços Exclusivos': true,
            'Depoimentos': true,
            'Sobre Mim': true,
            'FAQ': true
        } as Record<string, boolean>,
        formFields: {
            'Nome': true,
            'Telefone': true,
            'E-mail': true,
            'Mensagem': true,
            'Faixa de Preço': false,
            'Bairro de Interesse': false
        } as Record<string, boolean>
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

    const handlePublish = () => {
        // Simulate API call
        setTimeout(() => {
            setShowSuccessModal(true);
        }, 1000);
    };

    const toggleSection = (section: string) => {
        setConfig(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [section]: !prev.sections[section]
            }
        }));
    };

    const toggleFormField = (field: string) => {
        setConfig(prev => ({
            ...prev,
            formFields: {
                ...prev.formFields,
                [field]: !prev.formFields[field]
            }
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
                            className="px-4 py-2 bg-primary text-dark-accent rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-green-400 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">rocket_launch</span>
                            Publicar Alterações
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
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Subdomínio</label>
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                className="flex-1 px-3 py-2 rounded-l-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-right"
                                                value={config.subdomain}
                                                onChange={(e) => setConfig({ ...config, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                            />
                                            <div className="bg-gray-100 px-3 py-2 rounded-r-lg border border-l-0 border-gray-200 text-gray-500 text-sm font-medium">
                                                .brokerlink.com
                                            </div>
                                        </div>
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
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Gerenciar Seções</h3>
                                    {Object.keys(config.sections).map(section => (
                                        <div key={section} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-gray-400 cursor-move">drag_indicator</span>
                                                <span className="font-bold text-gray-700 text-sm">{section}</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={config.sections[section]}
                                                    onChange={() => toggleSection(section)}
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'form' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Campos do Formulário</h3>
                                    <p className="text-xs text-gray-500 mb-4">Escolha quais informações você quer coletar dos seus leads.</p>
                                    {Object.keys(config.formFields).map(field => (
                                        <div key={field} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                                                checked={config.formFields[field]}
                                                onChange={() => toggleFormField(field)}
                                            />
                                            <span className="text-gray-700 font-medium text-sm">{field}</span>
                                        </div>
                                    ))}
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
                                https://{config.subdomain}.brokerlink.com
                            </span>
                            <button
                                onClick={() => navigator.clipboard.writeText(`https://${config.subdomain}.brokerlink.com`)}
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
