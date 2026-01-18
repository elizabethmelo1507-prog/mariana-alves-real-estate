import React, { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

const Automation: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'rules' | 'templates'>('rules');

    return (
        <AdminLayout activeTab="automation" as any>
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-dark-accent tracking-tight">Automação e Mensagens</h1>
                        <p className="text-sm text-gray-500">Configure respostas automáticas e modelos de mensagem.</p>
                    </div>
                    <button className="px-4 py-2 bg-primary text-dark-accent rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-green-400 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">add</span>
                        {activeTab === 'rules' ? 'Nova Regra' : 'Novo Modelo'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'rules' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Regras de Automação
                        {activeTab === 'rules' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'templates' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Modelos de Mensagem
                        {activeTab === 'templates' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'rules' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Example Rule Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div className="size-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <span className="material-symbols-outlined">whatsapp</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-full">Ativo</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Boas-vindas ao Lead</h3>
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">Envia uma mensagem de apresentação no WhatsApp assim que um novo lead se cadastra.</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                                <span>Disparado 124 vezes</span>
                            </div>
                        </div>

                        {/* New Rule Placeholder */}
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group min-h-[200px]">
                            <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-primary mb-3">add_circle</span>
                            <h3 className="font-bold text-gray-400 group-hover:text-primary">Criar Nova Automação</h3>
                        </div>
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="space-y-4">
                        {/* Example Template Item */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                    <span className="material-symbols-outlined">chat</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">Apresentação Inicial</h3>
                                    <p className="text-xs text-gray-500">Olá [Nome], vi que você se interessou pelo imóvel...</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-primary">
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                    <span className="material-symbols-outlined">schedule</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">Agendamento de Visita</h3>
                                    <p className="text-xs text-gray-500">Confirmado! Nossa visita ficou agendada para...</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-primary">
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Automation;
