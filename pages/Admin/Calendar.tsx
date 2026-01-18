
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Visit, VisitStatus, InterestLevel, Lead } from '../../types';
import { supabase } from '../../lib/supabase';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'routes'>('calendar');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);

  // Calendar View State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form State
  const [formVisit, setFormVisit] = useState<Partial<Visit>>({
    leadId: '',
    propertyId: '',
    startAt: '',
    durationMinutes: 45,
    reminderSettings: { whatsapp: true, email: false }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Visits
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select(`
          *,
          leads (name, phone)
        `)
        .order('date', { ascending: true });

      if (visitsError) throw visitsError;

      const mappedVisits: Visit[] = (visitsData || []).map((v: any) => ({
        id: v.id,
        leadId: v.lead_id,
        leadName: v.leads?.name || 'Desconhecido',
        propertyId: v.property_id || '',
        propertyTitle: 'Imóvel ' + (v.property_id || 'N/A'), // Ideally fetch property details
        propertyCode: 'MA-' + (v.property_id || '000'),
        address: 'Endereço não informado', // Needs to be fetched or stored
        startAt: v.date && v.time ? `${v.date}T${v.time}` : new Date().toISOString(),
        durationMinutes: 60, // Default
        status: v.status === 'scheduled' ? 'Agendada' : v.status === 'completed' ? 'Realizada' : 'Cancelada',
        reminderSettings: { whatsapp: true, email: false }
      }));

      setVisits(mappedVisits);

      // Fetch Leads for the dropdown
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*');

      if (leadsError) throw leadsError;

      const mappedLeads: Lead[] = (leadsData || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        property: '',
        status: l.status,
        timestamp: '',
        phone: l.phone,
        lastContactAt: l.created_at
      }));

      setLeads(mappedLeads);

    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVisit = (visit: Visit) => {
    setEditingVisitId(visit.id);
    setFormVisit({
      leadId: visit.leadId,
      propertyId: visit.propertyId,
      startAt: visit.startAt,
      durationMinutes: visit.durationMinutes,
      reminderSettings: visit.reminderSettings
    });
    setShowModal(true);
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', visitId);

      if (error) throw error;

      setVisits(prev => prev.filter(v => v.id !== visitId));
      alert('Agendamento excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting visit:', error);
      alert('Erro ao excluir agendamento.');
    }
  };

  const handleSaveVisit = async () => {
    const lead = leads.find(l => l.id === formVisit.leadId);
    if (!lead) return;

    try {
      const date = formVisit.startAt ? formVisit.startAt.split('T')[0] : new Date().toISOString().split('T')[0];
      const time = formVisit.startAt ? formVisit.startAt.split('T')[1].substring(0, 5) : '10:00';

      if (editingVisitId) {
        // Update existing visit
        const { error } = await supabase
          .from('visits')
          .update({
            lead_id: lead.id,
            property_id: '1', // Default or selected
            date: date,
            time: time,
          })
          .eq('id', editingVisitId);

        if (error) throw error;

        // Update local state
        setVisits(prev => prev.map(v => v.id === editingVisitId ? {
          ...v,
          leadId: lead.id,
          leadName: lead.name,
          startAt: formVisit.startAt || new Date().toISOString(),
          // Keep other fields as is or update if needed
        } : v));

        alert("Visita atualizada com sucesso!");

      } else {
        // Insert new visit
        const { data, error } = await supabase
          .from('visits')
          .insert([{
            lead_id: lead.id,
            property_id: '1', // Default or selected
            date: date,
            time: time,
            status: 'scheduled'
          }])
          .select()
          .single();

        if (error) throw error;

        // Refresh local state
        const newVisit: Visit = {
          id: data.id,
          leadId: lead.id,
          leadName: lead.name,
          propertyId: '1',
          propertyTitle: 'Imóvel Selecionado',
          propertyCode: 'MA-NEW',
          address: 'Endereço a definir',
          startAt: formVisit.startAt || new Date().toISOString(),
          durationMinutes: formVisit.durationMinutes || 45,
          status: 'Agendada',
          reminderSettings: formVisit.reminderSettings || { whatsapp: true, email: false }
        };

        setVisits([newVisit, ...visits]);

        // Auto WhatsApp Confirm Link via Webhook
        const msg = `Oi, ${lead.name}! Confirmando nossa visita ao imóvel em ${new Date(newVisit.startAt).toLocaleDateString()} às ${new Date(newVisit.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Qualquer imprevisto me avise por aqui 🙂`;
        try {
          const { sendAutomationShortcutToWebhook } = await import('../../lib/supabase');
          await sendAutomationShortcutToWebhook(lead, 'Confirmação de Visita', msg);

          // Save to history
          await supabase.from('lead_interactions').insert([{
            lead_id: lead.id,
            type: 'message_sent',
            channel: 'whatsapp_auto',
            message: msg,
            created_at: new Date().toISOString()
          }]);
        } catch (err) {
          console.error('Error sending visit confirmation via webhook:', err);
        }
      }

      setShowModal(false);
      setEditingVisitId(null);
      setFormVisit({ leadId: '', startAt: new Date().toISOString(), durationMinutes: 45, reminderSettings: { whatsapp: true, email: false } });

    } catch (error) {
      console.error("Error saving visit:", error);
      alert("Erro ao salvar visita.");
    }
  };

  const handleCheckin = async (status: VisitStatus, interest?: InterestLevel) => {
    if (!selectedVisit) return;

    // Update local
    const updated = visits.map(v => v.id === selectedVisit.id ? { ...v, status, interestLevel: interest, checkinAt: new Date().toISOString() } : v);
    setVisits(updated);

    // Update DB
    try {
      await supabase
        .from('visits')
        .update({ status: status === 'Confirmada' ? 'completed' : 'cancelled' }) // Map status
        .eq('id', selectedVisit.id);
    } catch (error) {
      console.error("Error updating visit:", error);
    }

    setShowCheckin(false);
    setSelectedVisit(null);
  };

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/50 border border-gray-100/50"></div>);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayVisits = visits.filter(v => v.startAt.startsWith(dateStr));
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div key={day} className={`h-32 border border-gray-100 p-2 relative group hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}>
          <span className={`text-xs font-bold ${isToday ? 'bg-primary text-black size-6 rounded-full flex items-center justify-center' : 'text-gray-400'}`}>{day}</span>

          <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px]">
            {dayVisits.map(visit => (
              <button
                key={visit.id}
                onClick={() => handleEditVisit(visit)}
                className={`w-full text-left px-2 py-1 rounded text-[9px] font-black truncate border-l-2 ${visit.status === 'Realizada' ? 'bg-green-50 border-green-500 text-green-700' :
                  visit.status === 'Cancelada' ? 'bg-red-50 border-red-500 text-red-700' :
                    'bg-blue-50 border-blue-500 text-blue-700'
                  }`}
              >
                {new Date(visit.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {visit.leadName}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  // --- Routes Logic ---
  const getTodayVisits = () => {
    return visits
      .filter(v => new Date(v.startAt).toDateString() === new Date().toDateString())
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  };

  return (
    <AdminLayout activeTab="calendar">
      <header className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-dark-accent">Agenda de Guerra</h1>
            <p className="text-gray-500 text-sm">Controle de visitas e rotas para fechamento.</p>
          </div>
          <button
            onClick={() => {
              setEditingVisitId(null);
              setFormVisit({ leadId: '', startAt: new Date().toISOString(), durationMinutes: 45, reminderSettings: { whatsapp: true, email: false } });
              setShowModal(true);
            }}
            className="bg-primary text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-primary/20 transition-active"
          >
            <span className="material-symbols-outlined">calendar_add_on</span>
            + Agendar Visita
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full md:w-max">
          <button onClick={() => setActiveTab('calendar')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Calendário</button>
          <button onClick={() => setActiveTab('list')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Próximas</button>
          <button onClick={() => setActiveTab('routes')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'routes' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Rotas</button>
        </div>
      </header>

      <main className="px-6 py-8 pb-32">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Carregando agenda...</div>
        ) : (
          <>
            {activeTab === 'calendar' && (
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6 flex items-center justify-between border-b border-gray-100">
                  <h2 className="text-lg font-black text-dark-accent capitalize">
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="size-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                    <button onClick={handleNextMonth} className="size-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="py-2 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {renderCalendarGrid()}
                </div>
              </div>
            )}

            {activeTab === 'list' && (
              <div className="space-y-4">
                {visits.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">Nenhuma visita agendada.</div>
                ) : visits.map(visit => (
                  <div key={visit.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="size-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-dark-accent">
                          <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{new Date(visit.startAt).toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                          <span className="text-xl font-black">{new Date(visit.startAt).getDate()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-black text-dark-accent">{visit.leadName}</h3>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${visit.status === 'Agendada' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                              {visit.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-bold">{visit.propertyCode} • {visit.propertyTitle}</p>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-bold">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {visit.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedVisit(visit); setShowCheckin(true); }}
                          className="bg-dark-accent text-white px-6 py-3 rounded-xl text-xs font-black transition-active"
                        >
                          Check-in
                        </button>
                        <button
                          onClick={() => handleEditVisit(visit)}
                          className="size-11 flex items-center justify-center bg-slate-50 text-gray-400 rounded-xl hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVisit(visit.id)}
                          className="size-11 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'routes' && (
              <div className="space-y-6">
                <div className="bg-dark-accent p-10 rounded-[40px] text-white overflow-hidden relative">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-4">Roteiro de Hoje</h3>
                    <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
                      {getTodayVisits().length} visitas programadas para hoje. Siga a ordem otimizada para economizar tempo.
                    </p>
                  </div>
                  <span className="material-symbols-outlined absolute -right-10 -bottom-10 text-[200px] text-white/5 rotate-12">route</span>
                </div>

                <div className="relative border-l-2 border-dashed border-gray-200 ml-6 space-y-8 py-4">
                  {getTodayVisits().length === 0 && (
                    <div className="pl-8 text-gray-400 text-sm font-bold">Nenhuma visita para hoje.</div>
                  )}

                  {getTodayVisits().map((visit, index) => (
                    <div key={visit.id} className="relative pl-8">
                      <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-primary border-4 border-white shadow-sm"></div>

                      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span className="bg-slate-100 text-dark-accent px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                              {new Date(visit.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <h4 className="font-black text-dark-accent text-lg">{visit.leadName}</h4>
                            <p className="text-xs text-gray-500 font-bold">{visit.address}</p>
                          </div>
                          <button
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(visit.address)}`, '_blank')}
                            className="bg-blue-50 text-blue-600 size-10 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors"
                          >
                            <span className="material-symbols-outlined">near_me</span>
                          </button>
                        </div>

                        {index < getTodayVisits().length - 1 && (
                          <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 text-xs font-bold text-gray-500">
                            <span className="material-symbols-outlined text-sm">arrow_downward</span>
                            Próxima parada em {
                              Math.round((new Date(getTodayVisits()[index + 1].startAt).getTime() - new Date(visit.startAt).getTime()) / 60000)
                            } min
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Simplified Modal for Checkin */}
      {showCheckin && selectedVisit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckin(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up p-8">
            <h3 className="text-xl font-black text-dark-accent mb-2">Check-in de Visita</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">Como foi o interesse do cliente {selectedVisit.leadName}?</p>

            <div className="space-y-3">
              <button
                onClick={() => handleCheckin('Confirmada', 'Quente')}
                className="w-full bg-red-50 text-red-600 h-16 rounded-2xl font-black text-sm flex items-center justify-center gap-3 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">local_fire_department</span>
                Interesse Quente
              </button>
              <button
                onClick={() => handleCheckin('Confirmada', 'Morno')}
                className="w-full bg-amber-50 text-amber-600 h-16 rounded-2xl font-black text-sm flex items-center justify-center gap-3 border border-amber-100 hover:bg-amber-500 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">waves</span>
                Interesse Morno
              </button>
              <button
                onClick={() => handleCheckin('Furou')}
                className="w-full bg-gray-50 text-gray-400 h-16 rounded-2xl font-black text-sm flex items-center justify-center gap-3 border border-gray-100 hover:bg-gray-200 hover:text-dark-accent transition-all"
              >
                <span className="material-symbols-outlined">person_off</span>
                Não Compareceu
              </button>
            </div>

            <button onClick={() => setShowCheckin(false)} className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-dark-accent transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal for New/Edit Visit */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up p-8">
            <h3 className="text-2xl font-black text-dark-accent mb-8">
              {editingVisitId ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Selecionar Lead</label>
                <select
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                  value={formVisit.leadId}
                  onChange={(e) => setFormVisit({ ...formVisit, leadId: e.target.value })}
                >
                  <option value="">Escolha o cliente...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Data & Hora</label>
                <input
                  type="datetime-local"
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                  value={formVisit.startAt?.substring(0, 16)}
                  onChange={(e) => setFormVisit({ ...formVisit, startAt: new Date(e.target.value).toISOString() })}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 font-black text-gray-400 hover:text-dark-accent transition-colors">Cancelar</button>
                <button
                  onClick={handleSaveVisit}
                  disabled={!formVisit.leadId}
                  className="flex-[2] bg-primary text-black h-16 rounded-2xl font-black shadow-xl shadow-primary/20 transition-active flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {editingVisitId ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                  <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Calendar;
