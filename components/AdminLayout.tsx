
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'properties' | 'leads' | 'calendar' | 'visits' | 'settings' | 'priorities' | 'proposals' | 'documents' | 'content' | 'finance' | 'automation' | 'reactivation';
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { id: 'automation', label: 'Automações', icon: 'bolt', path: '/admin/automation' },
    { id: 'finance', label: 'Financeiro', icon: 'payments', path: '/admin/finance' },
    { id: 'priorities', label: 'Prioridades', icon: 'priority_high', path: '/admin/priorities' },
    { id: 'proposals', label: 'Propostas', icon: 'contract_edit', path: '/admin/proposals' },
    { id: 'documents', label: 'Documentos', icon: 'folder_open', path: '/admin/documents' },
    { id: 'properties', label: 'Imóveis', icon: 'corporate_fare', path: '/admin/manage' },
    { id: 'calendar', label: 'Agenda', icon: 'calendar_month', path: '/admin/calendar' },
    { id: 'reactivation', label: 'Reativação', icon: 'rebase_edit', path: '/admin/reactivation' },
    { id: 'leads', label: 'Leads', icon: 'group', path: '/admin/leads' },
    { id: 'settings', label: 'Ajustes', icon: 'account_circle', path: '/admin/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-dark-accent text-white flex-col sticky top-0 h-screen shrink-0 border-r border-white/5">
        <div className="p-8 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary size-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-black font-bold">domain</span>
            </div>
            <h2 className="font-black text-lg tracking-tight">Admin MA</h2>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Painel do Corretor</p>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${activeTab === tab.id
                ? 'bg-primary text-black shadow-lg shadow-primary/10'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <span className={`material-symbols-outlined transition-transform duration-200 ${activeTab === tab.id ? 'fill-1 scale-110' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </span>
              <span className="text-sm tracking-tight">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 font-bold hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Sair do Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-6xl mx-auto pb-32 md:pb-8">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Nav Mobile - Scrollable for many items */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-[70] shadow-2xl">
        <div className="flex items-center gap-1 py-3 px-2 overflow-x-auto hide-scrollbar scroll-smooth">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-4 py-1 min-w-[72px] transition-all rounded-xl ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'
                }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary/10' : ''}`}>
                <span className={`material-symbols-outlined text-2xl ${activeTab === tab.id ? 'fill-1' : ''}`}>
                  {tab.icon}
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
        {/* Subtle scroll indicator for mobile */}
        <div className="h-1 w-full bg-gray-50 flex justify-center items-center">
          <div className="h-0.5 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </nav>
    </div>
  );
};

export default AdminLayout;
