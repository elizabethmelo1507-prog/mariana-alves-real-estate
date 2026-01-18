import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { supabase, sendVisitReminderToWebhook } from '../../lib/supabase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const checkUpcomingVisits = async (manual = false) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      if (manual) alert('Iniciando verificação de visitas para: ' + tomorrowStr);
      console.log('Checking visits for:', tomorrowStr);

      const { data: visits, error } = await supabase
        .from('visits')
        .select(`
          *,
          leads (name, phone)
        `)
        .eq('date', tomorrowStr)
        .eq('reminder_sent', false);

      if (error) {
        console.error('Supabase error fetching visits:', error);
        if (manual) alert('Erro ao buscar visitas: ' + error.message);
        return;
      }

      console.log('Visits found:', visits?.length || 0);
      if (manual) alert('Visitas encontradas: ' + (visits?.length || 0));

      if (visits && visits.length > 0) {
        for (const visit of visits) {
          let propertyTitle = 'Imóvel não identificado';
          if (visit.property_id) {
            const { data: propData } = await supabase
              .from('properties')
              .select('title')
              .eq('id', visit.property_id)
              .maybeSingle();
            if (propData) propertyTitle = propData.title;
          }

          console.log('Sending reminder for visit:', visit.id);

          try {
            await sendVisitReminderToWebhook({
              visit_id: visit.id,
              lead_name: visit.leads?.name,
              lead_phone: visit.leads?.phone,
              property_title: propertyTitle,
              visit_date: visit.date,
              visit_time: visit.time,
              notes: visit.notes
            });

            const { error: updateError } = await supabase
              .from('visits')
              .update({ reminder_sent: true })
              .eq('id', visit.id);

            if (updateError) console.error('Error updating reminder_sent:', updateError);

            // Log to history
            await supabase.from('lead_interactions').insert([{
              lead_id: visit.lead_id,
              type: 'note',
              message: 'Lembrete de visita (24h) enviado manualmente via Webhook.',
              created_at: new Date().toISOString()
            }]);
          } catch (webhookError: any) {
            console.error('Webhook call failed:', webhookError);
            if (manual) alert('Falha ao enviar para o Webhook: ' + webhookError.message);
            // Don't update reminder_sent if it failed
            continue;
          }
        }
        if (manual) alert('Processamento concluído!');
      }
    } catch (err) {
      console.error('Error checking upcoming visits:', err);
      if (manual) alert('Erro crítico: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    // A verificação agora é automática via servidor (Supabase Cron)
    // Mantemos apenas o botão manual para testes se necessário
  }, []);

  const metrics = [
    { label: 'Total Leads', value: '42', trend: '12%', up: true },
    { label: 'WhatsApp', value: '158', trend: '8%', up: true },
    { label: 'Visitas', value: '12', trend: '4%', up: true },
  ];

  const quickAccess = [
    { label: 'Cadastrar Imóvel', icon: 'add_circle', path: '/admin/add', dark: true },
    { label: 'Qualificar Leads', icon: 'fact_check', path: '/admin/leads' },
    { label: 'Gerenciar Catálogo', icon: 'list_alt', path: '/admin/manage' },
    { label: 'Testar Webhook 24h', icon: 'notifications_active', onClick: () => checkUpcomingVisits(true) },
  ];

  const funnelData = [
    { name: 'Quentes', value: 8, color: '#ef4444' }, // red-500
    { name: 'Mornos', value: 18, color: '#f59e0b' }, // amber-500
    { name: 'Frios', value: 14, color: '#64748b' }, // slate-500
  ];

  const performanceData = [
    { name: 'Jan', leads: 24, visitas: 12 },
    { name: 'Fev', leads: 35, visitas: 18 },
    { name: 'Mar', leads: 42, visitas: 25 },
    { name: 'Abr', leads: 38, visitas: 20 },
    { name: 'Mai', leads: 55, visitas: 32 },
    { name: 'Jun', leads: 48, visitas: 28 },
  ];

  return (
    <AdminLayout activeTab="home">
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-cover bg-center border-2 border-primary" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDJIZwwSiX-4gH0pJ5abnEQF5PybRxHJxaOaliz31VzfdDxUhdIi7lWTHtvWJRvTBPt_YNEPAmlEZ7l9fhaoQwAZZaIQnqnNhtuluBM_Kiz52fhlCEQh-J9imy7oAchZwKI1ZMNK6ce9GmB4S65iZL87jR1fIsE5I0yLRmQw9TNRuAgBIbM8plFgSVJTeFcm7NZnARIPvB0q6Bm2602JVTe5M8olub-WrqhwR0lUEsKCkVrhG2fyhvJX8oeKCPphjYuJPpXi8qjTdc")' }}></div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Olá, Mariana</h1>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Broker Admin</p>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-32">
        <section className="px-6 py-4 overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 min-w-max">
            {metrics.map(m => (
              <div key={m.label} className="w-40 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-extrabold tracking-tight">{m.value}</span>
                  <div className={`flex items-center font-bold text-[10px] ${m.up ? 'text-primary' : 'text-red-500'}`}>
                    <span className="material-symbols-outlined text-sm">{m.up ? 'trending_up' : 'trending_down'}</span>
                    {m.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Intelligence Section with Charts */}
        <section className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart - Funnel Temperature */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-dark-accent">
              <span className="material-symbols-outlined text-primary">pie_chart</span>
              Temperatura do Funil
            </h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#1a1a1a' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="block text-3xl font-black text-dark-accent">40</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Leads</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {funnelData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-bold text-gray-500">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart - Monthly Performance */}
          <div className="bg-dark-accent p-8 rounded-[40px] text-white flex flex-col">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              Performance Mensal
            </h3>
            <div className="h-64 w-full" style={{ minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="leads" name="Leads" fill="#ffffff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="visitas" name="Visitas" fill="#00ff88" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-white"></div>
                <span className="text-xs font-bold text-gray-400">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary"></div>
                <span className="text-xs font-bold text-gray-400">Visitas</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-6">
          <h3 className="text-lg font-extrabold tracking-tight mb-4">Acesso Rápido Admin</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickAccess.map(item => (
              <button
                key={item.label}
                onClick={item.onClick ? item.onClick : () => navigate(item.path!)}
                className={`flex flex-col items-start gap-4 p-5 rounded-2xl transition-active shadow-sm border ${item.dark ? 'bg-dark-accent text-white border-transparent' : 'bg-white border-gray-100 text-dark-accent'}`}
              >
                <span className={`material-symbols-outlined ${item.dark ? 'text-primary' : 'text-dark-accent'}`}>{item.icon}</span>
                <span className="text-sm font-bold leading-tight text-left">{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};

export default Dashboard;
