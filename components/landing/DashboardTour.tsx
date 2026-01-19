import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurFade } from '../ui/blur-fade';
import { Link } from 'react-router-dom';

const modules = [
    {
        id: 'properties',
        title: 'Central de Imóveis',
        subtitle: 'Catálogo + Saúde do anúncio',
        icon: 'apartment',
        howItWorks: [
            'Cadastre imóvel com fotos, descrição, comodidades, condomínio/IPTU e comissão.',
            'Defina status: Disponível / Reservado / Em negociação / Vendido / Alugado.',
            'Veja “saúde do anúncio”: cliques, visitas e tempo parado.'
        ],
        result: 'Catálogo sempre atualizado + você sabe quais imóveis estão “morrendo” e precisam de ação.'
    },
    {
        id: 'crm',
        title: 'Leads & CRM',
        subtitle: 'Funil de fechamento',
        icon: 'funnel_metrics',
        howItWorks: [
            'Lead entra pelo site/catálogo e já chega com nome + telefone + imóvel de interesse.',
            'Funil por etapas (novo → contato → visita → proposta → fechamento).',
            'Ações rápidas: WhatsApp, agendar visita, criar proposta.'
        ],
        result: 'Acabou “lead perdido no WhatsApp”.'
    },
    {
        id: 'automation',
        title: 'Automação Inteligente',
        subtitle: 'Sem ser robô chato',
        icon: 'smart_toy',
        howItWorks: [
            'Templates prontos por etapa: pós-contato, pós-visita, pós-proposta, “sumiu”.',
            'Gatilhos automáticos: lead novo, visita marcada, avaliação marcada, proposta enviada.',
            'Mensagens com variáveis (nome, imóvel, data/hora, link WhatsApp).'
        ],
        result: 'Resposta rápida + follow-up consistente = mais visitas e fechamentos.'
    },
    {
        id: 'agenda',
        title: 'Agenda de Guerra',
        subtitle: 'Visitas',
        icon: 'calendar_clock',
        howItWorks: [
            'Calendário e lista de próximas visitas com status: compareceu / furou / remarcou.',
            'Check-in pós-visita em 1 clique e próxima ação sugerida em 24h.',
            'Rotas do dia (para reduzir deslocamento).'
        ],
        result: 'Menos furos, menos caos e mais produtividade.'
    },
    {
        id: 'proposals',
        title: 'Propostas & Negociação',
        subtitle: 'O coração do dinheiro',
        icon: 'handshake',
        howItWorks: [
            'Registre propostas por imóvel (valor, entrada, condições, financiamento).',
            'Timeline da negociação (histórico do que foi dito e quando).',
            'Calculadora de viabilidade: desconto e comissão estimada.'
        ],
        result: 'Negociação organizada e controle total do que está “perto de fechar”.'
    },
    {
        id: 'docs',
        title: 'Documentos & Checklist',
        subtitle: 'Compra e Aluguel',
        icon: 'description',
        howItWorks: [
            'Checklist por etapa com progresso por lead.',
            'Upload/links de RG, CPF, matrícula, certidões e contratos.',
            'Modelos prontos: contrato, reserva, declarações.'
        ],
        result: 'Menos enrolação e fechamento mais rápido.'
    },
    {
        id: 'priorities',
        title: 'Prioridades',
        subtitle: 'Top 5 do dia',
        icon: 'priority_high',
        howItWorks: [
            'Top 5 de hoje (MITs).',
            'Follow-ups vencendo hoje / atrasados.',
            'Alertas se passou X dias sem resposta.'
        ],
        result: 'Você faz o que dá dinheiro primeiro.'
    },
    {
        id: 'finance',
        title: 'Financeiro',
        subtitle: 'Simples e poderoso',
        icon: 'attach_money',
        howItWorks: [
            'Comissões previstas vs recebidas.',
            'Gastos (tráfego, anúncios, combustível, taxa).',
            'Meta do mês + projeção (velocímetro).'
        ],
        result: 'Controle real do lucro e do ritmo de vendas.'
    },
    {
        id: 'reactivation',
        title: 'Reativação 1-clique',
        subtitle: 'Dinheiro na gaveta',
        icon: 'restore_from_trash',
        howItWorks: [
            'Selecione leads dos últimos 60/90 dias.',
            'Segmenta por perfil (financiamento/aluguel/alto padrão).',
            'Mensagem humana pronta + envio guiado.'
        ],
        result: 'Recupera oportunidades esquecidas.'
    }
];

