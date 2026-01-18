import React, { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

const SiteEditor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'appearance' | 'content' | 'sections' | 'form'>('appearance');

    return (
        <AdminLayout activeTab="site-editor" as any>
            <div className="p-6 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-dark-accent tracking-tight">Editor do Site</h1>
                        <p className="text-gray-500 mt-1">Personalize a aparência e o conteúdo do seu site.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Ver Site
                        </button>
                        <button className="px-4 py-2 bg-primary text-dark-accent rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-green-400 transition-colors">
                            Salvar Alterações
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 mb-8 gap-8">
                    {[
                        { id: 'appearance', label: 'Aparência' },
                        { id: 'content', label: 'Conteúdo' },
                        { id: 'sections', label: 'Seções' },
                        { id: 'form', label: 'Formulário' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 min-h-[400px]">
                    {activeTab === 'appearance' && (
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-bold text-dark-accent mb-4">Cores da Marca</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Cor Principal</label>
                                        <div className="flex items-center gap-3">
                                            <input type="color" className="h-10 w-10 rounded-lg cursor-pointer border-0" defaultValue="#00ff88" />
                                            <span className="text-sm font-mono text-gray-600">#00ff88</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Cor de Fundo</label>
                                        <div className="flex items-center gap-3">
                                            <input type="color" className="h-10 w-10 rounded-lg cursor-pointer border-0" defaultValue="#ffffff" />
                                            <span className="text-sm font-mono text-gray-600">#ffffff</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-dark-accent mb-4">Logotipo</h3>
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gray-50">
                                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">cloud_upload</span>
                                    <p className="text-sm font-bold text-gray-600">Clique para fazer upload</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG ou JPG (Max 2MB)</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-dark-accent mb-4">Template</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['Minimalista', 'Luxo', 'Foco em Leads'].map(template => (
                                        <div key={template} className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all">
                                            <div className="aspect-[9/16] bg-gray-100 rounded-lg mb-3"></div>
                                            <p className="text-center font-bold text-sm text-gray-700">{template}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Título do Site</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" defaultValue="Mariana Alves | Real Estate" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Descrição Curta (Bio)</label>
                                <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-24" defaultValue="Imóveis de Alto Padrão em Manaus. Consultoria especializada."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Regiões Atendidas</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" defaultValue="Ponta Negra, Adrianópolis, Vieiralves" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'sections' && (
                        <div className="space-y-4 max-w-2xl">
                            {['Destaques da Semana', 'Serviços Exclusivos', 'Depoimentos', 'Sobre Mim', 'FAQ'].map(section => (
                                <div key={section} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-400 cursor-move">drag_indicator</span>
                                        <span className="font-bold text-gray-700">{section}</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'form' && (
                        <div className="space-y-6 max-w-2xl">
                            <p className="text-sm text-gray-500">Escolha quais campos aparecem no formulário de contato.</p>
                            {['Nome', 'Telefone (WhatsApp)', 'E-mail', 'Faixa de Preço', 'Bairro de Interesse', 'Mensagem'].map(field => (
                                <div key={field} className="flex items-center gap-3">
                                    <input type="checkbox" className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary" defaultChecked />
                                    <span className="text-gray-700 font-medium">{field}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default SiteEditor;
