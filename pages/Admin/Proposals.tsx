import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Proposal, NegotiationEvent, ProposalStatus, Lead, Property } from '../../types';
import { supabase } from '../../lib/supabase';

const Proposals: React.FC = () => {
   const [activeTab, setActiveTab] = useState<'pipeline' | 'list' | 'calculator'>('pipeline');
   const [proposals, setProposals] = useState<Proposal[]>([]);
   const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
   const [events, setEvents] = useState<NegotiationEvent[]>([]);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [loading, setLoading] = useState(false);

   // Data for Create Modal
   const [leads, setLeads] = useState<Lead[]>([]);
   const [properties, setProperties] = useState<Property[]>([]);
   const [newProposalData, setNewProposalData] = useState({
      leadId: '',
      propertyId: '',
      offerValue: '',
      paymentType: 'À vista',
      entryValue: '',
      installments: '120',
      expirationDate: ''
   });

   // Quick Calculator State
   const [calcData, setCalcData] = useState({ listPrice: 1000000, offer: 950000, commission: 5 });

   // New Event State
   const [newEvent, setNewEvent] = useState({
      eventType: 'Mensagem',
      summary: '',
      actor: 'Corretor',
      channel: 'WhatsApp'
   });

   useEffect(() => {
      fetchProposals();
   }, []);

   useEffect(() => {
      if (showCreateModal) {
         fetchLeadsAndProperties();
      }
   }, [showCreateModal]);

   useEffect(() => {
      if (selectedProposal) {
         fetchEvents(selectedProposal.id);
      }
   }, [selectedProposal]);

   const fetchProposals = async () => {
      try {
         setLoading(true);
         const { data, error } = await supabase
            .from('proposals')
            .select('*, properties(owner_name, owner_phone), leads(phone)')
            .order('created_at', { ascending: false });

         if (error) throw error;

         const mappedProposals: Proposal[] = (data || []).map((p: any) => ({
            id: p.id,
            leadId: p.lead_id,
            leadName: p.lead_name,
            propertyId: p.property_id,
            propertyCode: p.property_code,
            propertyTitle: p.property_title,
            status: p.status,
            offerValue: Number(p.offer_value),
            listPriceSnapshot: Number(p.list_price_snapshot),
            discountValue: Number(p.discount_value),
            discountPercent: Number(p.discount_percent),
            entryValue: Number(p.entry_value),
            paymentType: p.payment_type,
            installments: p.installments ? Number(p.installments) : undefined,
            expirationAt: p.expiration_at,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            ownerName: p.properties?.owner_name,
            ownerPhone: p.properties?.owner_phone,
            leadPhone: p.leads?.phone
         }));

         setProposals(mappedProposals);
      } catch (error) {
         console.error('Error fetching proposals:', error);
      } finally {
         setLoading(false);
      }
   };

   const fetchLeadsAndProperties = async () => {
      try {
         const { data: leadsData } = await supabase.from('leads').select('*');
         const { data: propsData } = await supabase.from('properties').select('*');

         if (leadsData) setLeads(leadsData.map((l: any) => ({ ...l, id: l.id, name: l.name })));
         if (propsData) setProperties(propsData.map((p: any) => ({
            ...p,
            id: p.id,
            title: p.title,
            code: p.code,
            price: p.price,
            ownerName: p.owner_name,
            ownerPhone: p.owner_phone
         })));
      } catch (error) {
         console.error('Error fetching data for modal:', error);
      }
   };

   const fetchEvents = async (proposalId: string) => {
      try {
         const { data, error } = await supabase
            .from('negotiation_events')
            .select('*')
            .eq('proposal_id', proposalId)
            .order('created_at', { ascending: false });

         if (error) throw error;

         setEvents((data || []).map((e: any) => ({
            id: e.id,
            proposalId: e.proposal_id,
            actor: e.actor,
            channel: e.channel,
            eventType: e.event_type,
            summary: e.summary,
            createdAt: e.created_at
         })));
      } catch (error) {
         console.error('Error fetching events:', error);
      }
   };

   const handleCreateProposal = async () => {
      try {
         setLoading(true);
         const selectedLead = leads.find(l => l.id === newProposalData.leadId);
         const selectedProperty = properties.find(p => p.id === newProposalData.propertyId);

         if (!selectedLead || !selectedProperty) {
            alert('Selecione um lead e um imóvel.');
            return;
         }

         const offerValue = parseFloat(newProposalData.offerValue);
         const listPrice = selectedProperty.price;
         const discountValue = listPrice - offerValue;
         const discountPercent = (discountValue / listPrice) * 100;

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
            entry_value: parseFloat(newProposalData.entryValue) || 0,
            payment_type: newProposalData.paymentType,
            installments: newProposalData.paymentType === 'Financiamento' ? parseInt(newProposalData.installments) : null,
            expiration_at: newProposalData.expirationDate ? new Date(newProposalData.expirationDate).toISOString() : null
         };

         const { data: newProposal, error } = await supabase.from('proposals').insert([payload]).select().single();
         if (error) throw error;

         // Log to History
         await supabase.from('lead_interactions').insert([{
            lead_id: selectedLead.id,
            type: 'proposal_created',
            channel: 'system',
            message: `Proposta criada para imóvel ${selectedProperty.code}: ${formatCurrency(offerValue)}`,
            created_at: new Date().toISOString()
         }]);

         setShowCreateModal(false);
         fetchProposals();

         // Owner Notification Logic
         if (selectedProperty.ownerPhone) {
            const message = `Olá ${selectedProperty.ownerName || 'Proprietário'}, recebemos uma proposta para o seu imóvel ${selectedProperty.code} - ${selectedProperty.title}.\n\nValor Ofertado: ${formatCurrency(offerValue)}\nForma de Pagamento: ${newProposalData.paymentType}\nEntrada: ${formatCurrency(parseFloat(newProposalData.entryValue) || 0)}\n\nEntre em contato para analisarmos os detalhes!`;

            if (window.confirm(`Proposta criada! Deseja enviar uma mensagem para o proprietário?\n\n"${message}"`)) {
               const whatsappUrl = `https://wa.me/55${selectedProperty.ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
               window.open(whatsappUrl, '_blank');
            }
         } else {
            alert('Proposta criada com sucesso! (Telefone do proprietário não cadastrado)');
         }
      } catch (error) {
         console.error('Error creating proposal:', error);
         alert('Erro ao criar proposta.');
      } finally {
         setLoading(false);
      }
   };

   const handleAddEvent = async () => {
      if (!selectedProposal || !newEvent.summary) return;

      try {
         const payload = {
            proposal_id: selectedProposal.id,
            actor: newEvent.actor,
            channel: newEvent.channel,
            event_type: newEvent.eventType,
            summary: newEvent.summary
         };

         const { error } = await supabase.from('negotiation_events').insert([payload]);
         if (error) throw error;

         fetchEvents(selectedProposal.id);
         setNewEvent({ ...newEvent, summary: '' });
      } catch (error) {
         console.error('Error adding event:', error);
         alert('Erro ao adicionar evento.');
      }
   };

   const handleDeleteProposal = async (id: string) => {
      if (!window.confirm('Tem certeza que deseja excluir esta proposta?')) return;

      try {
         const { error } = await supabase.from('proposals').delete().eq('id', id);
         if (error) throw error;

         setProposals(prev => prev.filter(p => p.id !== id));
         if (selectedProposal?.id === id) setSelectedProposal(null);
         alert('Proposta excluída com sucesso.');
      } catch (error) {
         console.error('Error deleting proposal:', error);
         alert('Erro ao excluir proposta.');
      }
   };

   const handleUpdateStatus = async (status: string, proposalId?: string) => {
      const targetId = proposalId || selectedProposal?.id;
      if (!targetId) return;

      try {
         const { error } = await supabase
            .from('proposals')
            .update({ status })
            .eq('id', targetId);

         if (error) throw error;

         const proposal = proposals.find(p => p.id === targetId);
         if (proposal) {
            // Log to History
            await supabase.from('lead_interactions').insert([{
               lead_id: proposal.leadId,
               type: 'proposal_status_change',
               channel: 'system',
               message: `Status da proposta do imóvel ${proposal.propertyCode} alterado para: ${status}`,
               created_at: new Date().toISOString()
            }]);
         }

         setProposals(prev => prev.map(p => p.id === targetId ? { ...p, status: status as any } : p));
         if (selectedProposal?.id === targetId) {
            setSelectedProposal(prev => prev ? { ...prev, status: status as any } : null);
         }

         if (status === 'Aceita') {
            alert('Proposta aceita! Parabéns!');
         }
      } catch (error) {
         console.error('Error updating status:', error);
         alert('Erro ao atualizar status.');
      }
   };

   const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
   };

   const calcResult = useMemo(() => {
      const discount = calcData.listPrice - calcData.offer;
      const discountPct = (discount / calcData.listPrice) * 100;
      const commissionVal = calcData.offer * (calcData.commission / 100);
      return { discount, discountPct, commissionVal };
   }, [calcData]);

   const handleCopyWhatsApp = async (prop: Proposal) => {
      const msg = `Oi, ${prop.leadName}! Segue o resumo da proposta do imóvel ${prop.propertyCode} (${prop.propertyTitle}):
• Valor proposto: ${formatCurrency(prop.offerValue)}
• Entrada: ${formatCurrency(prop.entryValue)}
• Forma: ${prop.paymentType}
• Validade: até ${prop.expirationAt ? new Date(prop.expirationAt).toLocaleDateString() : 'Indefinido'}
Se quiser, posso ajustar e te enviar a versão final.`;

      try {
         const { sendAutomationShortcutToWebhook } = await import('../../lib/supabase');
         await sendAutomationShortcutToWebhook({ id: prop.leadId, name: prop.leadName, phone: prop.leadPhone }, 'Resumo de Proposta', msg);

         // Save to history
         await supabase.from('lead_interactions').insert([{
            lead_id: prop.leadId,
            type: 'message_sent',
            channel: 'whatsapp_auto',
            message: msg,
            created_at: new Date().toISOString()
         }]);

         alert('Resumo enviado automaticamente via Webhook! ✅');
      } catch (err) {
         console.error('Error sending proposal summary:', err);
         navigator.clipboard.writeText(msg);
         alert('Erro ao enviar automaticamente. Resumo copiado para o clipboard!');
      }
   };

   const getBuyerMessage = (prop: Proposal) => {
      return `Olá ${prop.leadName}, tudo bem?
Atualização sobre sua proposta para o imóvel *${prop.propertyCode} - ${prop.propertyTitle}*.

*Status Atual:* ${prop.status.toUpperCase()}
*Valor:* ${formatCurrency(prop.offerValue)}
*Pagamento:* ${prop.paymentType}

Qualquer dúvida, estou à disposição!`;
   };

   const getOwnerMessage = (prop: Proposal) => {
      return `Olá ${prop.ownerName || 'Proprietário'}, tudo bem?
Recebemos uma atualização na proposta do imóvel *${prop.propertyCode} - ${prop.propertyTitle}*.

*Proponente:* ${prop.leadName}
*Valor Ofertado:* ${formatCurrency(prop.offerValue)}
*Entrada:* ${formatCurrency(prop.entryValue)}
*Condição:* ${prop.paymentType}
*Status:* ${prop.status}

Podemos conversar sobre os próximos passos?`;
   };

   const sendWhatsApp = async (phone: string | undefined, message: string, name: string = 'Cliente', leadId?: string) => {
      if (!phone) {
         alert('Telefone não cadastrado.');
         return;
      }
      try {
         const { sendAutomationShortcutToWebhook } = await import('../../lib/supabase');
         await sendAutomationShortcutToWebhook({ id: leadId, name, phone }, 'Proposta', message);

         if (leadId) {
            await supabase.from('lead_interactions').insert([{
               lead_id: leadId,
               type: 'message_sent',
               channel: 'whatsapp_auto',
               message: message,
               created_at: new Date().toISOString()
            }]);
         }

         alert('Mensagem enviada automaticamente! ✅');
      } catch (err) {
         console.error('Error sending via webhook:', err);
         const url = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
         window.open(url, '_blank');
      }
   };

   // Drag and Drop Handlers
   const handleDragStart = (e: React.DragEvent, proposalId: string) => {
      e.dataTransfer.setData('proposalId', proposalId);
      e.dataTransfer.effectAllowed = 'move';
   };

   const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
   };

   const handleDrop = (e: React.DragEvent, newStatus: ProposalStatus) => {
      e.preventDefault();
      const proposalId = e.dataTransfer.getData('proposalId');
      if (proposalId) {
         handleUpdateStatus(newStatus, proposalId);
      }
   };

   const columns: ProposalStatus[] = ['Rascunho', 'Enviada', 'Em negociação', 'Aceita'];

   return (
      <AdminLayout activeTab="proposals">
         <header className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="flex items-center justify-between mb-6">
               <div>
                  <h1 className="text-2xl font-black tracking-tight text-dark-accent">Propostas & Negociação</h1>
                  <p className="text-gray-500 text-sm">Fechamento e gestão de valores e comissões.</p>
               </div>
               <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-primary/20 transition-active"
               >
                  <span className="material-symbols-outlined">add_card</span>
                  Nova Proposta
               </button>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full md:w-max">
               <button onClick={() => setActiveTab('pipeline')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'pipeline' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Pipeline</button>
               <button onClick={() => setActiveTab('list')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Lista Geral</button>
               <button onClick={() => setActiveTab('calculator')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'calculator' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Calculadora</button>
            </div>
         </header>

         <main className="px-6 py-8 pb-32">
            {activeTab === 'pipeline' && (
               <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar">
                  {columns.map(status => (
                     <div
                        key={status}
                        className="min-w-[300px] flex-1"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                     >
                        <div className="flex items-center justify-between mb-4 px-2">
                           <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">{status}</h3>
                           <span className="bg-gray-200 text-gray-500 size-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                              {proposals.filter(p => p.status === status).length}
                           </span>
                        </div>
                        <div className="space-y-4 min-h-[200px] bg-gray-50/50 rounded-3xl p-2 transition-colors hover:bg-gray-100/50">
                           {proposals.filter(p => p.status === status).map(prop => (
                              <div
                                 key={prop.id}
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, prop.id)}
                                 onClick={() => setSelectedProposal(prop)}
                                 className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:border-primary cursor-grab active:cursor-grabbing group transition-all hover:shadow-md hover:-translate-y-1"
                              >
                                 <div className="flex justify-between items-start mb-3">
                                    <span className="text-[9px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-widest">{prop.propertyCode}</span>
                                    <div className="flex items-center gap-1.5">
                                       <span className="material-symbols-outlined text-xs text-amber-500">schedule</span>
                                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                                          {prop.expirationAt ? new Date(prop.expirationAt).toLocaleDateString() : 'N/A'}
                                       </span>
                                    </div>
                                 </div>
                                 <h4 className="font-black text-dark-accent mb-1 truncate">{prop.leadName}</h4>
                                 <p className="text-[10px] text-gray-400 font-bold mb-4">{prop.propertyTitle}</p>

                                 <div className="py-3 border-y border-gray-50 mb-4">
                                    <p className="text-lg font-black text-dark-accent leading-none">{formatCurrency(prop.offerValue)}</p>
                                    <div className="flex items-center justify-between mt-1">
                                       <p className="text-[9px] font-black text-red-500 uppercase">-{prop.discountPercent}% desconto</p>
                                       {prop.paymentType?.toLowerCase() === 'financiamento' && (
                                          <p className="text-[9px] font-black text-primary uppercase">
                                             {prop.installments || 120}x {formatCurrency((prop.offerValue - prop.entryValue) / (prop.installments || 120))}
                                          </p>
                                       )}
                                    </div>
                                 </div>

                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <span className="material-symbols-outlined text-sm text-gray-300">account_balance_wallet</span>
                                       <span className="text-[10px] font-black text-gray-500 uppercase">{prop.paymentType}</span>
                                    </div>
                                    <button
                                       onClick={(e) => { e.stopPropagation(); handleCopyWhatsApp(prop); }}
                                       className="bg-[#25D366]/10 text-[#25D366] p-2 rounded-xl hover:bg-[#25D366] hover:text-white transition-all"
                                    >
                                       <span className="material-symbols-outlined text-sm">chat</span>
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {activeTab === 'list' && (
               <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                           <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Lead / Imóvel</th>
                           <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Valor Proposto</th>
                           <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Desconto</th>
                           <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                           <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ações</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {proposals.map(prop => (
                           <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-5">
                                 <div>
                                    <h3 className="font-black text-dark-accent leading-none mb-1">{prop.leadName}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold">{prop.propertyCode} • {prop.propertyTitle}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <p className="font-black text-dark-accent">{formatCurrency(prop.offerValue)}</p>
                                 <div className="flex flex-col">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{prop.paymentType}</p>
                                    {prop.paymentType?.toLowerCase() === 'financiamento' && (
                                       <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                                          {prop.installments || 120}x {formatCurrency((prop.offerValue - prop.entryValue) / (prop.installments || 120))}
                                       </p>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                 <div className="inline-flex flex-col items-center">
                                    <span className={`text-xs font-black ${prop.discountPercent > 10 ? 'text-red-500' : 'text-amber-600'}`}>-{prop.discountPercent}%</span>
                                    <span className="text-[9px] font-bold text-gray-300">{formatCurrency(prop.discountValue)}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <span className="px-3 py-1 bg-slate-100 text-dark-accent rounded-full text-[10px] font-black uppercase tracking-widest">{prop.status}</span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => setSelectedProposal(prop)} className="p-2 bg-dark-accent/5 text-dark-accent rounded-xl hover:bg-dark-accent hover:text-white transition-all">
                                       <span className="material-symbols-outlined text-xl">history</span>
                                    </button>
                                    <button onClick={() => handleCopyWhatsApp(prop)} className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all">
                                       <span className="material-symbols-outlined text-xl">chat</span>
                                    </button>
                                    <button onClick={() => handleDeleteProposal(prop.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                       <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {activeTab === 'calculator' && (
               <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                        <h3 className="font-black text-lg tracking-tight mb-4">Simulador de Viabilidade</h3>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Preço de Tabela (R$)</label>
                              <input
                                 type="number"
                                 value={calcData.listPrice}
                                 onChange={e => setCalcData({ ...calcData, listPrice: Number(e.target.value) })}
                                 className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-lg"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Valor Proposto (R$)</label>
                              <input
                                 type="number"
                                 value={calcData.offer}
                                 onChange={e => setCalcData({ ...calcData, offer: Number(e.target.value) })}
                                 className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-xl text-primary"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Comissão Acordada (%)</label>
                              <input
                                 type="number"
                                 value={calcData.commission}
                                 onChange={e => setCalcData({ ...calcData, commission: Number(e.target.value) })}
                                 className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold"
                              />
                           </div>
                        </div>
                     </section>

                     <section className="bg-dark-accent p-8 rounded-[32px] text-white space-y-8 flex flex-col justify-center">
                        <div>
                           <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Desconto Concedido</p>
                           <h4 className="text-3xl font-black">{formatCurrency(calcResult.discount)} <span className="text-lg text-primary/60">({calcResult.discountPct.toFixed(1)}%)</span></h4>
                           {calcResult.discountPct > 10 && <p className="text-red-400 text-[10px] font-bold mt-2 uppercase tracking-tight flex items-center gap-1"><span className="material-symbols-outlined text-xs">warning</span> Atenção: Desconto acima da margem padrão de 10%</p>}
                        </div>
                        <div className="pt-8 border-t border-white/10">
                           <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Comissão Estimada</p>
                           <h4 className="text-4xl font-black text-primary">{formatCurrency(calcResult.commissionVal)}</h4>
                           <p className="text-xs text-gray-400 mt-2 font-bold leading-relaxed">Considerando o valor proposto de {formatCurrency(calcData.offer)} com {calcData.commission}% de honorários.</p>
                        </div>
                     </section>
                  </div>
               </div>
            )}
         </main>

         {/* Modal de Detalhes e Timeline */}
         {selectedProposal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProposal(null)}></div>
               <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up flex flex-col max-h-[90vh]">
                  <header className="p-8 bg-slate-50 border-b border-gray-100">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <span className="bg-primary text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest mb-2 inline-block">{selectedProposal.status}</span>
                           <h3 className="text-xl font-black text-dark-accent">{selectedProposal.leadName}</h3>
                           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedProposal.propertyCode} • {selectedProposal.propertyTitle}</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleDeleteProposal(selectedProposal.id)} className="size-10 rounded-full hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"><span className="material-symbols-outlined">delete</span></button>
                           <button onClick={() => setSelectedProposal(null)} className="size-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 bg-white rounded-2xl border border-gray-100 px-6">
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Oferta</p>
                           <p className="text-sm font-black text-dark-accent">{formatCurrency(selectedProposal.offerValue)}</p>
                        </div>
                        <div className="border-l md:border-x border-gray-50 md:text-center px-2">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Desconto</p>
                           <p className="text-sm font-black text-red-500">{selectedProposal.discountPercent}%</p>
                        </div>
                        <div className="border-t md:border-t-0 pt-4 md:pt-0">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Entrada</p>
                           <p className="text-sm font-black text-dark-accent">{formatCurrency(selectedProposal.entryValue)}</p>
                        </div>
                        <div className="border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:text-right">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pagamento</p>
                           <p className="text-sm font-black text-primary">{selectedProposal.paymentType}</p>
                        </div>
                     </div>
                     {selectedProposal.paymentType?.toLowerCase() === 'financiamento' && (
                        <div className="mt-4 p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between">
                           <div>
                              <p className="text-[9px] font-black text-primary uppercase tracking-widest">Plano de Financiamento</p>
                              <p className="text-sm font-black text-dark-accent">
                                 {selectedProposal.installments || 120} parcelas de {formatCurrency((selectedProposal.offerValue - selectedProposal.entryValue) / (selectedProposal.installments || 120))}
                              </p>
                           </div>
                           <span className="material-symbols-outlined text-primary">account_balance</span>
                        </div>
                     )}
                  </header>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                     <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest">Timeline da Negociação</h4>
                     </div>

                     {/* Add Event Form */}
                     <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                        <div className="flex gap-2">
                           <select
                              className="bg-white border-none rounded-xl text-xs font-bold p-2"
                              value={newEvent.eventType}
                              onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value })}
                           >
                              <option>Mensagem</option>
                              <option>Contra-proposta</option>
                              <option>Ajuste de valor</option>
                              <option>Aceite</option>
                              <option>Recusa</option>
                           </select>
                           <select
                              className="bg-white border-none rounded-xl text-xs font-bold p-2"
                              value={newEvent.actor}
                              onChange={e => setNewEvent({ ...newEvent, actor: e.target.value })}
                           >
                              <option>Corretor</option>
                              <option>Cliente</option>
                              <option>Proprietário</option>
                           </select>
                           <input
                              className="flex-1 bg-white border-none rounded-xl text-xs p-2"
                              placeholder="Resumo do evento..."
                              value={newEvent.summary}
                              onChange={e => setNewEvent({ ...newEvent, summary: e.target.value })}
                           />
                           <button onClick={handleAddEvent} className="bg-dark-accent text-white p-2 rounded-xl">
                              <span className="material-symbols-outlined text-sm">send</span>
                           </button>
                        </div>
                     </div>

                     <div className="space-y-6 relative">
                        <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100"></div>
                        {events.map(ev => (
                           <div key={ev.id} className="relative pl-10">
                              <div className="absolute left-2.5 top-1 size-3 rounded-full bg-primary border-2 border-white"></div>
                              <div className="bg-slate-50 p-4 rounded-2xl">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{ev.actor} • {ev.channel}</span>
                                    <span className="text-[9px] font-bold text-gray-400">{new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                 </div>
                                 <p className="text-xs font-black text-dark-accent">{ev.eventType}</p>
                                 <p className="text-xs text-gray-500 font-medium mt-1">{ev.summary}</p>
                              </div>
                           </div>
                        ))}
                     </div>

                     {/* Communication Section */}
                     <div className="px-8 pb-8 space-y-4">
                        <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest border-t border-gray-100 pt-6">Comunicação WhatsApp</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Buyer Card */}
                           <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Mensagem para Comprador</span>
                                 <span className="material-symbols-outlined text-green-600 text-sm">person</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-3 line-clamp-3 italic">"{getBuyerMessage(selectedProposal)}"</p>
                              <button
                                 onClick={() => sendWhatsApp(selectedProposal.leadPhone, getBuyerMessage(selectedProposal), selectedProposal.leadName, selectedProposal.leadId)}
                                 className="w-full bg-green-500 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                              >
                                 <span className="material-symbols-outlined text-sm">send</span>
                                 Enviar para Lead
                              </button>
                           </div>

                           {/* Owner Card */}
                           <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Mensagem para Proprietário</span>
                                 <span className="material-symbols-outlined text-blue-600 text-sm">real_estate_agent</span>
                              </div>
                              {selectedProposal.ownerPhone ? (
                                 <>
                                    <p className="text-xs text-gray-600 mb-3 line-clamp-3 italic">"{getOwnerMessage(selectedProposal)}"</p>
                                    <button
                                       onClick={() => sendWhatsApp(selectedProposal.ownerPhone, getOwnerMessage(selectedProposal), selectedProposal.ownerName || 'Proprietário')}
                                       className="w-full bg-blue-500 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                                    >
                                       <span className="material-symbols-outlined text-sm">send</span>
                                       Enviar para Proprietário
                                    </button>
                                 </>
                              ) : (
                                 <div className="text-center py-4 text-gray-400 text-xs font-bold">
                                    Telefone do proprietário não cadastrado.
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  <footer className="p-8 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-4">
                     <button
                        onClick={() => handleUpdateStatus('Recusada')}
                        className="h-14 bg-white border border-gray-100 rounded-2xl font-black text-xs text-dark-accent hover:bg-red-50 hover:text-red-500 transition-all"
                     >
                        Recusar Proposta
                     </button>
                     <button
                        onClick={() => handleUpdateStatus('Aceita')}
                        className="h-14 bg-dark-accent text-white rounded-2xl font-black text-xs hover:bg-primary hover:text-black transition-all"
                     >
                        Aceitar Proposta
                     </button>
                  </footer>
               </div>
            </div>
         )}

         {/* Create Modal */}
         {showCreateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
               <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up p-8">
                  <h2 className="text-xl font-black text-dark-accent mb-6">Nova Proposta</h2>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Cliente (Lead)</label>
                        <select
                           className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm"
                           value={newProposalData.leadId}
                           onChange={e => setNewProposalData({ ...newProposalData, leadId: e.target.value })}
                        >
                           <option value="">Selecione um lead...</option>
                           {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Imóvel</label>
                        <select
                           className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm"
                           value={newProposalData.propertyId}
                           onChange={e => setNewProposalData({ ...newProposalData, propertyId: e.target.value })}
                        >
                           <option value="">Selecione um imóvel...</option>
                           {properties.map(p => <option key={p.id} value={p.id}>{p.code} - {p.title}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Valor Proposta</label>
                           <input
                              type="number"
                              className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm"
                              placeholder="R$ 0,00"
                              value={newProposalData.offerValue}
                              onChange={e => setNewProposalData({ ...newProposalData, offerValue: e.target.value })}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Entrada</label>
                           <input
                              type="number"
                              className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm"
                              placeholder="R$ 0,00"
                              value={newProposalData.entryValue}
                              onChange={e => setNewProposalData({ ...newProposalData, entryValue: e.target.value })}
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Pagamento</label>
                           <select
                              className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm"
                              value={newProposalData.paymentType}
                              onChange={e => setNewProposalData({ ...newProposalData, paymentType: e.target.value })}
                           >
                              <option>À vista</option>
                              <option>Financiamento</option>
                              <option>Consórcio</option>
                              <option>Permuta</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Validade</label>
                           <input
                              type="date"
                              className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm"
                              value={newProposalData.expirationDate}
                              onChange={e => setNewProposalData({ ...newProposalData, expirationDate: e.target.value })}
                           />
                        </div>
                     </div>
                     {newProposalData.paymentType === 'Financiamento' && (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nº Parcelas</label>
                              <input
                                 type="number"
                                 className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm"
                                 value={newProposalData.installments}
                                 onChange={e => setNewProposalData({ ...newProposalData, installments: e.target.value })}
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Parcela Est.</label>
                              <div className="w-full bg-primary/10 border-none rounded-xl p-3 font-black text-primary text-sm">
                                 {formatCurrency((parseFloat(newProposalData.offerValue || '0') - (parseFloat(newProposalData.entryValue) || 0)) / (parseInt(newProposalData.installments) || 1))}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
                  <div className="mt-8 flex gap-3">
                     <button
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                     >
                        Cancelar
                     </button>
                     <button
                        onClick={handleCreateProposal}
                        disabled={loading}
                        className="flex-1 bg-primary text-black py-3 rounded-xl font-black shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50"
                     >
                        {loading ? 'Criando...' : 'Criar Proposta'}
                     </button>
                  </div>
               </div>
            </div>
         )
         }
      </AdminLayout >
   );
};

export default Proposals;