const automations = [
    { title: 'Lead novo', desc: 'Aviso imediato com nome, telefone e imóvel' },
    { title: 'Visita marcada', desc: 'Lembrete + check-in' },
    { title: 'Avaliação marcada', desc: 'Aviso + instruções do próximo passo' }
];

export const DashboardTour: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [showModal, setShowModal] = useState(false);

    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <BlurFade delay={0.2} inView={true}>
                        <h2 className="text-3xl md:text-4xl font-black text-dark-accent mb-4">
                            Touro Guiado do Dashboard
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                            Tudo o que vem no <span className="text-primary font-bold">BrokerPilot</span>
                        </p>
                    </BlurFade>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 mb-20">
                    {/* Sidebar / Tabs */}
                    <div className="w-full lg:w-1/3 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 hide-scrollbar">
                        {modules.map((module, index) => (
                            <button
                                key={module.id}
                                onClick={() => setActiveTab(index)}
                                className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all min-w-[260px] lg:min-w-0 ${activeTab === index
                                    ? 'bg-dark-accent text-white shadow-lg scale-[1.02]'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <div className={`size-10 rounded-lg flex items-center justify-center ${activeTab === index ? 'bg-primary text-dark-accent' : 'bg-white text-gray-400'
                                    }`}>
                                    <span className="material-symbols-outlined">{module.icon}</span>
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${activeTab === index ? 'text-white' : 'text-gray-700'}`}>
                                        {module.title}
                                    </p>
                                    <p className={`text-xs ${activeTab === index ? 'text-gray-300' : 'text-gray-400'}`}>
                                        {module.subtitle}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Content Panel */}
                    <div className="w-full lg:w-2/3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200 h-full flex flex-col"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="size-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                        <span className="material-symbols-outlined text-3xl text-dark-accent">
                                            {modules[activeTab].icon}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-dark-accent">
                                            {modules[activeTab].title}
                                        </h3>
                                        <p className="text-gray-500 font-medium">
                                            {modules[activeTab].subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-8 flex-1">
                                    <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-4">
                                        Como funciona
                                    </h4>
                                    <ul className="space-y-4">
                                        {modules[activeTab].howItWorks.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-700">
                                                <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-8">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-green-600">trending_up</span>
                                        <div>
                                            <p className="text-xs font-black uppercase text-green-600 tracking-widest mb-1">Resultado</p>
                                            <p className="font-bold text-dark-accent">
                                                {modules[activeTab].result}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowModal(true)}
                                    className="self-start px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                    Ver exemplo
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Extras Section */}
                <div className="mb-16">
                    <h3 className="text-xl font-black text-dark-accent mb-8 text-center">
                        O que automatiza hoje
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {automations.map((auto, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="size-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-green-600">bolt</span>
                                </div>
                                <div>
                                    <p className="font-bold text-dark-accent text-sm">{auto.title}</p>
                                    <p className="text-xs text-gray-500">{auto.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Secondary CTA */}
                <div className="text-center">
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-dark-accent text-white rounded-2xl text-lg font-bold shadow-xl hover:bg-black transition-all hover:-translate-y-1"
                    >
                        Quero ver o BrokerPilot por dentro
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            </div>

            {/* Example Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl p-2 max-w-4xl w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute -top-4 -right-4 size-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
                        >
                            <span className="material-symbols-outlined text-dark-accent">close</span>
                        </button>
                        <div className="bg-gray-100 rounded-2xl aspect-video flex items-center justify-center overflow-hidden">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">image</span>
                                <p className="text-gray-400 font-bold">Preview do Módulo: {modules[activeTab].title}</p>
                                <p className="text-xs text-gray-400 mt-2">(Imagem ilustrativa do sistema)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
