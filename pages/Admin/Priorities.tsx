import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Task, Lead, TaskStatus } from '../../types';

const Priorities: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'per-lead'>('today');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [staleThreshold, setStaleThreshold] = useState(3); // 3 days without contact = stale

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .neq('status', 'Perdido')
        .neq('status', 'Fechado');

      if (leadsError) throw leadsError;

      const mappedLeads: Lead[] = (leadsData || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        property: l.property || l.property_code || 'Geral',
        propertyId: l.property_id,
        propertyCode: l.property_code,
        status: l.status,
        timestamp: new Date(l.created_at).toLocaleDateString('pt-BR'),
        phone: l.phone,
        email: l.email,
        lastContactAt: l.last_contact_at || l.created_at,
        score: l.score || 0,
        qualificationLabel: l.qualification_label,
        intent: l.intent,
        source: l.source
      }));

      setLeads(mappedLeads);

      // 2. Fetch Next Steps (Tasks)
      const { data: nextStepsData, error: nextStepsError } = await supabase
        .from('lead_next_steps')
        .select(`
          *,
          leads (name, property_code, score, qualification_label)
        `)
        .eq('status', 'pending');

      if (nextStepsError) throw nextStepsError;

      const mappedTasks: Task[] = (nextStepsData || []).map((step: any) => ({
        id: step.id,
        userId: 'current-user', // Placeholder
        leadId: step.lead_id,
        leadName: step.leads?.name || 'Lead Desconhecido',
        propertyCode: step.leads?.property_code,
        type: 'FOLLOW_UP', // Default type for next steps
        title: step.message || `Follow-up: ${step.sequence_name}`,
        dueAt: step.scheduled_for,
        priority: step.leads?.qualification_label === 'HOT' ? 'high' : 'med',
        status: 'OPEN',
        score: step.leads?.score || 0,
        qualificationLabel: step.leads?.qualification_label,
        createdAt: step.created_at,
        updatedAt: step.created_at
      }));

      setTasks(mappedTasks);

    } catch (error) {
      console.error('Error fetching priorities data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sorting by Score - Hot Leads first
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // First sort by priority
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      // Then by score
      return (b.score || 0) - (a.score || 0);
    });
  }, [tasks]);

  // MITs: High priority tasks (HOT leads) or Overdue tasks
  const mits = useMemo(() => {
    return sortedTasks.filter(t =>
      t.status === 'OPEN' &&
      (t.qualificationLabel === 'HOT' || new Date(t.dueAt) < new Date())
    );
  }, [sortedTasks]);

  const otherTasks = useMemo(() => {
    return sortedTasks.filter(t => !mits.includes(t));
  }, [sortedTasks, mits]);

  const staleLeads = useMemo(() => {
    return leads.filter(l => {
      if (!l.lastContactAt) return false;
      const days = Math.floor((Date.now() - new Date(l.lastContactAt).getTime()) / 86400000);
      // Only consider stale if no pending task exists for this lead
      const hasPendingTask = tasks.some(t => t.leadId === l.id);
      return days >= staleThreshold && !hasPendingTask;
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [leads, staleThreshold, tasks]);

  const handleWhatsApp = async (lead: Lead | undefined) => {
    if (!lead || !lead.phone) {
      alert('Telefone não disponível');
      return;
    }
    const msg = `Oi, ${lead.name}! Passando rapidinho pra saber se ainda faz sentido olharmos opções como o ${lead.propertyCode || lead.property} — posso te mandar 2–3 alternativas na mesma região e faixa?`;
    try {
      const { sendAutomationShortcutToWebhook } = await import('../../lib/supabase');
      await sendAutomationShortcutToWebhook(lead, 'Reengajamento Prioritário', msg);

      // Save to history
      await supabase.from('lead_interactions').insert([{
        lead_id: lead.id,
        type: 'message_sent',
        channel: 'whatsapp_auto',
        message: msg,
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Error sending priority re-engagement via webhook:', err);
    }

    // Optimistically update last contact
    updateLastContact(lead.id);
  };

  const updateLastContact = async (leadId: string) => {
    try {
      await supabase.from('leads').update({
        last_contact_at: new Date().toISOString()
      }).eq('id', leadId);

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating last contact:', error);
    }
  };

  const getDaysStale = (date: string) => {
    return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;

    if (isToday) return 'Hoje';
    if (isPast) return 'Atrasado';
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <AdminLayout activeTab="priorities">
      <header className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-dark-accent">Painel de Prioridades</h1>
            <p className="text-gray-500 text-sm">Baseado no histórico e interações recentes.</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            title="Atualizar dados"
          >
            <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full md:w-max">
          <button onClick={() => setActiveTab('today')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'today' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Prioridades</button>
          <button onClick={() => setActiveTab('overdue')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'overdue' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Atrasados ({mits.filter(t => new Date(t.dueAt) < new Date()).length})</button>
        </div>
      </header>

      <main className="px-6 py-8 pb-32 space-y-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'today' && (
              <>
                {/* Hot Alert Section */}
                {mits.some(m => m.qualificationLabel === 'HOT') && (
                  <div className="bg-red-500 p-6 rounded-[32px] text-white flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-4xl">local_fire_department</span>
                      <div>
                        <h3 className="font-black">Leads Quentes Pendentes!</h3>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Ação imediata recomendada</p>
                      </div>
                    </div>
                    <button onClick={() => navigate('/admin/leads')} className="bg-white text-red-500 px-6 py-3 rounded-2xl font-black text-xs shadow-xl">Ver Leads</button>
                  </div>
                )}

                {/* MITs Section */}
                <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black">Tarefas Prioritárias (MITs)</h2>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{mits.length} tarefas</span>
                  </div>

                  {mits.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                      <p>Nenhuma tarefa prioritária pendente!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mits.map(task => (
                        <div key={task.id} className="group flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-primary transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-xl flex items-center justify-center font-black text-xs border-2 ${task.qualificationLabel === 'HOT' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-400'
                              }`}>
                              {task.score}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${new Date(task.dueAt) < new Date() ? 'bg-red-100 text-red-600' : 'bg-primary/20 text-primary'
                                  }`}>
                                  {formatDueDate(task.dueAt)}
                                </span>
                                <h3 className="font-black text-dark-accent">{task.title}</h3>
                              </div>
                              <p className="text-xs text-gray-400 font-bold">{task.leadName} • {task.propertyCode}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate('/admin/automation')}
                            className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                          >
                            <span className="material-symbols-outlined">arrow_forward</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Stale Leads sorted by Score */}
                <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black">Leads Esfriando (Sem contato há {staleThreshold}+ dias)</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">Filtrar dias:</span>
                      <select
                        value={staleThreshold}
                        onChange={(e) => setStaleThreshold(Number(e.target.value))}
                        className="bg-gray-100 border-none rounded-lg text-xs font-black px-2 py-1"
                      >
                        <option value={2}>2+ dias</option>
                        <option value={3}>3+ dias</option>
                        <option value={5}>5+ dias</option>
                        <option value={7}>7+ dias</option>
                      </select>
                    </div>
                  </div>

                  {staleLeads.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <span className="material-symbols-outlined text-4xl mb-2">thumb_up</span>
                      <p>Nenhum lead esfriando no momento!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {staleLeads.map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                              <span className="text-xl font-black text-primary">{getDaysStale(lead.lastContactAt)}d</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-black text-sm text-dark-accent">{lead.name}</h3>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${lead.qualificationLabel === 'HOT' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>{lead.qualificationLabel}</span>
                              </div>
                              <p className="text-xs text-gray-500 font-bold">Último contato: {new Date(lead.lastContactAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleWhatsApp(lead)}
                            className="bg-primary text-black size-10 rounded-xl flex items-center justify-center transition-active shadow-lg shadow-primary/20 hover:scale-105"
                            title="Enviar mensagem de reengajamento"
                          >
                            <span className="material-symbols-outlined font-bold">send</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {activeTab === 'overdue' && (
              <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black mb-6 text-red-500">Tarefas Atrasadas</h2>
                <div className="space-y-3">
                  {mits.filter(t => new Date(t.dueAt) < new Date()).map(task => (
                    <div key={task.id} className="group flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-100">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-white flex items-center justify-center font-black text-xs border-2 border-red-200 text-red-600">
                          !
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-black bg-red-200 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-widest">
                              {new Date(task.dueAt).toLocaleDateString('pt-BR')}
                            </span>
                            <h3 className="font-black text-dark-accent">{task.title}</h3>
                          </div>
                          <p className="text-xs text-gray-500 font-bold">{task.leadName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/admin/automation')}
                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-red-500/20"
                      >
                        Resolver
                      </button>
                    </div>
                  ))}
                  {mits.filter(t => new Date(t.dueAt) < new Date()).length === 0 && (
                    <p className="text-gray-500 text-center py-8">Nenhuma tarefa atrasada! 🎉</p>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </AdminLayout>
  );
};

export default Priorities;
