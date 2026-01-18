
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { DocTemplate, Document, DocStatus, Lead } from '../../types';
import { supabase } from '../../lib/supabase';

const Documents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'models' | 'config'>('leads');
  const [templates, setTemplates] = useState<DocTemplate[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Templates
      const { data: templatesData } = await supabase.from('doc_templates').select('*');
      if (templatesData) setTemplates(templatesData);

      // Fetch Leads with their document counts
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          id, 
          name, 
          status,
          cpf,
          rg,
          address,
          property_code
        `)
        .order('name');

      if (leadsError) throw leadsError;

      // Fetch Document stats for each lead
      const { data: docsData } = await supabase.from('lead_documents').select('lead_id, status');

      const mappedLeads = (leadsData || []).map(lead => {
        const leadDocs = (docsData || []).filter(d => d.lead_id === lead.id);
        const total = leadDocs.length || 5; // Default expected docs if none created
        const completed = leadDocs.filter(d => d.status === 'RECEIVED' || d.status === 'VALIDATED').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          ...lead,
          progress,
          pendingDocs: Math.max(0, total - completed),
          stage: lead.status
        };
      });

      setLeads(mappedLeads);
    } catch (error) {
      console.error('Error fetching documents data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Modelo copiado com sucesso!');
  };

  const generateDocument = (template: DocTemplate, lead: any) => {
    let content = template.content;
    content = content.replace(/{NOME_LEAD}/g, lead.name || '---');
    content = content.replace(/{CPF_LEAD}/g, lead.cpf || '---');
    content = content.replace(/{RG_LEAD}/g, lead.rg || '---');
    content = content.replace(/{ENDERECO_LEAD}/g, lead.address || '---');
    content = content.replace(/{COD_IMOVEL}/g, lead.property_code || '---');

    setGeneratedContent(content);
    setShowGenModal(true);
  };

  return (
    <AdminLayout activeTab="documents">
      <header className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-dark-accent">Documentos & Checklist</h1>
            <p className="text-gray-500 text-sm">Padronização e aceleração de fechamentos.</p>
          </div>
          <button className="bg-primary text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-primary/20 transition-active">
            <span className="material-symbols-outlined">add</span>
            Novo Modelo
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full md:w-max">
          <button onClick={() => setActiveTab('leads')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Por Lead</button>
          <button onClick={() => setActiveTab('models')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'models' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Biblioteca de Modelos</button>
          <button onClick={() => setActiveTab('config')} className={`flex-1 md:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}>Config. Checklists</button>
        </div>
      </header>

      <main className="px-6 py-8 pb-32">
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-bold">Carregando dados...</div>
        ) : (
          <>
            {activeTab === 'leads' && (
              <div className="space-y-4">
                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Lead / Etapa</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Progresso</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Pendências</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5">
                            <h3 className="font-black text-dark-accent">{lead.name}</h3>
                            <span className="text-[9px] font-black bg-slate-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">{lead.stage}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all ${lead.progress === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${lead.progress}%` }}></div>
                              </div>
                              <span className="text-xs font-black text-dark-accent">{lead.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            {lead.pendingDocs > 0 ? (
                              <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[10px] font-black">{lead.pendingDocs} Pendentes</span>
                            ) : (
                              <span className="material-symbols-outlined text-green-500">check_circle</span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="p-2 bg-dark-accent/5 text-dark-accent rounded-xl hover:bg-dark-accent hover:text-white transition-all"
                            >
                              <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedLead && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
                    <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up flex flex-col max-h-[90vh]">
                      <header className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                          <h2 className="text-2xl font-black text-dark-accent">Documentação: {selectedLead.name}</h2>
                          <p className="text-sm text-gray-500">Gerencie arquivos, checklists e gere contratos oficiais.</p>
                        </div>
                        <button onClick={() => setSelectedLead(null)} className="size-12 rounded-2xl bg-slate-50 text-gray-400 hover:text-dark-accent flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </header>

                      <div className="p-8 overflow-y-auto flex-1">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          {/* Coluna 1: Gerador */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-primary">description</span>
                              <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Gerar Documento Oficial</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {templates.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">Nenhum modelo de documento cadastrado.</p>
                              ) : templates.map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => generateDocument(t, selectedLead)}
                                  className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-primary hover:bg-white transition-all text-left shadow-sm hover:shadow-md"
                                >
                                  <div>
                                    <p className="text-sm font-black text-dark-accent">{t.title}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{t.category}</p>
                                  </div>
                                  <span className="material-symbols-outlined text-primary">arrow_forward</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Coluna 2: Checklist */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-primary">fact_check</span>
                              <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Checklist de Recebimento</h3>
                            </div>
                            <div className="space-y-3">
                              {[
                                { label: 'RG / CNH', key: 'rg' },
                                { label: 'CPF', key: 'cpf' },
                                { label: 'Comprovante de Residência', key: 'address' },
                                { label: 'Certidão de Estado Civil', key: 'civil' },
                                { label: 'Comprovante de Renda', key: 'income' }
                              ].map(doc => (
                                <div key={doc.label} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className={`size-6 rounded-full flex items-center justify-center ${selectedLead[doc.key] ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                                      <span className="material-symbols-outlined text-sm">{selectedLead[doc.key] ? 'check' : 'pending'}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{doc.label}</span>
                                  </div>
                                  <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                    {selectedLead[doc.key] ? 'Ver Arquivo' : 'Solicitar'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <footer className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-dark-accent font-black">
                            {selectedLead.progress}%
                          </div>
                          <div>
                            <p className="text-xs font-black text-dark-accent uppercase">Progresso Total</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Fechamento em andamento</p>
                          </div>
                        </div>
                        <button className="bg-dark-accent text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-active shadow-lg shadow-black/10">
                          Finalizar Processo
                        </button>
                      </footer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'models' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:border-primary transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[9px] font-black bg-primary/20 text-primary px-2 py-1 rounded-md uppercase tracking-widest">{template.category}</span>
                        <h3 className="text-xl font-black text-dark-accent mt-2">{template.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyTemplate(template.content)}
                          className="size-10 rounded-xl bg-slate-50 text-gray-400 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all"
                        >
                          <span className="material-symbols-outlined text-xl">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium line-clamp-3 leading-relaxed">
                        {template.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'config' && (
              <div className="max-w-2xl mx-auto text-center py-20">
                <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">settings</span>
                <h3 className="text-xl font-black text-dark-accent">Configurações de Checklist</h3>
                <p className="text-gray-500 mt-2">Em breve você poderá personalizar os itens obrigatórios por tipo de transação.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Documento Gerado */}
      {showGenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGenModal(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up flex flex-col max-h-[85vh]">
            <header className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-dark-accent">Documento Gerado</h3>
              <button onClick={() => setShowGenModal(false)} className="text-gray-400 hover:text-dark-accent"><span className="material-symbols-outlined">close</span></button>
            </header>
            <div className="p-8 overflow-y-auto flex-1">
              <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100 font-serif text-gray-800 leading-relaxed whitespace-pre-wrap">
                {generatedContent}
              </div>
            </div>
            <footer className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button
                onClick={() => handleCopyTemplate(generatedContent)}
                className="flex-1 bg-primary text-black h-14 rounded-2xl font-black transition-active flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">content_copy</span>
                Copiar Texto
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-dark-accent text-white h-14 rounded-2xl font-black transition-active flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">print</span>
                Imprimir
              </button>
            </footer>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Documents;

