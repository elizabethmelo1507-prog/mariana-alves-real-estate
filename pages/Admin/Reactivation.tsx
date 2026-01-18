
import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Lead, Task } from '../../types';

interface ReactivationStats {
    sent: number;
    responses: number;
    visits: number;
    proposals: number;
}

const Reactivation: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'select' | 'messages' | 'results'>('select');
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

    // Filters
    const [period, setPeriod] = useState(60); // days
    const [minDaysInactive, setMinDaysInactive] = useState(7);
    const [excludeClosed, setExcludeClosed] = useState(true);
    const [excludeBadLeads, setExcludeBadLeads] = useState(true);
    const [segments, setSegments] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'chance' | 'time' | 'budget' | 'activity'>('chance');

    // Templates
    const [templates, setTemplates] = useState([
        {
            id: 'general',
            name: 'Geral (Humano)',
            text: 'Oi, {NOME_LEAD}! Passando rapidinho 🙂 \nSemana passada eu separei algumas opções na sua faixa e região. Ainda faz sentido pra você procurar algo em {BAIRRO} na faixa de {BUDGET}? \nSe quiser, eu te mando 2–3 opções bem certeiras agora.',
            segment: 'Geral'
        },
        {
            id: 'financing',
            name: 'Financiamento',
            text: 'Oi, {NOME_LEAD}! Tudo bem? 🙂\nLembrei de você porque apareceu uma opção que encaixa com financiamento e com a faixa que você comentou.\nVocê quer que eu te mande 2–3 imóveis e, se precisar, uma simulação básica de financiamento?',
            segment: 'Financiamento'
        },
        {
            id: 'rent',
            name: 'Aluguel',
            text: 'Oi, {NOME_LEAD}! Oi! 🙂\nSó pra não deixar passar: surgiram opções de aluguel na região de {BAIRRO}. \nVocê ainda tá buscando? Se sim, me diz seu prazo e eu te mando as melhores ainda hoje.',
            segment: 'Aluguel'
        },
        {
            id: 'luxury',
            name: 'Alto Padrão',
            text: 'Oi, {NOME_LEAD}! Tudo certo? 🙂\nEntraram algumas oportunidades bem interessantes na região que você gosta. \nSe você quiser, eu te envio uma seleção bem enxuta (2–3 opções) pra você avaliar com calma.',
            segment: 'Alto Padrão'
        }
    ]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('general');
    const [editingTemplateText, setEditingTemplateText] = useState('');
    const [showSignature, setShowSignature] = useState(true);

    // Batch Mode
    const [batchMode, setBatchMode] = useState(false);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

    // Stats
    const [stats, setStats] = useState<ReactivationStats>({
        sent: 0,
        responses: 0,
        visits: 0,
        proposals: 0
    });

    useEffect(() => {
        fetchLeads();
        fetchStats();
    }, [period, minDaysInactive, excludeClosed, excludeBadLeads]);

    useEffect(() => {
        const t = templates.find(t => t.id === selectedTemplateId);
        if (t) setEditingTemplateText(t.text);
    }, [selectedTemplateId]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - period);

            let query = supabase
                .from('leads')
                .select('*')
                .gte('created_at', dateLimit.toISOString());

            if (excludeClosed) {
                query = query.not('status', 'eq', 'Fechado');
            }
            if (excludeBadLeads) {
                query = query.eq('isBadLead', false);
            }

            const { data, error } = await query;
            if (error) throw error;

            const mappedLeads: Lead[] = (data || []).map((l: any) => ({
                id: l.id,
                name: l.name,
                phone: l.phone,
                email: l.email,
                status: l.status,
                property: l.property || l.property_code || 'Geral',
                propertyCode: l.property_code,
                propertyId: l.property_id,
                timestamp: l.created_at,
                lastContactAt: l.last_contact_at || l.created_at,
                score: l.score || 0,
                qualificationLabel: l.qualification_label,
                intent: l.intent,
                paymentMethod: l.payment_method,
                budgetMax: l.budget_max,
                neighborhoods: l.neighborhoods,
                last_reactivation_at: l.last_reactivation_at,
                reactivation_touch_count: l.reactivation_touch_count,
                reactivation_status: l.reactivation_status,
                isBadLead: l.isBadLead || false
            }));

            // Filter by inactivity (last_contact_at or timestamp)
            const now = new Date();
            const filtered = mappedLeads.filter((lead: Lead) => {
                const lastActivity = new Date(lead.lastContactAt || lead.timestamp);
                const daysDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24);

                // Anti-spam: check last_reactivation_at
                if (lead.last_reactivation_at) {
                    const lastReact = new Date(lead.last_reactivation_at);
                    const daysSinceReact = (now.getTime() - lastReact.getTime()) / (1000 * 3600 * 24);
                    if (daysSinceReact < 7) return false;
                }

                return daysDiff >= minDaysInactive;
            });

            setLeads(filtered);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        // Simple mock for now, in a real app would query interactions
        setStats({
            sent: 12,
            responses: 5,
            visits: 2,
            proposals: 1
        });
    };

    const getPlaceholderValue = (lead: Lead, placeholder: string) => {
        switch (placeholder) {
            case '{NOME_LEAD}': return lead.name.split(' ')[0];
            case '{BAIRRO}': return lead.neighborhoods?.[0] || 'sua região';
            case '{BUDGET}': return lead.budgetMax ? `R$ ${lead.budgetMax.toLocaleString('pt-BR')}` : 'sua faixa';
            case '{INTENCAO}': return lead.intent === 'BUY' ? 'compra' : 'aluguel';
            case '{PAGAMENTO}': return lead.paymentMethod === 'FINANCING' ? 'financiamento' : 'à vista';
            default: return '';
        }
    };

    const formatMessage = (lead: Lead, text: string) => {
        let formatted = text;
        ['{NOME_LEAD}', '{BAIRRO}', '{BUDGET}', '{INTENCAO}', '{PAGAMENTO}'].forEach(p => {
            formatted = formatted.replace(new RegExp(p, 'g'), getPlaceholderValue(lead, p));
        });

        if (showSignature) {
            formatted += '\n\n— Mariana Alves | CRECI AM-12345';
        }

        return formatted;
    };

    const handleReactivate = async (lead: Lead) => {
        const message = formatMessage(lead, editingTemplateText);
        try {
            const { sendAutomationShortcutToWebhook } = await import('../../lib/supabase');
            await sendAutomationShortcutToWebhook(lead, 'Reativação', message);
        } catch (err) {
            console.error('Error sending reactivation via webhook:', err);
        }

        // Log action
        try {
            await supabase.from('lead_interactions').insert([{
                lead_id: lead.id,
                type: 'message_sent',
                channel: 'whatsapp_auto',
                message: `Reativação enviada: "${message.substring(0, 50)}..."`,
                created_at: new Date().toISOString()
            }]);

            await supabase.from('leads').update({
                last_reactivation_at: new Date().toISOString(),
                reactivation_touch_count: (lead.reactivation_touch_count || 0) + 1,
                reactivation_status: 'ACTIVE'
            }).eq('id', lead.id);

            // Create follow-up task in lead_next_steps
            await supabase.from('lead_next_steps').insert([{
                lead_id: lead.id,
                sequence_name: 'Reativação Follow-up',
                message: `Follow-up reativação: ${lead.name}`,
                scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending',
                touch_index: (lead.reactivation_touch_count || 0) + 1
            }]);

            fetchLeads();
        } catch (error) {
            console.error('Error logging reactivation:', error);
        }
    };

    const startBatchMode = () => {
        if (selectedLeadIds.length === 0) return;
        setBatchMode(true);
        setCurrentBatchIndex(0);
    };

    const handleNextInBatch = () => {
        const lead = leads.find(l => l.id === selectedLeadIds[currentBatchIndex]);
        if (lead) {
            handleReactivate(lead);
        }

        if (currentBatchIndex < selectedLeadIds.length - 1) {
            setCurrentBatchIndex(prev => prev + 1);
        } else {
            setBatchMode(false);
            setSelectedLeadIds([]);
            alert('Fluxo de reativação em lote concluído! ✅');
        }
    };

    const sortedLeads = useMemo(() => {
        let result = [...leads];
        if (sortBy === 'budget') {
            result.sort((a, b) => (b.budgetMax || 0) - (a.budgetMax || 0));
        } else if (sortBy === 'time') {
            result.sort((a, b) => {
                const dateA = new Date(a.lastContactAt || a.timestamp).getTime();
                const dateB = new Date(b.lastContactAt || b.timestamp).getTime();
                return dateA - dateB;
            });
        } else if (sortBy === 'activity') {
            result.sort((a, b) => {
                const dateA = new Date(a.lastContactAt || a.timestamp).getTime();
                const dateB = new Date(b.lastContactAt || b.timestamp).getTime();
                return dateB - dateA;
            });
        } else {
            // Chance (Quente primeiro)
            const scoreMap = { 'HOT': 3, 'WARM': 2, 'COLD': 1 };
            result.sort((a, b) => (scoreMap[b.qualificationLabel || 'COLD'] || 0) - (scoreMap[a.qualificationLabel || 'COLD'] || 0));
        }
        return result;
    }, [leads, sortBy]);

    return (
        <AdminLayout activeTab="reactivation">
            <header className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-dark-accent">Reativação de Leads</h1>
                        <p className="text-gray-500 text-sm">Recupere contatos antigos com mensagens personalizadas.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-primary/10 px-4 py-2 rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                            <span className="text-xs font-black text-primary uppercase tracking-widest">{leads.length} Leads Disponíveis</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full md:w-max">
                    <button onClick={() => setActiveTab('select')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'select' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Selecionar Leads</button>
                    <button onClick={() => setActiveTab('messages')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'messages' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Mensagens</button>
                    <button onClick={() => setActiveTab('results')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Resultados</button>
                </div>
            </header>

            <main className="px-6 py-8 pb-32">
                {activeTab === 'select' && (
                    <div className="space-y-8">
                        {/* Filters Section */}
                        <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Período (Dias)</label>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(Number(e.target.value))}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-3 font-bold text-sm"
                                >
                                    <option value={30}>Últimos 30 dias</option>
                                    <option value={60}>Últimos 60 dias</option>
                                    <option value={90}>Últimos 90 dias</option>
                                    <option value={365}>Último ano</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Inativo há (Dias)</label>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                                    <input
                                        type="range"
                                        min="1"
                                        max="30"
                                        value={minDaysInactive}
                                        onChange={(e) => setMinDaysInactive(Number(e.target.value))}
                                        className="flex-1 accent-primary"
                                    />
                                    <span className="text-sm font-black text-dark-accent w-8">{minDaysInactive}d</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Ordenação</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-3 font-bold text-sm"
                                >
                                    <option value="chance">Maior chance (HOT)</option>
                                    <option value="time">Mais tempo parado</option>
                                    <option value="budget">Maior budget</option>
                                    <option value="activity">Última atividade</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    onClick={() => { setExcludeClosed(!excludeClosed); fetchLeads(); }}
                                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${excludeClosed ? 'bg-dark-accent text-white' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    Excluir Fechados
                                </button>
                            </div>
                        </section>

                        {/* Leads List */}
                        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 w-12">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={selectedLeadIds.length === leads.length && leads.length > 0}
                                                onChange={(e) => setSelectedLeadIds(e.target.checked ? leads.map(l => l.id) : [])}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Lead</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Segmento / Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Inatividade</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">Carregando leads...</td>
                                        </tr>
                                    ) : sortedLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">Nenhum lead encontrado para os filtros selecionados.</td>
                                        </tr>
                                    ) : (
                                        sortedLeads.map(lead => {
                                            const lastActivity = new Date(lead.lastContactAt || lead.timestamp);
                                            const daysInactive = Math.floor((new Date().getTime() - lastActivity.getTime()) / (1000 * 3600 * 24));

                                            return (
                                                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                                            checked={selectedLeadIds.includes(lead.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedLeadIds([...selectedLeadIds, lead.id]);
                                                                else setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id));
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div>
                                                            <h3 className="font-black text-dark-accent leading-none mb-1">{lead.name}</h3>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lead.propertyCode || 'Interesse Geral'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {lead.paymentMethod === 'FINANCING' && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest">Financiamento</span>}
                                                            {lead.intent === 'RENT' && <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase tracking-widest">Aluguel</span>}
                                                            {(lead.budgetMax || 0) >= 1000000 && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-black uppercase tracking-widest">Alto Padrão</span>}
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${lead.qualificationLabel === 'HOT' ? 'bg-red-50 text-red-600' :
                                                                lead.qualificationLabel === 'WARM' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'
                                                                }`}>{lead.qualificationLabel || 'COLD'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`size-2 rounded-full ${daysInactive > 15 ? 'bg-red-500' : daysInactive > 7 ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                                                            <span className="text-sm font-black text-dark-accent">{daysInactive} dias parado</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button
                                                            onClick={() => handleReactivate(lead)}
                                                            className="bg-primary text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-xl transition-all"
                                                        >
                                                            Reativar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-4">
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Templates</h3>
                            {templates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTemplateId(t.id)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedTemplateId === t.id ? 'bg-primary/10 border-primary' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                >
                                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${selectedTemplateId === t.id ? 'text-primary' : 'text-gray-400'}`}>{t.segment}</p>
                                    <p className="text-sm font-black text-dark-accent">{t.name}</p>
                                </button>
                            ))}
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-lg text-dark-accent">Editar Mensagem</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assinatura</span>
                                        <button
                                            onClick={() => setShowSignature(!showSignature)}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${showSignature ? 'bg-primary' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 size-3 rounded-full bg-white transition-all ${showSignature ? 'left-6' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    value={editingTemplateText}
                                    onChange={(e) => setEditingTemplateText(e.target.value)}
                                    className="w-full h-64 bg-gray-50 border-none rounded-3xl p-6 font-medium text-gray-600 leading-relaxed focus:ring-2 focus:ring-primary/20"
                                    placeholder="Escreva sua mensagem aqui..."
                                />

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Placeholders Disponíveis</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['{NOME_LEAD}', '{BAIRRO}', '{BUDGET}', '{INTENCAO}', '{PAGAMENTO}'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setEditingTemplateText(prev => prev + ' ' + p)}
                                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-gray-500 transition-colors"
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-dark-accent p-6 rounded-[32px] text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-primary">visibility</span>
                                    <h4 className="font-black text-sm uppercase tracking-widest">Prévia (Lead Exemplo)</h4>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 italic text-sm text-gray-300">
                                    "{formatMessage({ name: 'Ricardo Silva', neighborhoods: ['Ponta Negra'], budgetMax: 850000, intent: 'BUY', paymentMethod: 'FINANCING' } as Lead, editingTemplateText)}"
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Reativados (Semana)', value: stats.sent, icon: 'send', color: 'primary' },
                                { label: 'Respostas', value: stats.responses, icon: 'chat', color: 'blue-500' },
                                { label: 'Visitas Agendadas', value: stats.visits, icon: 'calendar_month', color: 'purple-500' },
                                { label: 'Propostas Iniciadas', value: stats.proposals, icon: 'contract_edit', color: 'green-500' }
                            ].map(card => (
                                <div key={card.label} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                                    <div className={`size-12 rounded-2xl bg-${card.color}/10 flex items-center justify-center mb-4`}>
                                        <span className={`material-symbols-outlined text-${card.color}`}>{card.icon}</span>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                                    <h4 className="text-3xl font-black text-dark-accent">{card.value}</h4>
                                </div>
                            ))}
                        </div>

                        <div className="bg-dark-accent p-8 rounded-[40px] text-white overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-2">Impacto da Reativação</h3>
                                <p className="text-gray-400 text-sm mb-8">Conversão de leads parados em oportunidades reais.</p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                            <span>Taxa de Resposta</span>
                                            <span className="text-primary">{Math.round((stats.responses / stats.sent) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${(stats.responses / stats.sent) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                            <span>Conversão em Visita</span>
                                            <span className="text-purple-400">{Math.round((stats.visits / stats.sent) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-400" style={{ width: `${(stats.visits / stats.sent) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[200px] text-white/5 rotate-12">trending_up</span>
                        </div>
                    </div>
                )}
            </main>

            {/* Sticky Footer for Selection */}
            {selectedLeadIds.length > 0 && activeTab === 'select' && !batchMode && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
                    <div className="bg-dark-accent text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 border border-white/10">
                        <div className="flex items-center gap-3 pr-8 border-r border-white/10">
                            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-black font-bold">group</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selecionados</p>
                                <p className="text-lg font-black">{selectedLeadIds.length} Leads</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={startBatchMode}
                                className="bg-primary text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">bolt</span>
                                Reativar em Lote
                            </button>
                            <button
                                onClick={() => setSelectedLeadIds([])}
                                className="bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Mode Modal */}
            {batchMode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up">
                        <div className="p-8 bg-slate-50 border-b border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined text-black font-bold">bolt</span>
                                    </div>
                                    <h3 className="text-xl font-black text-dark-accent">Modo Lote Ativo</h3>
                                </div>
                                <button onClick={() => setBatchMode(false)} className="size-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    <span>Progresso</span>
                                    <span>{currentBatchIndex + 1} de {selectedLeadIds.length}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${((currentBatchIndex + 1) / selectedLeadIds.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {leads.find(l => l.id === selectedLeadIds[currentBatchIndex]) && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Próximo Lead</p>
                                        <h4 className="text-2xl font-black text-dark-accent">{leads.find(l => l.id === selectedLeadIds[currentBatchIndex])?.name}</h4>
                                        <p className="text-sm font-bold text-primary">{leads.find(l => l.id === selectedLeadIds[currentBatchIndex])?.phone}</p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 italic text-sm text-gray-500">
                                        "{formatMessage(leads.find(l => l.id === selectedLeadIds[currentBatchIndex])!, editingTemplateText)}"
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleNextInBatch}
                                            className="w-full bg-primary text-black h-16 rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                                        >
                                            <span className="material-symbols-outlined font-bold">chat</span>
                                            Abrir no WhatsApp
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setCurrentBatchIndex(prev => prev + 1)}
                                                className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                            >
                                                Pular
                                            </button>
                                            <button
                                                onClick={() => setBatchMode(false)}
                                                className="py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
                                            >
                                                Parar Fluxo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Reactivation;
