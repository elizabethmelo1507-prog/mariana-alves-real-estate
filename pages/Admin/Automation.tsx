
import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { openai } from '../../lib/openai';
import { supabase } from '../../lib/supabase';

interface Message {
   role: 'user' | 'assistant';
   content: string;
   timestamp: Date;
   automation?: AutomationSuggestion;
}

interface AutomationSuggestion {
   name: string;
   type: 'template' | 'sequence' | 'rule';
   description: string;
   config: any;
}

interface Automation {
   id: string;
   name: string;
   type: 'template' | 'sequence' | 'rule';
   description: string;
   config: any;
   active: boolean;
   created_at: string;
}

const AUTOMATION_TEMPLATES = [
   {
      name: 'Boas-vindas para Novos Leads',
      type: 'template' as const,
      description: 'Template de mensagem automática enviada quando um novo lead entra no sistema',
      config: {
         text: 'Olá {NOME_LEAD}! 👋\n\nVi seu interesse no imóvel {COD_IMOVEL} em {BAIRRO}.\n\nPara eu te passar as informações corretas:\n1️⃣ Você busca para morar ou investir?\n2️⃣ Qual sua urgência?\n3️⃣ Já conhece a região?\n\nEstou à disposição!',
         stage: 'NEW_LEAD',
         tone: 'FRIENDLY'
      }
   },
   {
      name: 'Follow-up Pós-Visita',
      type: 'template' as const,
      description: 'Mensagem de feedback enviada 24h após visita ao imóvel',
      config: {
         text: 'Oi {NOME_LEAD}! 🏠\n\nO que achou da visita ao {COD_IMOVEL} hoje?\n\nGostou da localização e dos acabamentos? Quer agendar uma segunda visita ou ver outras opções?',
         stage: 'POST_VISIT',
         tone: 'FRIENDLY'
      }
   },
   {
      name: 'Sequência de Reengajamento (3 toques)',
      type: 'sequence' as const,
      description: 'Fluxo automático para leads inativos há mais de 3 dias',
      config: {
         touches: [
            { delayHours: 0, message: 'Oi {NOME_LEAD}! Tudo bem? Ainda está procurando imóvel?' },
            { delayHours: 48, message: 'Oi! Vi que você se interessou por {COD_IMOVEL}. Surgiu alguma dúvida?' },
            { delayHours: 120, message: 'Olá! Se mudou o perfil de busca, me avisa que ajusto aqui! 🙂' }
         ],
         trigger: 'INACTIVE_3_DAYS'
      }
   },
   {
      name: 'Regra: Visita → Follow-up Automático',
      type: 'rule' as const,
      description: 'Quando um lead visita um imóvel, dispara follow-up após 24h',
      config: {
         trigger: 'VISIT_COMPLETED',
         action: 'SEND_TEMPLATE',
         templateId: 'POST_VISIT',
         delayHours: 24
      }
   },
   {
      name: 'Checklist Financiamento',
      type: 'template' as const,
      description: 'Template para leads que optaram por financiamento',
      config: {
         text: 'Perfeito, {NOME_LEAD}! 📋\n\nComo você vai por financiamento, preciso dos seguintes documentos:\n\n✅ RG e CPF\n✅ Comprovante de Renda (últimos 3 meses)\n✅ Certidão de Estado Civil\n✅ Comprovante de Residência\n\nQuer que eu te envie o link para upload?',
         stage: 'FINANCING',
         tone: 'DIRECT'
      }
   },
   {
      name: 'Regra: Lead Sumiu → Reengajamento',
      type: 'rule' as const,
      description: 'Dispara sequência de reengajamento quando lead fica inativo por 3 dias',
      config: {
         trigger: 'NO_CONTACT_3_DAYS',
         action: 'START_SEQUENCE',
         sequenceId: 'REENGAGEMENT_3_TOUCH'
      }
   }
];

