
import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'funnel' | 'properties' | 'reports'>('overview');
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  // Mock data for analytics
  const kpis = {
    leads: 48,
    qualified: 12,
    visits: 8,
    proposals: 3,
    deals: 1,
    conversion: 2.1
  };

  const channelData = [
    { name: 'Instagram Ads', leads: 24, conversion: 4.2, color: 'bg-primary' },
    { name: 'Instagram Bio', leads: 12, conversion: 8.5, color: 'bg-amber-400' },
    { name: 'Indicação', leads: 5, conversion: 20.0, color: 'bg-blue-400' },
    { name: 'Google Ads', leads: 4, conversion: 2.1, color: 'bg-slate-400' },
    { name: 'Outros', leads: 3, conversion: 0.0, color: 'bg-gray-200' },
  ];

  const propertyRanking = [
    { code: 'MA-001', title: 'Mansão Riviera', views: 1250, whatsapp: 45, visits: 6, leads: 12 },
    { code: 'MA-002', title: 'Sky Garden Flat', views: 850, whatsapp: 22, visits: 3, leads: 8 },
    { code: 'MA-003', title: 'Residencial Aurora', views: 640, whatsapp: 18, visits: 2, leads: 5 },
  ];

  const reportInsights = [
    { type: 'positive', text: 'Sua conversão de Indicação está em 20%. Peça depoimentos para esses clientes para usar no tráfego pago.' },
    { type: 'warning', text: 'O imóvel MA-002 tem muitos cliques no WhatsApp mas poucas visitas. Tente enviar um vídeo tour antes de agendar.' },
    { type: 'action', text: 'O tráfego de Instagram Ads está trazendo muitos leads frios. Revise o público da campanha "Manaus Luxo".' },
  ];

  const generateReportText = () => {
    return `📊 Relatório Semanal Mariana Alves\n\n` +
           `Leads Totais: ${kpis.leads} (+15% vs semana anterior)\n` +
           `Visitas Realizadas: ${kpis.visits}\n` +
           `Propostas Enviadas: ${kpis.proposals}\n\n` +
           `🚀 Top Canal: Instagram Bio (${channelData[1].conversion}% conv.)\n` +
           `🏡 Top Imóvel: ${propertyRanking[0].title} (${propertyRanking[0].leads} leads)\n\n` +
           `💡 Insight: ${reportInsights[0].text}`;
  };

  return (
    <AdminLayout activeTab="analytics">
      <header className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-dark-accent">Marketing Analytics</h1>
            <p className="text-gray-500 text-sm">Monitorando de onde vêm seus melhores clientes.</p>
          </div>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="bg-gray-100 border-none rounded-xl py-2 px-4 text-xs font-black uppercase tracking-widest"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full md:w-max overflow-x-auto hide-scrollbar">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'channels', label: 'Canais' },
            { id: 'funnel', label: 'Funil' },
            { id: 'properties', label: 'Imóveis' },
            { id: 'reports', label: 'Relatórios' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 py-8 pb-32">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {[
                 { label: 'Leads', val: kpis.leads, icon: 'group' },
                 { label: 'Quentes', val: kpis.qualified, icon: 'local_fire_department' },
                 { label: 'Visitas', val: kpis.visits, icon: 'calendar_month' },
                 { label: 'Propostas', val: kpis.proposals, icon: 'contract_edit' },
                 { label: 'Vendas', val: kpis.deals, icon: 'verified' },
                 { label: 'Conv. Geral', val: kpis.conversion + '%', icon: 'trending_up' },
               ].map(kpi => (
                 <div key={kpi.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl mb-2">{kpi.icon}</span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{kpi.label}</p>
                    <p className="text-xl font-black text-dark-accent mt-1">{kpi.val}</p>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <h3 className="font-black text-lg mb-6">Top Canais de Aquisição</h3>
                  <div className="space-y-6">
                     {channelData.map(c => (
                       <div key={c.name} className="space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                             <span className="text-dark-accent">{c.name}</span>
                             <span className="text-gray-400">{c.leads} Leads ({c.conversion}%)</span>
                          </div>
                          <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                             <div className={`${c.color} h-full transition-all`} style={{ width: `${(c.leads / 48) * 100}%` }}></div>
                          </div>
                       </div>
                     ))}
                  </div>
               </section>

               <section className="bg-dark-accent p-8 rounded-[32px] text-white overflow-hidden relative">
                  <h3 className="font-black text-lg mb-6">Insights Automáticos</h3>
                  <div className="space-y-4">
                     {reportInsights.map((insight, idx) => (
                       <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className={`material-symbols-outlined ${insight.type === 'positive' ? 'text-primary' : insight.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>
                            {insight.type === 'positive' ? 'verified' : insight.type === 'warning' ? 'warning' : 'tips_and_updates'}
                          </span>
                          <p className="text-xs font-medium leading-relaxed">{insight.text}</p>
                       </div>
                     ))}
                  </div>
                  <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[120px] text-white/5 rotate-12">lightbulb</span>
               </section>
            </div>
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Canal</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Leads</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Visitas</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Vendas</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">ROI Estimado</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {channelData.map(c => (
                     <tr key={c.name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <div className={`size-3 rounded-full ${c.color}`}></div>
                              <span className="font-black text-dark-accent text-sm">{c.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center font-bold">{c.leads}</td>
                        <td className="px-6 py-5 text-center font-bold text-gray-400">{Math.floor(c.leads * 0.2)}</td>
                        <td className="px-6 py-5 text-center font-bold text-gray-400">{Math.floor(c.leads * 0.05)}</td>
                        <td className="px-6 py-5 text-right font-black text-primary">High</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'funnel' && (
          <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
             {[
               { stage: 'Leads Criados', count: 48, pct: 100 },
               { stage: 'Contato Realizado', count: 32, pct: 66 },
               { stage: 'Visita Agendada', count: 12, pct: 25 },
               { stage: 'Visita Realizada', count: 8, pct: 16 },
               { stage: 'Proposta Enviada', count: 3, pct: 6 },
               { stage: 'Fechamento', count: 1, pct: 2 },
             ].map((step, idx) => (
               <div key={step.stage} className="relative group">
                  <div className="flex items-center gap-6 p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm group-hover:border-primary transition-all">
                     <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-dark-accent">
                        {idx + 1}
                     </div>
                     <div className="flex-1">
                        <h4 className="font-black text-dark-accent">{step.stage}</h4>
                        <p className="text-xs text-gray-400 font-bold">{step.count} leads nesta etapa</p>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-dark-accent">{step.pct}%</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Taxa de Conversão</p>
                     </div>
                  </div>
                  {idx < 5 && (
                    <div className="flex justify-center -my-1">
                       <span className="material-symbols-outlined text-gray-100 text-3xl">expand_more</span>
                    </div>
                  )}
               </div>
             ))}
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Imóvel</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Page Views</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Click Wpp</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Visitas Real.</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Conv. Visita</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {propertyRanking.map(p => (
                     <tr key={p.code} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                           <span className="text-[9px] font-black text-primary uppercase tracking-widest block mb-0.5">{p.code}</span>
                           <span className="font-black text-dark-accent text-sm">{p.title}</span>
                        </td>
                        <td className="px-6 py-5 text-center font-bold">{p.views}</td>
                        <td className="px-6 py-5 text-center font-bold">{p.whatsapp}</td>
                        <td className="px-6 py-5 text-center font-bold">{p.visits}</td>
                        <td className="px-6 py-5 text-center">
                           <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black">
                              {((p.visits / p.whatsapp) * 100).toFixed(1)}%
                           </span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
             <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm text-center">
                <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8">
                   <span className="material-symbols-outlined text-4xl">description</span>
                </div>
                <h3 className="text-2xl font-black text-dark-accent mb-4">Relatório Semanal Ativo</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed">
                   Seu resumo de performance é gerado toda segunda-feira às 08:00 e enviado para sua Inbox.
                </p>
                
                <div className="bg-slate-50 p-6 rounded-2xl text-left border border-gray-100 mb-8 whitespace-pre-wrap font-mono text-xs text-gray-500 leading-relaxed">
                   {generateReportText()}
                </div>

                <div className="flex gap-4">
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(generateReportText());
                        alert('Relatório copiado para o WhatsApp!');
                     }}
                     className="flex-1 bg-primary text-black h-16 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-active"
                   >
                      <span className="material-symbols-outlined">send</span>
                      Copiar p/ WhatsApp
                   </button>
                   <button className="flex-1 bg-dark-accent text-white h-16 rounded-2xl font-black text-sm transition-active">Baixar PDF</button>
                </div>
             </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default Analytics;
