
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Lead, DeadlineWindow, PaymentMethod, UrgencyLevel, QualificationLabel, BadLeadReason, LeadSource, AutomationStage } from '../../types';
import { supabase } from '../../lib/supabase';

const SOURCES: LeadSource[] = ['Instagram (Feed)', 'Instagram (Stories)', 'Meta Ads', 'Google Ads', 'Indicação', 'OLX', 'Portais', 'Offline', 'Outro'];

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'docs' | 'history' | 'automation'>('info');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'buyers' | 'sellers'>('all');

  const [showQualifyModal, setShowQualifyModal] = useState(false);
  const [showBadLeadModal, setShowBadLeadModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [visitDateTime, setVisitDateTime] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [proposalData, setProposalData] = useState({
    offerValue: '',
    entryValue: '',
    paymentType: 'À vista',
    installments: '120',
    propertyId: ''
  });
  const [qualifyData, setQualifyData] = useState<Partial<Lead>>({});
  const [leadHistory, setLeadHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map Supabase data to Lead type
      const mappedLeads: Lead[] = (data || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        property: l.property || l.property_code || 'Geral',
        propertyId: l.property_id,
        propertyCode: l.property_code,
        status: l.status === 'Novo' ? 'Novo' : (l.status || 'Novo'),
        timestamp: new Date(l.created_at || l.timestamp).toLocaleDateString('pt-BR'),
        phone: l.phone,
        email: l.email,
        lastContactAt: l.last_contact_at || l.created_at,
        contactMadeAt: l.contact_made_at,
        score: l.score || 0,
        qualificationLabel: l.qualification_label as QualificationLabel,
        intent: l.intent,
        deadline: l.deadline,
        paymentMethod: l.payment_method,
        urgency: l.urgency,
        source: l.source || 'Outro',
        tags: l.interest_type ? [l.interest_type] : [],
        interest_type: l.interest_type,
        isBadLead: l.status === 'Perdido' || l.status === 'lost',
        cpf: l.cpf,
        birthDate: l.birth_date,
        rg: l.rg,
        address: l.address,
        city: l.city,
        state: l.state,
        zipCode: l.zip_code
      }));

      setLeads(mappedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [selectedLeadId, leads]);

  const calculateScore = (data: Partial<Lead>): number => {
    let score = 0;
    if (data.deadline === '0-7') score += 25;
    else if (data.deadline === '8-30') score += 15;
    else if (data.deadline === '31-90') score += 8;
    else if (data.deadline === '90+') score += 2;

    if (data.paymentMethod === 'CASH') score += 20;
    else if (data.paymentMethod === 'FINANCING') score += 12;

    if (data.budgetMin && data.budgetMax) score += 12;
    if (data.urgency === 'HIGH') score += 15;
    if (data.status === 'Negociação') score += 30;

    return Math.max(0, Math.min(100, score));
  };

  const handleQualify = async () => {
    if (!selectedLeadId) return;
    const score = calculateScore(qualifyData);
    const qualificationLabel = score >= 70 ? 'HOT' : score >= 40 ? 'WARM' : 'COLD';

    // Update local state
    setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, ...qualifyData, score, qualificationLabel, lastQualifiedAt: new Date().toISOString() } : l));

    // Update Supabase
    try {
      await supabase
        .from('leads')
        .update({
          score: score,
          qualification_label: qualificationLabel,
          intent: qualifyData.intent,
          urgency: qualifyData.urgency,
          payment_method: qualifyData.paymentMethod,
          // Add other fields as needed if they exist in DB
        })
        .eq('id', selectedLeadId);
    } catch (error) {
      console.error("Error updating lead qualification", error);
    }

    setShowQualifyModal(false);
  };

  const handleMarkContact = async (leadId: string) => {
    const now = new Date().toISOString();
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, contactMadeAt: now, status: 'Contato' } : l));

    try {
      await supabase
        .from('leads')
        .update({ status: 'contacted', last_contact_at: now }) // Assuming columns exist
        .eq('id', leadId);
    } catch (error) {
      console.error("Error updating lead status", error);
    }

    alert('Contato registrado com sucesso! (Evento enviado para o Analytics)');
  };

  const handleMarkBad = async (reason: BadLeadReason) => {
    if (!selectedLeadId) return;
    setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, isBadLead: true, badLeadReason: reason, status: 'Perdido' } : l));

    try {
      await supabase
        .from('leads')
        .update({ status: 'lost', bad_lead_reason: reason }) // Assuming columns exist
        .eq('id', selectedLeadId);
    } catch (error) {
      console.error("Error marking bad lead", error);
    }

    setShowBadLeadModal(false);
    setSelectedLeadId(null);
  };

  const handleDeleteLead = async () => {
    if (!selectedLeadId) return;
    if (!window.confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', selectedLeadId);

      if (error) throw error;

      setLeads(prev => prev.filter(l => l.id !== selectedLeadId));
      setSelectedLeadId(null);
      alert('Lead excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Erro ao excluir lead.');
    }
  };

  const handleScheduleVisit = async () => {
    if (!selectedLead || !visitDateTime) return;

    try {
      const date = visitDateTime.split('T')[0];
      const time = visitDateTime.split('T')[1];

      const { error } = await supabase
        .from('visits')
        .insert([{
          lead_id: selectedLead.id,
          property_id: selectedLead.propertyId || null,
          date: date,
          time: time,
          status: 'scheduled'
        }]);

      if (error) throw error;

      // Add to history
      await supabase.from('lead_interactions').insert([{
        lead_id: selectedLead.id,
        type: 'visit',
        message: `Visita agendada para ${new Date(visitDateTime).toLocaleString('pt-BR')}`,
        created_at: new Date().toISOString()
      }]);

      // Update lead status to 'Visita'
      await supabase
        .from('leads')
        .update({ status: 'Visita' })
        .eq('id', selectedLead.id);

      alert('Visita agendada com sucesso! ✅');
      setShowVisitModal(false);
      setVisitDateTime('');

      // Refresh leads to show new status
      fetchLeads();

      // Refresh history if on history tab
      if (activeTab === 'history') {
        fetchLeadHistory(selectedLead.id);
      }
    } catch (error) {
      console.error('Error scheduling visit:', error);
      alert('Erro ao agendar visita.');
    }
  };

  const handleCreateProposal = async () => {
    if (!selectedLead || !proposalData.offerValue || !proposalData.propertyId) {
      alert('Preencha o valor e selecione o imóvel.');
      return;
    }

    try {
      const selectedProperty = properties.find(p => p.id === proposalData.propertyId);
      if (!selectedProperty) return;

      const offerValue = parseFloat(proposalData.offerValue);
      const listPrice = selectedProperty.price || 0;
      const discountValue = listPrice - offerValue;
      const discountPercent = listPrice > 0 ? (discountValue / listPrice) * 100 : 0;

      const payload = {
        lead_id: selectedLead.id,
        lead_name: selectedLead.name,
        property_id: selectedProperty.id,
        property_code: selectedProperty.code,
        property_title: selectedProperty.title,
        status: 'Rascunho',
        offer_value: offerValue,
        list_price_snapshot: listPrice,
        discount_value: discountValue,
        discount_percent: parseFloat(discountPercent.toFixed(2)),
        entry_value: parseFloat(proposalData.entryValue) || 0,
        payment_type: proposalData.paymentType,
        installments: proposalData.paymentType === 'Financiamento' ? parseInt(proposalData.installments) : null,
        expiration_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default 7 days
      };

      const { error } = await supabase.from('proposals').insert([payload]);
      if (error) throw error;

      // Update lead status to 'Negociação'
      await supabase.from('leads').update({ status: 'Negociação' }).eq('id', selectedLead.id);

      // Log to History
      const installmentMsg = proposalData.paymentType === 'Financiamento'
        ? ` (${proposalData.installments}x de R$ ${((offerValue - (parseFloat(proposalData.entryValue) || 0)) / parseInt(proposalData.installments)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
        : '';

      await supabase.from('lead_interactions').insert([{
        lead_id: selectedLead.id,
        type: 'proposal_created',
        message: `Proposta criada para imóvel ${selectedProperty.code}: R$ ${offerValue.toLocaleString('pt-BR')}${installmentMsg}`,
        created_at: new Date().toISOString()
      }]);

      alert('Proposta criada com sucesso! 📄');
      setShowProposalModal(false);
      setProposalData({ offerValue: '', entryValue: '', paymentType: 'À vista', installments: '120', propertyId: '' });
      fetchLeads();
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Erro ao criar proposta.');
    }
  };

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('*');
    if (data) setProperties(data);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchLeadHistory = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeadHistory(data || []);
    } catch (error) {
      console.error('Error fetching lead history:', error);
      setLeadHistory([]);
    }
  };

  // Fetch history when opening lead and switching to history tab
  useEffect(() => {
    if (selectedLeadId && activeTab === 'history') {
      fetchLeadHistory(selectedLeadId);
    }
  }, [selectedLeadId, activeTab]);

  return (
    <AdminLayout activeTab="leads">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 pt-8 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black tracking-tight text-dark-accent">CRM de Fechamento</h1>
          <button className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-black transition-active">Novo Lead</button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm" placeholder="Nome, telefone ou imóvel..." type="text" />
          </div>
          <button className="px-4 py-3 bg-gray-50 rounded-xl text-gray-400"><span className="material-symbols-outlined">filter_list</span></button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mt-4">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'all' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setCategoryFilter('buyers')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'buyers' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}
          >
            Compradores
          </button>
          <button
            onClick={() => setCategoryFilter('sellers')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'sellers' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}
          >
            Vendedores
          </button>
        </div>
      </header>

      <main className="px-6 py-6 pb-32 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Carregando leads...</div>
        ) : leads.filter(l => {
          if (l.isBadLead) return false;
          if (categoryFilter === 'buyers') return l.interest_type !== 'evaluation';
          if (categoryFilter === 'sellers') return l.interest_type === 'evaluation';
          return true;
        }).length === 0 ? (
          <div className="text-center py-10 text-gray-500">Nenhum lead encontrado nesta categoria.</div>
        ) : (
          leads.filter(l => {
            if (l.isBadLead) return false;
            if (categoryFilter === 'buyers') return l.interest_type !== 'evaluation';
            if (categoryFilter === 'sellers') return l.interest_type === 'evaluation';
            return true;
          }).map(lead => (
            <div
              key={lead.id}
              className={`bg-white rounded-[32px] border transition-all shadow-sm overflow-hidden ${selectedLeadId === lead.id ? 'border-primary ring-4 ring-primary/5' : 'border-gray-100'}`}
            >
              <div
                onClick={() => { setSelectedLeadId(selectedLeadId === lead.id ? null : lead.id); setQualifyData(lead); }}
                className="p-6 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-2xl flex flex-col items-center justify-center border-2 ${lead.qualificationLabel === 'HOT' ? 'bg-red-50 border-red-200 text-red-600' :
                    lead.qualificationLabel === 'WARM' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                      'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                    <span className="text-[10px] font-black uppercase leading-none mb-0.5">{lead.qualificationLabel || 'OFF'}</span>
                    <span className="text-lg font-black">{lead.score || 0}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-dark-accent">{lead.name}</h3>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${lead.interest_type === 'evaluation'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                        }`}>
                        {lead.interest_type === 'evaluation' ? 'Vendedor' : 'Comprador'}
                      </span>
                      <span className="bg-slate-100 text-gray-500 px-2 py-0.5 text-[9px] font-black uppercase rounded">{lead.status}</span>
                      {lead.utmSource && <span className="text-[8px] font-black uppercase text-primary border border-primary/20 px-1 rounded">{lead.utmSource}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {lead.tags?.map(t => <span key={t} className="text-[8px] font-bold text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded-full uppercase">#{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {lead.automationState?.activeSequenceId && (
                    <span className="material-symbols-outlined text-primary text-sm animate-pulse">bolt</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (lead.phone) window.open(`https://wa.me/55${lead.phone.replace(/\D/g, '')}`, '_blank');
                    }}
                    className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                  </button>
                  <span className={`material-symbols-outlined text-gray-300 transition-transform ${selectedLeadId === lead.id ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </div>

              {selectedLeadId === lead.id && (
                <div className="border-t border-gray-50 animate-fade-in">
                  <div className="bg-slate-50 p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Origem do Lead</p>
                        <select
                          className="text-xs font-black text-dark-accent bg-transparent border-none p-0 focus:ring-0"
                          value={lead.source || ''}
                          onChange={(e) => {
                            const newVal = e.target.value as LeadSource;
                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, source: newVal } : l));
                          }}
                        >
                          <option value="">Definir Origem...</option>
                          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="border-l border-gray-200 pl-6">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Automação</p>
                        <p className="text-[10px] font-black text-dark-accent uppercase">
                          {lead.automationState?.activeSequenceId ? `Sequência: ${lead.automationState.activeSequenceId}` : 'Nenhuma ativa'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!lead.contactMadeAt && (
                        <button
                          onClick={() => handleMarkContact(lead.id)}
                          className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Registrar Contato Feito
                        </button>
                      )}
                      <button
                        onClick={() => setShowQualifyModal(true)}
                        className="bg-white border border-gray-200 text-dark-accent px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:border-primary transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">fact_check</span>
                        Qualificar
                      </button>
                    </div>
                  </div>

                  <div className="flex border-b border-gray-50">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Ações</button>
                    <button onClick={() => setActiveTab('automation')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'automation' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Automação</button>
                    <button onClick={() => setActiveTab('docs')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'docs' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Checklist & Docs</button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Histórico</button>
                  </div>

                  <div className="p-6">
                    {activeTab === 'info' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Nome Completo</label>
                              <input
                                type="text"
                                value={lead.name}
                                onChange={async (e) => {
                                  const newValue = e.target.value;
                                  setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, name: newValue } : l));
                                  try {
                                    await supabase.from('leads').update({ name: newValue }).eq('id', lead.id);
                                  } catch (error) {
                                    console.error('Error updating name:', error);
                                  }
                                }}
                                className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-black text-dark-accent focus:ring-2 focus:ring-primary/20 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Telefone</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={lead.phone || ''}
                                  onChange={async (e) => {
                                    const newValue = e.target.value;
                                    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, phone: newValue } : l));
                                    try {
                                      await supabase.from('leads').update({ phone: newValue }).eq('id', lead.id);
                                    } catch (error) {
                                      console.error('Error updating phone:', error);
                                    }
                                  }}
                                  placeholder="Não informado"
                                  className="flex-1 bg-white border border-gray-100 rounded-xl p-3 text-sm font-bold text-dark-accent focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                {lead.phone && (
                                  <button
                                    onClick={() => window.open(`https://wa.me/55${lead.phone.replace(/\D/g, '')}`, '_blank')}
                                    className="size-10 rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-all flex-shrink-0"
                                  >
                                    <span className="material-symbols-outlined text-sm">chat</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Email</label>
                              <input
                                type="email"
                                value={lead.email || ''}
                                onChange={async (e) => {
                                  const newValue = e.target.value;
                                  setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, email: newValue } : l));
                                  try {
                                    await supabase.from('leads').update({ email: newValue }).eq('id', lead.id);
                                  } catch (error) {
                                    console.error('Error updating email:', error);
                                  }
                                }}
                                placeholder="Não informado"
                                className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary/20 outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Imóvel de Interesse</label>
                              <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="text-sm font-black text-dark-accent mb-1">{lead.property}</p>
                                {lead.propertyCode && (
                                  <p className="text-xs font-bold text-gray-500">Código: {lead.propertyCode}</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Status</label>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-black ${lead.status === 'Novo' ? 'bg-blue-100 text-blue-600' :
                                  lead.status === 'Contato' ? 'bg-yellow-100 text-yellow-600' :
                                    lead.status === 'Negociação' ? 'bg-green-100 text-green-600' :
                                      'bg-gray-100 text-gray-600'
                                  }`}>
                                  {lead.status}
                                </span>
                                {lead.qualificationLabel && (
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-black ${lead.qualificationLabel === 'HOT' ? 'bg-red-100 text-red-600' :
                                    lead.qualificationLabel === 'WARM' ? 'bg-orange-100 text-orange-600' :
                                      'bg-blue-100 text-blue-600'
                                    }`}>
                                    {lead.qualificationLabel}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Data de Cadastro</label>
                              <p className="text-md font-bold text-gray-600">{lead.timestamp}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Ações Rápidas</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                              onClick={() => {
                                setVisitDateTime(new Date().toISOString().substring(0, 16));
                                setShowVisitModal(true);
                              }}
                              className="bg-primary text-black h-12 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-active"
                            >
                              <span className="material-symbols-outlined text-sm">calendar_month</span>
                              Agendar Visita
                            </button>
                            <button
                              onClick={() => {
                                setProposalData(prev => ({ ...prev, leadId: lead.id, propertyId: lead.propertyId || '' }));
                                setShowProposalModal(true);
                              }}
                              className="bg-dark-accent text-white h-12 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-active"
                            >
                              <span className="material-symbols-outlined text-sm">contract_edit</span>
                              Criar Proposta
                            </button>
                            <button onClick={() => setShowBadLeadModal(true)} className="bg-red-50 text-red-500 h-12 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-active">
                              <span className="material-symbols-outlined text-sm">block</span>
                              Marcar Lead Ruim
                            </button>
                            <button onClick={handleDeleteLead} className="bg-gray-100 text-gray-500 h-12 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-active hover:bg-red-500 hover:text-white">
                              <span className="material-symbols-outlined text-sm">delete</span>
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'history' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Histórico de Interações</h4>
                          {leadHistory.length === 0 ? (
                            <div className="bg-gray-50 p-8 rounded-2xl text-center">
                              <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">history</span>
                              <p className="text-gray-500 text-sm font-medium">Nenhuma interação registrada ainda</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {leadHistory.map((interaction: any) => {
                                const date = new Date(interaction.created_at);
                                const iconMap: Record<string, string> = {
                                  message_sent: 'send',
                                  call: 'phone',
                                  visit: 'location_on',
                                  email: 'email',
                                  note: 'note'
                                };
                                const colorMap: Record<string, string> = {
                                  message_sent: 'green',
                                  call: 'blue',
                                  visit: 'purple',
                                  email: 'orange',
                                  note: 'gray'
                                };

                                return (
                                  <div key={interaction.id} className="bg-white border border-gray-200 p-4 rounded-2xl hover:shadow-md transition-all">
                                    <div className="flex items-start gap-4">
                                      <div className={`size-10 rounded-full bg-${colorMap[interaction.type] || 'gray'}-100 text-${colorMap[interaction.type] || 'gray'}-600 flex items-center justify-center flex-shrink-0`}>
                                        <span className="material-symbols-outlined text-sm">{iconMap[interaction.type] || 'info'}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-xs font-black uppercase tracking-widest text-gray-600">
                                            {interaction.type === 'message_sent' ? 'Mensagem Enviada' :
                                              interaction.type === 'call' ? 'Ligação' :
                                                interaction.type === 'visit' ? 'Visita' :
                                                  interaction.type === 'email' ? 'Email' : 'Nota'}
                                          </span>
                                          {interaction.channel && (
                                            <span className="text-xs font-bold text-gray-400">• {interaction.channel}</span>
                                          )}
                                        </div>
                                        {interaction.message && (
                                          <p className="text-sm text-gray-700 mb-2">{interaction.message}</p>
                                        )}
                                        <p className="text-xs text-gray-400 font-medium">
                                          {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'automation' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest">Sequência Atual</h4>
                          {lead.automationState?.activeSequenceId && (
                            <button className="text-[10px] font-black text-red-500 uppercase underline">Cancelar Sequência</button>
                          )}
                        </div>

                        {lead.automationState?.activeSequenceId ? (
                          <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-full bg-primary flex items-center justify-center text-black font-black text-sm">
                                {lead.automationState.touchIndex + 1}
                              </div>
                              <div>
                                <p className="font-black text-dark-accent text-sm">Passo {(lead.automationState.touchIndex || 0) + 1} de 3</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Próximo toque: Em 24 horas</p>
                              </div>
                            </div>
                            <button className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Enviar Agora</button>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-400 text-sm font-medium mb-4">Nenhuma sequência de follow-up ativa para este lead.</p>
                            <button className="bg-dark-accent text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-black transition-all">Aplicar Sequência Manual</button>
                          </div>
                        )}

                        <div className="pt-6 border-t border-gray-50">
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Atalhos de Mensagem</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                              { id: 'pos_contato', label: 'Pós-contato', msg: `Olá ${lead.name}, foi um prazer conversar com você! Conforme combinamos, seguem as informações do imóvel.` },
                              { id: 'pos_visita', label: 'Pós-visita', msg: `Oi ${lead.name}, o que achou da visita de hoje? Ficou com alguma dúvida sobre o imóvel ou documentação?` },
                              { id: 'reengajar', label: 'Reengajar', msg: `Olá ${lead.name}, faz um tempo que não nos falamos. Surgiram novas oportunidades que se encaixam no seu perfil!` },
                              { id: 'doc_check', label: 'Doc Check', msg: `Oi ${lead.name}, estou passando para lembrar da lista de documentos que conversamos. Já conseguiu separar algum?` }
                            ].map(m => (
                              <button
                                key={m.id}
                                onClick={async (e) => {
                                  const btn = e.currentTarget;
                                  const originalText = btn.innerText;
                                  try {
                                    btn.innerText = 'Enviando...';
                                    btn.disabled = true;

                                    const { sendAutomationShortcutToWebhook } = await import('../../lib/supabase');
                                    await sendAutomationShortcutToWebhook(lead, m.label, m.msg);

                                    // Save to history
                                    await supabase.from('lead_interactions').insert([{
                                      lead_id: lead.id,
                                      type: 'message_sent',
                                      channel: 'whatsapp_auto',
                                      message: m.msg,
                                      created_at: new Date().toISOString()
                                    }]);

                                    btn.innerText = 'Enviado! ✅';
                                    setTimeout(() => {
                                      btn.innerText = originalText;
                                      btn.disabled = false;
                                    }, 2000);
                                  } catch (err) {
                                    btn.innerText = 'Erro ❌';
                                    setTimeout(() => {
                                      btn.innerText = originalText;
                                      btn.disabled = false;
                                    }, 2000);
                                    alert('Erro ao enviar automação.');
                                  }
                                }}
                                className="h-10 bg-slate-50 rounded-xl text-[10px] font-black text-dark-accent border border-gray-100 hover:border-primary transition-all disabled:opacity-50"
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'docs' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Documentos Pessoais</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">CPF</label>
                              <input
                                type="text"
                                value={lead.cpf || ''}
                                onChange={async (e) => {
                                  const newValue = e.target.value;
                                  setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, cpf: newValue } : l));
                                  try {
                                    await supabase.from('leads').update({ cpf: newValue }).eq('id', lead.id);
                                  } catch (error) {
                                    console.error('Error updating CPF:', error);
                                  }
                                }}
                                placeholder="000.000.000-00"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">RG</label>
                              <input
                                type="text"
                                value={lead.rg || ''}
                                onChange={async (e) => {
                                  const newValue = e.target.value;
                                  setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, rg: newValue } : l));
                                  try {
                                    await supabase.from('leads').update({ rg: newValue }).eq('id', lead.id);
                                  } catch (error) {
                                    console.error('Error updating RG:', error);
                                  }
                                }}
                                placeholder="00.000.000-0"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Data de Nascimento</label>
                              <input
                                type="date"
                                value={lead.birthDate || ''}
                                onChange={async (e) => {
                                  const newValue = e.target.value;
                                  setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, birthDate: newValue } : l));
                                  try {
                                    await supabase.from('leads').update({ birth_date: newValue }).eq('id', lead.id);
                                  } catch (error) {
                                    console.error('Error updating birth date:', error);
                                  }
                                }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Endereço</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Rua / Logradouro</label>
                              <input
                                type="text"
                                value={lead.address || ''}
                                onChange={async (e) => {
                                  const newValue = e.target.value;
                                  setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, address: newValue } : l));
                                  try {
                                    await supabase.from('leads').update({ address: newValue }).eq('id', lead.id);
                                  } catch (error) {
                                    console.error('Error updating address:', error);
                                  }
                                }}
                                placeholder="Av. Coronel Teixeira, 1234"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Cidade</label>
                                <input
                                  type="text"
                                  value={lead.city || ''}
                                  onChange={async (e) => {
                                    const newValue = e.target.value;
                                    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, city: newValue } : l));
                                    try {
                                      await supabase.from('leads').update({ city: newValue }).eq('id', lead.id);
                                    } catch (error) {
                                      console.error('Error updating city:', error);
                                    }
                                  }}
                                  placeholder="Manaus"
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Estado</label>
                                <select
                                  value={lead.state || ''}
                                  onChange={async (e) => {
                                    const newValue = e.target.value;
                                    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, state: newValue } : l));
                                    try {
                                      await supabase.from('leads').update({ state: newValue }).eq('id', lead.id);
                                    } catch (error) {
                                      console.error('Error updating state:', error);
                                    }
                                  }}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                >
                                  <option value="">Selecione...</option>
                                  <option value="AM">AM</option>
                                  <option value="SP">SP</option>
                                  <option value="RJ">RJ</option>
                                  <option value="MG">MG</option>
                                  <option value="BA">BA</option>
                                  <option value="PR">PR</option>
                                  <option value="RS">RS</option>
                                  <option value="SC">SC</option>
                                  <option value="GO">GO</option>
                                  <option value="DF">DF</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">CEP</label>
                                <input
                                  type="text"
                                  value={lead.zipCode || ''}
                                  onChange={async (e) => {
                                    const newValue = e.target.value;
                                    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, zipCode: newValue } : l));
                                    try {
                                      await supabase.from('leads').update({ zip_code: newValue }).eq('id', lead.id);
                                    } catch (error) {
                                      console.error('Error updating zip code:', error);
                                    }
                                  }}
                                  placeholder="69000-000"
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                          <p className="text-xs text-blue-600 font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">info</span>
                            Os dados são salvos automaticamente conforme você digita
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {/* Modal Qualificação */}
      {showQualifyModal && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQualifyModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up flex flex-col max-h-[90vh]">
            <header className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-dark-accent">Qualificação de Perfil</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedLead.name}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center min-w-[80px]">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Score Previsto</p>
                <p className="text-2xl font-black text-primary">{calculateScore(qualifyData)}</p>
              </div>
            </header>
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Intenção</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold"
                    value={qualifyData.intent || ''}
                    onChange={e => setQualifyData({ ...qualifyData, intent: e.target.value as any })}
                  >
                    <option value="">Selecione...</option>
                    <option value="BUY">Compra</option>
                    <option value="RENT">Aluguel</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Urgência</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold"
                    value={qualifyData.urgency || ''}
                    onChange={e => setQualifyData({ ...qualifyData, urgency: e.target.value as UrgencyLevel })}
                  >
                    <option value="">Selecione...</option>
                    <option value="HIGH">Alta (Imediata)</option>
                    <option value="MEDIUM">Média (30 dias)</option>
                    <option value="LOW">Baixa (Só olhando)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Faixa Máxima (R$)</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold"
                    placeholder="Valor máximo"
                    value={qualifyData.budgetMax || ''}
                    onChange={e => setQualifyData({ ...qualifyData, budgetMax: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Forma de Pagamento</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold"
                    value={qualifyData.paymentMethod || ''}
                    onChange={e => setQualifyData({ ...qualifyData, paymentMethod: e.target.value as PaymentMethod })}
                  >
                    <option value="">Selecione...</option>
                    <option value="CASH">À Vista</option>
                    <option value="FINANCING">Financiamento</option>
                    <option value="CONSORTIUM">Consórcio</option>
                    <option value="EXCHANGE">Permuta</option>
                    <option value="UNKNOWN">Ainda não sabe</option>
                  </select>
                </div>
              </div>
            </div>
            <footer className="p-8 bg-gray-50 border-t border-gray-100">
              <button onClick={handleQualify} className="w-full bg-dark-accent text-white h-16 rounded-2xl font-black transition-active shadow-xl shadow-black/10">Salvar Qualificação</button>
            </footer>
          </div>
        </div>
      )}

      {/* Modal Agendar Visita */}
      {showVisitModal && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVisitModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">calendar_add_on</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-dark-accent">Agendar Visita</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{selectedLead.name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Data e Horário</label>
                <input
                  type="datetime-local"
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                  value={visitDateTime}
                  onChange={(e) => setVisitDateTime(e.target.value)}
                />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={handleScheduleVisit}
                  disabled={!visitDateTime}
                  className="w-full bg-primary text-black h-14 rounded-2xl font-black shadow-xl shadow-primary/20 transition-active flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Confirmar Agendamento
                  <span className="material-symbols-outlined font-bold">check</span>
                </button>
                <button onClick={() => setShowVisitModal(false)} className="w-full py-3 font-black text-gray-400 hover:text-dark-accent transition-colors text-xs uppercase tracking-widest">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Proposta */}
      {showProposalModal && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProposalModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-12 rounded-2xl bg-dark-accent/10 text-dark-accent flex items-center justify-center">
                <span className="material-symbols-outlined">add_card</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-dark-accent">Criar Proposta</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{selectedLead.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Imóvel</label>
                <select
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                  value={proposalData.propertyId}
                  onChange={(e) => setProposalData({ ...proposalData, propertyId: e.target.value })}
                >
                  <option value="">Selecione o imóvel...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Valor Oferta</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                    placeholder="R$ 0,00"
                    value={proposalData.offerValue}
                    onChange={(e) => setProposalData({ ...proposalData, offerValue: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Entrada</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                    placeholder="R$ 0,00"
                    value={proposalData.entryValue}
                    onChange={(e) => setProposalData({ ...proposalData, entryValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Pagamento</label>
                <select
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                  value={proposalData.paymentType}
                  onChange={(e) => setProposalData({ ...proposalData, paymentType: e.target.value })}
                >
                  <option>À vista</option>
                  <option>Financiamento</option>
                  <option>Consórcio</option>
                  <option>Permuta</option>
                </select>
              </div>

              {proposalData.paymentType === 'Financiamento' && (
                <div className="animate-fade-in space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nº de Parcelas</label>
                      <input
                        type="number"
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                        value={proposalData.installments}
                        onChange={(e) => setProposalData({ ...proposalData, installments: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Valor da Parcela (Est.)</label>
                      <div className="w-full bg-primary/10 border-none rounded-2xl p-4 font-black text-primary text-sm flex items-center">
                        R$ {((parseFloat(proposalData.offerValue || '0') - (parseFloat(proposalData.entryValue) || 0)) / (parseInt(proposalData.installments) || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold italic">* Cálculo simples (Saldo / Meses). Sujeito a taxas bancárias.</p>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={handleCreateProposal}
                  disabled={!proposalData.offerValue || !proposalData.propertyId}
                  className="w-full bg-dark-accent text-white h-14 rounded-2xl font-black shadow-xl shadow-black/10 transition-active flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Confirmar Proposta
                  <span className="material-symbols-outlined font-bold">check</span>
                </button>
                <button onClick={() => setShowProposalModal(false)} className="w-full py-3 font-black text-gray-400 hover:text-dark-accent transition-colors text-xs uppercase tracking-widest">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lead Ruim */}
      {showBadLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBadLeadModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up p-8">
            <h3 className="text-xl font-black text-dark-accent mb-2">Descartar Lead</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">Por que você está marcando este lead como ruim?</p>

            <div className="space-y-2">
              {[
                { label: 'Curioso / Sem intenção', val: 'CURIOUS' },
                { label: 'Sem orçamento', val: 'NO_BUDGET' },
                { label: 'Não responde / Sumiu', val: 'NO_RESPONSE' },
                { label: 'Spam / Golpe', val: 'SPAM' },
                { label: 'Fora da região', val: 'OUTSIDE_AREA' },
                { label: 'Já fechou com outro', val: 'ALREADY_CLOSED' },
              ].map(reason => (
                <button
                  key={reason.val}
                  onClick={() => handleMarkBad(reason.val as BadLeadReason)}
                  className="w-full text-left p-4 bg-slate-50 rounded-2xl font-black text-xs text-dark-accent hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                >
                  {reason.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowBadLeadModal(false)} className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-dark-accent transition-colors">Cancelar</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Leads;