const Automation: React.FC = () => {
   const [activeTab, setActiveTab] = useState<'tutorial' | 'ai-assistant' | 'my-automations' | 'next-steps' | 'settings'>('tutorial');
   const [messages, setMessages] = useState<Message[]>([]);
   const [input, setInput] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [myAutomations, setMyAutomations] = useState<Automation[]>([]);
   const [nextSteps, setNextSteps] = useState<any[]>([]);
   const [sendModalOpen, setSendModalOpen] = useState(false);
   const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
   const [leads, setLeads] = useState<any[]>([]);
   const [selectedLead, setSelectedLead] = useState<any>(null);
   const [personalizedMessage, setPersonalizedMessage] = useState('');
   const [appSettings, setAppSettings] = useState<any[]>([]);
   const [isSavingSettings, setIsSavingSettings] = useState(false);
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   };

   useEffect(() => {
      scrollToBottom();
   }, [messages]);

   useEffect(() => {
      if (activeTab === 'my-automations') {
         fetchMyAutomations();
      } else if (activeTab === 'next-steps') {
         fetchNextSteps();
      } else if (activeTab === 'settings') {
         fetchAppSettings();
      }
   }, [activeTab]);

   const fetchAppSettings = async () => {
      try {
         const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .order('key', { ascending: true });

         if (error) throw error;
         setAppSettings(data || []);
      } catch (error) {
         console.error('Error fetching app settings:', error);
      }
   };

   const updateSetting = async (id: string, value: string) => {
      try {
         setIsSavingSettings(true);
         const { error } = await supabase
            .from('app_settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('id', id);

         if (error) throw error;
         fetchAppSettings();
      } catch (error) {
         console.error('Error updating setting:', error);
         alert('Erro ao salvar configuração.');
      } finally {
         setIsSavingSettings(false);
      }
   };

   const testWebhook = async (key: string, url: string) => {
      if (!url) {
         alert('Por favor, insira uma URL válida primeiro.');
         return;
      }

      try {
         let payload: any = {
            broker_name: "Mariana Alves",
            broker_phone: "5592982031507",
            timestamp: new Date().toISOString(),
            is_test: true
         };

         switch (key) {
            case 'webhook_new_lead':
               payload = {
                  ...payload,
                  event: 'new_lead',
                  lead_name: 'João Teste (Simulação)',
                  property: 'Residencial Aurora Premium',
                  phone: '(92) 99999-0000',
                  whatsapp_link: 'https://wa.me/5592999990000'
               };
               break;
            case 'webhook_new_visit':
               payload = {
                  ...payload,
                  event: 'new_visit_request',
                  lead_name: 'Maria Teste (Simulação)',
                  property: 'Sky Garden Flat Luxury',
                  visit_date: new Date().toISOString().split('T')[0],
                  visit_time: '14:30',
                  phone: '(92) 98888-0000',
                  whatsapp_link: 'https://wa.me/5592988880000'
               };
               break;
            case 'webhook_new_evaluation':
               payload = {
                  ...payload,
                  event: 'new_evaluation_request',
                  name: 'Carlos Teste (Simulação)',
                  phone: '(92) 97777-0000',
                  property_type: 'Apartamento',
                  neighborhood: 'Adrianópolis',
                  whatsapp_link: 'https://wa.me/5592977770000'
               };
               break;
            case 'webhook_reminder':
               payload = {
                  ...payload,
                  event: 'visit_reminder_24h',
                  lead_name: 'Ana Teste (Simulação)',
                  lead_phone: '(92) 96666-0000',
                  property_title: 'Mansão Riviera Águas Profundas',
                  visit_time: '10:00',
                  whatsapp_link: 'https://wa.me/5592966660000',
                  follow_up_message: 'Olá Ana! Confirmando nossa visita amanhã às 10:00. Nos vemos lá!'
               };
               break;
            case 'webhook_automation':
               payload = {
                  ...payload,
                  event: 'automation_shortcut_trigger',
                  template_name: 'Teste de Atalho',
                  lead_id: 'test-id',
                  lead_name: 'Lucas Teste (Simulação)',
                  lead_phone: '(92) 95555-0000',
                  message: 'Esta é uma mensagem de teste automática enviada pelo painel de configurações.',
                  whatsapp_link: 'https://wa.me/5592955550000'
               };
               break;
            default:
               payload.event = 'generic_test';
               payload.message = 'Teste genérico do sistema';
         }

         const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         if (response.ok) {
            alert('✅ Teste enviado com sucesso! Verifique seu n8n.');
         } else {
            const errorText = await response.text();
            alert(`❌ Erro no teste (${response.status}): ${errorText}`);
         }
      } catch (error: any) {
         console.error('Error testing webhook:', error);
         alert(`❌ Erro de conexão: ${error.message}`);
      }
   };

   const fetchMyAutomations = async () => {
      try {
         const { data, error } = await supabase
            .from('automations')
            .select('*')
            .order('created_at', { ascending: false });

         if (error) throw error;
         setMyAutomations(data || []);
      } catch (error) {
         console.error('Error fetching automations:', error);
      }
   };

   const saveAutomation = async (automation: AutomationSuggestion) => {
      try {
         const { error } = await supabase.from('automations').insert([{
            name: automation.name,
            type: automation.type,
            description: automation.description,
            config: automation.config,
            active: true
         }]);

         if (error) throw error;

         alert('Automação salva com sucesso! ✅');
         fetchMyAutomations();
         setActiveTab('my-automations');
      } catch (error) {
         console.error('Error saving automation:', error);
         alert('Erro ao salvar automação.');
      }
   };

   const addTemplateAutomation = async (template: typeof AUTOMATION_TEMPLATES[0]) => {
      try {
         const { error } = await supabase.from('automations').insert([{
            name: template.name,
            type: template.type,
            description: template.description,
            config: template.config,
            active: true
         }]);

         if (error) throw error;

         alert('Template adicionado às suas automações! ✅');
         fetchMyAutomations();
      } catch (error) {
         console.error('Error adding template:', error);
         alert('Erro ao adicionar template.');
      }
   };

   const toggleAutomation = async (id: string, currentStatus: boolean) => {
      try {
         const { error } = await supabase
            .from('automations')
            .update({ active: !currentStatus })
            .eq('id', id);

         if (error) throw error;
         fetchMyAutomations();
      } catch (error) {
         console.error('Error toggling automation:', error);
      }
   };

   const deleteAutomation = async (id: string) => {
      if (!confirm('Tem certeza que deseja excluir esta automação?')) return;

      try {
         const { error } = await supabase
            .from('automations')
            .delete()
            .eq('id', id);

         if (error) throw error;
         fetchMyAutomations();
         alert('Automação excluída!');
      } catch (error) {
         console.error('Error deleting automation:', error);
      }
   };

   const openSendModal = async (automation: Automation) => {
      setSelectedAutomation(automation);
      setSendModalOpen(true);

      // Fetch leads
      try {
         const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('name', { ascending: true });

         if (error) throw error;
         setLeads(data || []);
      } catch (error) {
         console.error('Error fetching leads:', error);
      }
   };

   const handleLeadSelection = (lead: any) => {
      setSelectedLead(lead);

      // Personalize message based on automation type
      let message = '';

      if (selectedAutomation?.type === 'template' && selectedAutomation.config.text) {
         message = selectedAutomation.config.text;
      } else if (selectedAutomation?.type === 'sequence' && selectedAutomation.config.touches) {
         message = selectedAutomation.config.touches[0]?.message || '';
      }

      // Replace placeholders
      message = message
         .replace(/{NOME_LEAD}/g, lead.name || 'Cliente')
         .replace(/{COD_IMOVEL}/g, lead.propertyCode || lead.property || 'Imóvel')
         .replace(/{BAIRRO}/g, 'Ponta Negra')
         .replace(/{PRECO}/g, 'Consulte valores');

      setPersonalizedMessage(message);
   };

   const fetchNextSteps = async () => {
      try {
         const { data, error } = await supabase
            .from('lead_next_steps')
            .select(`
               *,
               leads (
                  id,
                  name,
                  phone,
                  property_code
               )
            `)
            .eq('status', 'pending')
            .order('scheduled_for', { ascending: true });

         if (error) throw error;
         setNextSteps(data || []);
      } catch (error) {
         console.error('Error fetching next steps:', error);
      }
   };

   const detectAutomationInResponse = (content: string): AutomationSuggestion | undefined => {
      // Simple detection: if response contains automation structure
      if (content.includes('```json') && (content.includes('template') || content.includes('sequence') || content.includes('rule'))) {
         try {
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
               const automationData = JSON.parse(jsonMatch[1]);
               return {
                  name: automationData.name || 'Nova Automação',
                  type: automationData.type || 'template',
                  description: automationData.description || '',
                  config: automationData.config || automationData
               };
            }
         } catch (e) {
            console.log('Could not parse automation');
         }
      }
      return undefined;
   };

   const sendMessage = async () => {
      if (!input.trim() || isLoading) return;

      const userMessage: Message = {
         role: 'user',
         content: input,
         timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
         const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
               {
                  role: 'system',
                  content: `Você é um assistente especializado em automações de marketing imobiliário e CRM.
            
Quando criar uma automação, sempre formate a resposta assim:

1. Explique a automação em português
2. Adicione um bloco de código JSON com a estrutura:

\`\`\`json
{
  "name": "Nome da Automação",
  "type": "template" ou "sequence" ou "rule",
  "description": "Descrição clara",
  "config": {
    // Configuração específica
  }
}
\`\`\`

Para TEMPLATES:
{
  "name": "Nome do Template",
  "type": "template",
  "description": "Quando usar este template",
  "config": {
    "text": "Texto com variáveis {NOME_LEAD}, {COD_IMOVEL}, {BAIRRO}, {PRECO}",
    "stage": "NEW_LEAD|POST_VISIT|FINANCING|etc",
    "tone": "FRIENDLY|DIRECT|PREMIUM"
  }
}

Para SEQUENCES (fluxos):
{
  "name": "Nome da Sequência",
  "type": "sequence",
  "description": "Quando disparar",
  "config": {
    "touches": [
      { "delayHours": 0, "message": "Primeira mensagem" },
      { "delayHours": 24, "message": "Segunda mensagem após 24h" }
    ],
    "trigger": "INACTIVE_3_DAYS|NEW_LEAD|etc"
  }
}

Para RULES (regras):
{
  "name": "Nome da Regra",
  "type": "rule",
  "description": "O que a regra faz",
  "config": {
    "trigger": "VISIT_COMPLETED|PROPOSAL_SENT|etc",
    "action": "SEND_TEMPLATE|START_SEQUENCE",
    "delayHours": 24
  }
}`
               },
               ...messages.map(m => ({ role: m.role, content: m.content })),
               { role: 'user', content: input }
            ],
            temperature: 0.7,
            max_tokens: 1500
         });

         const responseContent = response.choices[0].message.content || 'Desculpe, não consegui processar sua solicitação.';
         const detectedAutomation = detectAutomationInResponse(responseContent);

         const assistantMessage: Message = {
            role: 'assistant',
            content: responseContent,
            timestamp: new Date(),
            automation: detectedAutomation
         };

         setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
         console.error('Error calling OpenAI:', error);
         const errorMessage: Message = {
            role: 'assistant',
            content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
            timestamp: new Date()
         };
         setMessages(prev => [...prev, errorMessage]);
      } finally {
         setIsLoading(false);
      }
   };

   const getAutomationIcon = (type: string) => {
      switch (type) {
         case 'template': return 'edit_note';
         case 'sequence': return 'alternate_email';
         case 'rule': return 'rule';
         default: return 'settings_suggest';
      }
   };

   const getAutomationColor = (type: string) => {
      switch (type) {
         case 'template': return 'blue';
         case 'sequence': return 'purple';
         case 'rule': return 'green';
         default: return 'gray';
      }
   };

   return (
      <AdminLayout activeTab="automation">
         <header className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="flex items-center justify-between mb-6">
               <div>
                  <h1 className="text-2xl font-black tracking-tight text-dark-accent">Automações Inteligentes</h1>
                  <p className="text-gray-500 text-sm">Configure automações com auxílio de IA.</p>
               </div>
               <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm font-black">smart_toy</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Powered</span>
               </div>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full md:w-max overflow-x-auto hide-scrollbar">
               {[
                  { id: 'tutorial', label: 'Tutorial', icon: 'school' },
                  { id: 'ai-assistant', label: 'Assistente IA', icon: 'smart_toy' },
                  { id: 'next-steps', label: 'Próximos Passos', icon: 'schedule_send', badge: nextSteps.length },
                  { id: 'my-automations', label: 'Minhas Automações', icon: 'settings_suggest', badge: myAutomations.length },
                  { id: 'settings', label: 'Configurações', icon: 'settings' }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex items-center gap-2 flex-1 md:px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap relative ${activeTab === tab.id ? 'bg-white shadow-sm text-dark-accent' : 'text-gray-400'}`}
                  >
                     <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                     {tab.label}
                     {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-black size-5 rounded-full text-[9px] font-black flex items-center justify-center">
                           {tab.badge}
                        </span>
                     )}
                  </button>
               ))}
            </div>
         </header>

         <main className="px-6 py-8 pb-32">
            {activeTab === 'tutorial' && (
               <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                  <div className="bg-gradient-to-br from-primary via-amber-300 to-amber-400 p-10 rounded-[40px] text-black overflow-hidden relative">
                     <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4">🚀 Bem-vindo às Automações!</h2>
                        <p className="text-lg font-bold opacity-90 leading-relaxed">
                           Configure fluxos inteligentes de mensagens, follow-ups automáticos e muito mais com o poder da IA.
                        </p>
                     </div>
                     <span className="material-symbols-outlined absolute -right-10 -bottom-10 text-9xl opacity-10 rotate-12">auto_awesome</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="size-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
                           <span className="material-symbols-outlined text-3xl">edit_note</span>
                        </div>
                        <h3 className="text-xl font-black text-dark-accent mb-3">1. Templates de Mensagem</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                           Crie modelos de mensagens reutilizáveis para diferentes situações: boas-vindas, pós-visita, follow-up, etc.
                           Use variáveis como {'{NOME_LEAD}'}, {'{COD_IMOVEL}'} para personalização automática.
                        </p>
                     </div>

                     <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="size-16 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-6">
                           <span className="material-symbols-outlined text-3xl">alternate_email</span>
                        </div>
                        <h3 className="text-xl font-black text-dark-accent mb-3">2. Sequências Automáticas</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                           Configure fluxos de follow-up com múltiplos "toques". Ex: Enviar boas-vindas imediatamente, follow-up após 24h e reengajamento após 72h.
                        </p>
                     </div>

                     <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="size-16 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-6">
                           <span className="material-symbols-outlined text-3xl">rule</span>
                        </div>
                        <h3 className="text-xl font-black text-dark-accent mb-3">3. Regras de Gatilho</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                           Defina "Se → Então" automáticos. Ex: "Se lead visita imóvel → Enviar mensagem de feedback em 24h" ou "Se lead sem contato há 3 dias → Acionar sequência de reengajamento".
                        </p>
                     </div>

                     <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="size-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                           <span className="material-symbols-outlined text-3xl">smart_toy</span>
                        </div>
                        <h3 className="text-xl font-black text-dark-accent mb-3">4. Assistente de IA</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                           Peça ajuda ao assistente de IA para criar automações, corrigir templates, sugerir sequências ou até gerar código personalizado para casos específicos.
                        </p>
                     </div>
                  </div>

                  <div className="bg-blue-50 p-8 rounded-[32px] border-2 border-blue-100">
                     <div className="flex gap-4">
                        <div className="size-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                           <span className="material-symbols-outlined">lightbulb</span>
                        </div>
                        <div>
                           <h4 className="font-black text-dark-accent mb-2">💡 Dica Importante</h4>
                           <p className="text-sm text-gray-700 leading-relaxed">
                              Comece simples! Explore os <strong className="text-blue-600">Templates Prontos</strong> em "Minhas Automações",
                              teste-os manualmente e depois evolua para sequências automáticas.
                              Use o <strong className="text-blue-600">Assistente de IA</strong> para personalizar!
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'ai-assistant' && (
               <div className="max-w-4xl mx-auto animate-fade-in">
                  <div className="bg-white rounded-[40px] border border-gray-100 shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                     <header className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center gap-4">
                           <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center">
                              <span className="material-symbols-outlined text-2xl">smart_toy</span>
                           </div>
                           <div>
                              <h3 className="text-xl font-black text-dark-accent">Assistente de Automações IA</h3>
                              <p className="text-xs text-gray-500 font-bold">Powered by OpenAI GPT-4o-mini</p>
                           </div>
                        </div>
                     </header>

                     <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                        {messages.length === 0 && (
                           <div className="text-center py-20">
                              <div className="size-20 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
                                 <span className="material-symbols-outlined text-4xl">chat</span>
                              </div>
                              <h4 className="font-black text-dark-accent mb-2">Olá! Como posso ajudar hoje?</h4>
                              <p className="text-sm text-gray-500 max-w-md mx-auto">
                                 Pergunte sobre como criar templates, sequências, regras ou qualquer dúvida sobre automações!
                              </p>
                              <div className="mt-8 space-y-3 max-w-lg mx-auto">
                                 <button
                                    onClick={() => setInput('Crie um template de boas-vindas para novos leads')}
                                    className="w-full text-left p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary transition-all text-sm font-bold text-gray-700"
                                 >
                                    💬 Crie um template de boas-vindas para novos leads
                                 </button>
                                 <button
                                    onClick={() => setInput('Me ajude a criar uma sequência de follow-up automático')}
                                    className="w-full text-left p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary transition-all text-sm font-bold text-gray-700"
                                 >
                                    🔄 Me ajude a criar uma sequência de follow-up automático
                                 </button>
                                 <button
                                    onClick={() => setInput('Como criar uma regra para enviar mensagem após visita?')}
                                    className="w-full text-left p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary transition-all text-sm font-bold text-gray-700"
                                 >
                                    ⚡ Como criar uma regra para enviar mensagem após visita?
                                 </button>
                              </div>
                           </div>
                        )}

                        {messages.map((msg, idx) => (
                           <div key={idx}>
                              <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 {msg.role === 'assistant' && (
                                    <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0">
                                       <span className="material-symbols-outlined text-sm">smart_toy</span>
                                    </div>
                                 )}
                                 <div className={`max-w-[70%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-black' : 'bg-white border border-gray-100'}`}>
                                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <span className="text-[9px] font-bold opacity-50 mt-2 block">
                                       {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 </div>
                                 {msg.role === 'user' && (
                                    <div className="size-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                                       <span className="material-symbols-outlined text-sm">person</span>
                                    </div>
                                 )}
                              </div>

                              {msg.automation && (
                                 <div className="ml-14 mt-3 max-w-[70%]">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 rounded-2xl">
                                       <div className="flex items-start gap-3">
                                          <div className="size-10 rounded-xl bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                                             <span className="material-symbols-outlined text-lg">check_circle</span>
                                          </div>
                                          <div className="flex-1">
                                             <h4 className="font-black text-dark-accent text-sm mb-1">Automação Detectada!</h4>
                                             <p className="text-xs text-gray-600 mb-3">{msg.automation.name}</p>
                                             <button
                                                onClick={() => saveAutomation(msg.automation!)}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2"
                                             >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                Adicionar às Minhas Automações
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              )}
                           </div>
                        ))}

                        {isLoading && (
                           <div className="flex gap-3 justify-start">
                              <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0">
                                 <span className="material-symbols-outlined text-sm animate-pulse">smart_toy</span>
                              </div>
                              <div className="bg-white border border-gray-100 p-4 rounded-2xl">
                                 <div className="flex gap-1">
                                    <div className="size-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="size-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="size-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                 </div>
                              </div>
                           </div>
                        )}

                        <div ref={messagesEndRef} />
                     </div>

                     <footer className="p-6 border-t border-gray-100 bg-white">
                        <div className="flex gap-3">
                           <input
                              type="text"
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                              placeholder="Digite sua pergunta ou comando..."
                              className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                              disabled={isLoading}
                           />
                           <button
                              onClick={sendMessage}
                              disabled={isLoading || !input.trim()}
                              className="bg-primary text-black px-8 py-4 rounded-2xl font-black text-sm transition-active shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                           >
                              <span className="material-symbols-outlined text-lg">send</span>
                              Enviar
                           </button>
                        </div>
                     </footer>
                  </div>
               </div>
            )}

            {activeTab === 'next-steps' && (
               <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                  <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-10 rounded-[40px] text-white overflow-hidden relative">
                     <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4">📅 Próximos Passos</h2>
                        <p className="text-lg font-bold opacity-90 leading-relaxed">
                           Mensagens agendadas e próximos toques das suas sequências
                        </p>
                     </div>
                     <span className="material-symbols-outlined absolute -right-10 -bottom-10 text-9xl opacity-10 rotate-12">schedule_send</span>
                  </div>

                  {nextSteps.length === 0 ? (
                     <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="text-center py-16">
                           <div className="size-24 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-6">
                              <span className="material-symbols-outlined text-5xl">event_available</span>
                           </div>
                           <h3 className="text-2xl font-black text-dark-accent mb-3">Nenhum próximo passo agendado</h3>
                           <p className="text-gray-500 mb-8 max-w-md mx-auto">
                              Quando você enviar mensagens de sequências, os próximos toques aparecerão aqui automaticamente.
                           </p>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {nextSteps.map((step: any) => {
                           const scheduledDate = new Date(step.scheduled_for);
                           const now = new Date();
                           const isOverdue = scheduledDate < now;
                           const hoursUntil = Math.floor((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60));

                           return (
                              <div key={step.id} className={`bg-white p-6 rounded-[32px] border-2 ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'} shadow-sm hover:shadow-lg transition-all`}>
                                 <div className="flex items-start gap-6">
                                    <div className={`size-16 rounded-2xl ${isOverdue ? 'bg-red-500' : 'bg-blue-500'} text-white flex items-center justify-center flex-shrink-0`}>
                                       <span className="material-symbols-outlined text-3xl">schedule_send</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-3 mb-3">
                                          <h3 className="font-black text-dark-accent text-lg">{step.leads?.name || 'Lead'}</h3>
                                          <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded bg-blue-50 text-blue-600">
                                             {step.sequence_name}
                                          </span>
                                          {isOverdue && (
                                             <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded bg-red-100 text-red-600">
                                                ATRASADO
                                             </span>
                                          )}
                                       </div>

                                       <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                          <div className="flex items-center gap-1">
                                             <span className="material-symbols-outlined text-sm">phone</span>
                                             {step.leads?.phone}
                                          </div>
                                          <div className="flex items-center gap-1">
                                             <span className="material-symbols-outlined text-sm">home</span>
                                             {step.leads?.property_code}
                                          </div>
                                          <div className="flex items-center gap-1">
                                             <span className="material-symbols-outlined text-sm">schedule</span>
                                             {isOverdue ?
                                                `Venceu há ${Math.abs(hoursUntil)}h` :
                                                `Em ${hoursUntil}h (${scheduledDate.toLocaleDateString('pt-BR')} ${scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`
                                             }
                                          </div>
                                       </div>

                                       <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                                          <p className="text-sm text-gray-700 font-medium">{step.message}</p>
                                       </div>

                                       <div className="flex gap-3">
                                          <button
                                             onClick={async (e) => {
                                                const btn = e.currentTarget;
                                                const originalText = btn.innerHTML;
                                                const phone = step.leads?.phone?.replace(/\D/g, '');

                                                if (phone) {
                                                   try {
                                                      btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Enviando...';
                                                      btn.disabled = true;

                                                      const { sendAutomationShortcutToWebhook } = await import('../../lib/supabase');
                                                      await sendAutomationShortcutToWebhook(step.leads, step.sequence_name, step.message);

                                                      // Mark as sent
                                                      await supabase.from('lead_next_steps').update({
                                                         status: 'sent',
                                                         sent_at: new Date().toISOString()
                                                      }).eq('id', step.id);

                                                      // Save to history
                                                      await supabase.from('lead_interactions').insert([{
                                                         lead_id: step.lead_id,
                                                         type: 'message_sent',
                                                         channel: 'whatsapp_auto',
                                                         message: step.message,
                                                         automation_id: step.automation_id,
                                                         created_at: new Date().toISOString()
                                                      }]);

                                                      btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Enviado!';
                                                      setTimeout(() => {
                                                         fetchNextSteps();
                                                      }, 1000);
                                                   } catch (err) {
                                                      console.error('Error sending next step:', err);
                                                      btn.innerHTML = '<span class="material-symbols-outlined">error</span> Erro';
                                                      btn.disabled = false;
                                                      setTimeout(() => btn.innerHTML = originalText, 3000);
                                                   }
                                                }
                                             }}
                                             className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-12 rounded-2xl font-black text-sm transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                                          >
                                             <span className="material-symbols-outlined">bolt</span>
                                             Enviar Agora
                                          </button>
                                          <button
                                             onClick={async () => {
                                                if (confirm('Tem certeza que deseja cancelar este próximo passo?')) {
                                                   await supabase.from('lead_next_steps').update({ status: 'cancelled' }).eq('id', step.id);
                                                   fetchNextSteps();
                                                }
                                             }}
                                             className="bg-gray-100 text-gray-600 px-6 h-12 rounded-2xl font-black text-sm hover:bg-red-50 hover:text-red-500 transition-all"
                                          >
                                             Cancelar
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'my-automations' && (
               <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                  {/* Templates Prontos */}
                  <div>
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <h2 className="text-2xl font-black text-dark-accent">Templates Prontos</h2>
                           <p className="text-sm text-gray-500">Adicione automações pré-configuradas com um clique</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {AUTOMATION_TEMPLATES.map((template, idx) => {
                           const color = getAutomationColor(template.type);
                           const isAdded = myAutomations.some(a => a.name === template.name);

                           return (
                              <div key={idx} className={`bg-white p-6 rounded-[32px] border-2 ${isAdded ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} shadow-sm hover:shadow-lg transition-all group`}>
                                 <div className="flex items-start gap-4 mb-4">
                                    <div className={`size-12 rounded-2xl bg-${color}-50 text-${color}-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                       <span className="material-symbols-outlined">{getAutomationIcon(template.type)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-2 mb-1">
                                          <h3 className="font-black text-dark-accent text-sm truncate">{template.name}</h3>
                                          {isAdded && (
                                             <span className="size-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-xs">check</span>
                                             </span>
                                          )}
                                       </div>
                                       <span className={`text-[9px] font-black uppercase tracking-widest text-${color}-600`}>{template.type}</span>
                                    </div>
                                 </div>

                                 <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                    {template.description}
                                 </p>

                                 <button
                                    onClick={() => addTemplateAutomation(template)}
                                    disabled={isAdded}
                                    className={`w-full h-10 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${isAdded
                                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                       : `bg-${color}-500 hover:bg-${color}-600 text-white shadow-lg shadow-${color}-500/20`
                                       }`}
                                 >
                                    <span className="material-symbols-outlined text-sm">{isAdded ? 'check' : 'add'}</span>
                                    {isAdded ? 'Já Adicionado' : 'Adicionar'}
                                 </button>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* Minhas Automações Ativas */}
                  <div>
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <h2 className="text-2xl font-black text-dark-accent">Minhas Automações Ativas</h2>
                           <p className="text-sm text-gray-500">{myAutomations.length} automação(ões) configurada(s)</p>
                        </div>
                     </div>

                     {myAutomations.length === 0 ? (
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                           <div className="text-center py-16">
                              <div className="size-24 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-6">
                                 <span className="material-symbols-outlined text-5xl">settings_suggest</span>
                              </div>
                              <h3 className="text-2xl font-black text-dark-accent mb-3">Nenhuma automação ativa</h3>
                              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                 Comece adicionando um <strong className="text-primary">Template Pronto</strong> acima ou peça ajuda ao <strong className="text-blue-600">Assistente de IA</strong>.
                              </p>
                              <button
                                 onClick={() => setActiveTab('ai-assistant')}
                                 className="bg-primary text-black px-8 py-4 rounded-2xl font-black text-sm transition-active shadow-lg shadow-primary/20"
                              >
                                 Conversar com IA
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {myAutomations.map((automation) => {
                              const color = getAutomationColor(automation.type);

                              return (
                                 <div key={automation.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-4">
                                       <div className={`size-14 rounded-2xl bg-${color}-50 text-${color}-500 flex items-center justify-center flex-shrink-0`}>
                                          <span className="material-symbols-outlined text-2xl">{getAutomationIcon(automation.type)}</span>
                                       </div>

                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-3 mb-2">
                                             <h3 className="font-black text-dark-accent text-lg">{automation.name}</h3>
                                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-${color}-50 text-${color}-600`}>
                                                {automation.type}
                                             </span>
                                             <div className="ml-auto flex items-center gap-2">
                                                <button
                                                   onClick={() => toggleAutomation(automation.id, automation.active)}
                                                   className={`w-12 h-6 rounded-full relative transition-all ${automation.active ? 'bg-green-500' : 'bg-gray-200'}`}
                                                >
                                                   <div className={`size-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${automation.active ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </button>
                                                <button
                                                   onClick={() => deleteAutomation(automation.id)}
                                                   className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                   <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                             </div>
                                          </div>

                                          <p className="text-sm text-gray-600 mb-3">{automation.description}</p>

                                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
                                             <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(automation.config, null, 2)}
                                             </pre>
                                          </div>

                                          {automation.active && (automation.type === 'template' || automation.type === 'sequence') && (
                                             <button
                                                onClick={() => openSendModal(automation)}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                                             >
                                                <span className="material-symbols-outlined">send</span>
                                                Enviar para Cliente
                                             </button>
                                          )}
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

            {activeTab === 'settings' && (
               <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                  <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-10 rounded-[40px] text-white overflow-hidden relative">
                     <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4">⚙️ Configurações de Webhooks</h2>
                        <p className="text-lg font-bold opacity-90 leading-relaxed">
                           Gerencie as URLs de integração do seu sistema de forma dinâmica.
                        </p>
                     </div>
                     <span className="material-symbols-outlined absolute -right-10 -bottom-10 text-9xl opacity-10 rotate-12">settings</span>
                  </div>

                  <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                     <div className="p-8 border-b border-gray-50">
                        <h3 className="text-xl font-black text-dark-accent mb-2">Integrações n8n / Webhooks</h3>
                        <p className="text-sm text-gray-500">Altere as URLs abaixo para redirecionar os disparos do sistema.</p>
                     </div>

                     <div className="p-8 space-y-8">
                        {appSettings.map((setting) => (
                           <div key={setting.id} className="space-y-3">
                              <div className="flex items-center justify-between">
                                 <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                                    {setting.description || setting.key}
                                 </label>
                                 <span className="text-[10px] font-mono text-gray-300">{setting.key}</span>
                              </div>
                              <div className="flex gap-3">
                                 <input
                                    type="text"
                                    defaultValue={setting.value}
                                    onBlur={(e) => {
                                       if (e.target.value !== setting.value) {
                                          updateSetting(setting.id, e.target.value);
                                       }
                                    }}
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="https://..."
                                 />
                                 <button
                                    onClick={() => testWebhook(setting.key, setting.value)}
                                    className="px-6 bg-dark-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center gap-2"
                                    title="Enviar dados de teste"
                                 >
                                    <span className="material-symbols-outlined text-sm">send</span>
                                    Testar
                                 </button>
                                 <div className="size-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined">link</span>
                                 </div>
                              </div>
                           </div>
                        ))}

                        {appSettings.length === 0 && (
                           <div className="text-center py-12 text-gray-400">
                              <span className="material-symbols-outlined text-5xl mb-3 animate-pulse">sync</span>
                              <p className="font-bold">Carregando configurações...</p>
                           </div>
                        )}
                     </div>

                     <div className="p-8 bg-blue-50 border-t border-blue-100">
                        <div className="flex gap-4">
                           <div className="size-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined">info</span>
                           </div>
                           <div>
                              <h4 className="font-black text-dark-accent mb-1 text-sm">Como funciona?</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                 As alterações feitas aqui são aplicadas instantaneamente em todo o sistema.
                                 Não é necessário reiniciar ou atualizar o código. Certifique-se de que a URL
                                 esteja no formato correto (começando com https://).
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </main>

         {/* Send to Client Modal */}
         {sendModalOpen && selectedAutomation && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSendModalOpen(false)}></div>
               <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up">
                  <header className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                     <div className="flex items-center justify-between">
                        <div>
                           <h3 className="text-xl font-black text-dark-accent">Enviar para Cliente</h3>
                           <p className="text-xs text-gray-500 font-bold">{selectedAutomation.name}</p>
                        </div>
                        <button onClick={() => setSendModalOpen(false)} className="size-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                           <span className="material-symbols-outlined">close</span>
                        </button>
                     </div>
                  </header>

                  <div className="p-6 max-h-[60vh] overflow-y-auto">
                     {!selectedLead ? (
                        <div>
                           <h4 className="font-black text-dark-accent mb-4">Selecione um Cliente/Lead:</h4>
                           {leads.length === 0 ? (
                              <div className="text-center py-12 text-gray-400">
                                 <span className="material-symbols-outlined text-5xl mb-3 opacity-30">group</span>
                                 <p className="font-bold">Nenhum lead cadastrado</p>
                              </div>
                           ) : (
                              <div className="space-y-3">
                                 {leads.map(lead => (
                                    <button
                                       key={lead.id}
                                       onClick={() => handleLeadSelection(lead)}
                                       className="w-full text-left p-4 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-2xl transition-all group"
                                    >
                                       <div className="flex items-center gap-3">
                                          <div className="size-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                             <span className="material-symbols-outlined">person</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <h5 className="font-black text-dark-accent">{lead.name}</h5>
                                             <p className="text-xs text-gray-500 truncate">
                                                {lead.phone || 'Sem telefone'} • {lead.property || lead.propertyCode || 'Sem imóvel'}
                                             </p>
                                          </div>
                                          <span className="material-symbols-outlined text-gray-400 group-hover:text-green-500 transition-colors">
                                             arrow_forward
                                          </span>
                                       </div>
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>
                     ) : (
                        <div>
                           <div className="bg-green-50 p-4 rounded-2xl border border-green-100 mb-6">
                              <div className="flex items-center gap-3 mb-3">
                                 <div className="size-10 rounded-xl bg-green-500 text-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                 </div>
                                 <div>
                                    <h5 className="font-black text-dark-accent">{selectedLead.name}</h5>
                                    <p className="text-xs text-gray-600">{selectedLead.phone}</p>
                                 </div>
                                 <button
                                    onClick={() => {
                                       setSelectedLead(null);
                                       setPersonalizedMessage('');
                                    }}
                                    className="ml-auto text-xs font-bold text-gray-500 hover:text-dark-accent"
                                 >
                                    Trocar
                                 </button>
                              </div>
                           </div>

                           <h4 className="font-black text-dark-accent mb-3">Mensagem Personalizada:</h4>
                           <textarea
                              value={personalizedMessage}
                              onChange={(e) => setPersonalizedMessage(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-medium min-h-[200px] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                              placeholder="A mensagem personalizada aparecerá aqui..."
                           />
                           <p className="text-xs text-gray-500 mt-2">
                              💡 Você pode editar a mensagem antes de enviar
                           </p>
                        </div>
                     )}
                  </div>

                  {selectedLead && (
                     <footer className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                        <button
                           onClick={() => {
                              setSelectedLead(null);
                              setPersonalizedMessage('');
                           }}
                           className="flex-1 bg-white border border-gray-200 h-14 rounded-2xl font-black text-xs text-dark-accent hover:bg-gray-100 transition-all"
                        >
                           Voltar
                        </button>
                        <button
                           onClick={async (e) => {
                              const btn = e.currentTarget;
                              const originalText = btn.innerHTML;
                              try {
                                 btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Enviando...';
                                 btn.disabled = true;

                                 const { sendAutomationShortcutToWebhook } = await import('../../lib/supabase');
                                 await sendAutomationShortcutToWebhook(selectedLead, selectedAutomation.name, personalizedMessage);

                                 // Save interaction to history
                                 await supabase.from('lead_interactions').insert([{
                                    lead_id: selectedLead.id,
                                    type: 'message_sent',
                                    channel: 'whatsapp_auto',
                                    message: personalizedMessage,
                                    automation_id: selectedAutomation?.id,
                                    created_at: new Date().toISOString()
                                 }]);

                                 // Update last contact
                                 await supabase.from('leads').update({
                                    last_contact_at: new Date().toISOString()
                                 }).eq('id', selectedLead.id);

                                 btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Enviado!';

                                 setTimeout(() => {
                                    setSendModalOpen(false);
                                    setSelectedLead(null);
                                    setPersonalizedMessage('');
                                    alert('Mensagem enviada automaticamente via Webhook! ✅');
                                 }, 1500);

                              } catch (err) {
                                 console.error('Error sending automation:', err);
                                 btn.innerHTML = '<span class="material-symbols-outlined">error</span> Erro ao enviar';
                                 btn.disabled = false;
                                 setTimeout(() => {
                                    btn.innerHTML = originalText;
                                 }, 3000);
                              }
                           }}
                           disabled={!personalizedMessage.trim()}
                           className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-14 rounded-2xl font-black text-sm transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <span className="material-symbols-outlined">bolt</span>
                           Enviar Automaticamente
                        </button>
                     </footer>
                  )}
               </div>
            </div>
         )}

      </AdminLayout>
   );
};

export default Automation;
