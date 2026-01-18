
import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Commission, CommissionPayment, Expense, MonthlyGoal, ExpenseCategory } from '../../types';

// Mock Data Inicial
const MOCK_COMMISSIONS: Commission[] = [
  { id: 'c1', leadName: 'João Silva', propertyCode: 'MA-001', dealValue: 4200000, commissionRate: 5, amountExpected: 210000, amountReceived: 105000, status: 'PARTIAL', createdAt: '2024-05-15' },
  { id: 'c2', leadName: 'Paula Mendes', propertyCode: 'MA-002', dealValue: 1150000, commissionRate: 6, amountExpected: 69000, amountReceived: 69000, status: 'RECEIVED', createdAt: '2024-05-10' },
  { id: 'c3', leadName: 'Ricardo G.', propertyCode: 'MA-003', dealValue: 4500000, commissionRate: 5, amountExpected: 225000, amountReceived: 0, status: 'PENDING', createdAt: '2024-05-20' },
];

const MOCK_PAYMENTS: CommissionPayment[] = [
  { id: 'p1', commissionId: 'c1', amount: 105000, dueDate: '2024-05-15', receivedAt: '2024-05-15', status: 'RECEIVED', method: 'TED' },
  { id: 'p2', commissionId: 'c1', amount: 105000, dueDate: '2024-06-15', status: 'DUE' },
  { id: 'p3', commissionId: 'c3', amount: 225000, dueDate: '2024-05-25', status: 'OVERDUE' },
];

const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', category: 'ADS', description: 'Meta Ads - Campanha Luxo', amount: 1200, date: '2024-05-05' },
  { id: 'e2', category: 'FUEL', description: 'Visitas Ponta Negra', amount: 450, date: '2024-05-12' },
  { id: 'e3', category: 'TOOLS', description: 'Assinatura CRM', amount: 199, date: '2024-05-01' },
];

const MOCK_GOAL: MonthlyGoal = { id: 'g1', month: '2024-05', goalCommission: 250000, goalDeals: 4 };

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'expenses' | 'goals'>('overview');
  const [commissions, setCommissions] = useState<Commission[]>(MOCK_COMMISSIONS);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  // Estado do formulário de novo gasto
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'OTHER' as ExpenseCategory,
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const stats = useMemo(() => {
    const received = commissions.reduce((acc, c) => acc + c.amountReceived, 0);
    const expected = commissions.reduce((acc, c) => acc + c.amountExpected, 0);
    const pending = expected - received;
    const spent = expenses.reduce((acc, e) => acc + e.amount, 0);
    const profit = received - spent;
    
    const dayOfMonth = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const projection = (received / dayOfMonth) * daysInMonth;

    return { received, expected, pending, spent, profit, projection };
  }, [commissions, expenses]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) {
      alert("Por favor, preencha a descrição e o valor.");
      return;
    }

    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: newExpense.description,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date
    };

    setExpenses([expense, ...expenses]);
    setIsExpenseModalOpen(false);
    
    // Resetar formulário
    setNewExpense({
      description: '',
      category: 'OTHER',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <AdminLayout activeTab="finance">
      <header className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-dark-accent">Fluxo de Caixa</h1>
            <p className="text-gray-500 text-sm">Controle de comissões, gastos e lucro real.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-primary text-black px-6 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-primary/20 transition-active flex items-center gap-2 uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm font-bold">add_shopping_cart</span>
              Novo Gasto
            </button>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full md:w-max overflow-x-auto hide-scrollbar">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'commissions', label: 'Comissões' },
            { id: 'expenses', label: 'Gastos' },
            { id: 'goals', label: 'Metas' }
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
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Recebido (Mês)', val: formatCurrency(stats.received), icon: 'payments', color: 'text-green-500' },
                 { label: 'Previsto (Total)', val: formatCurrency(stats.expected), icon: 'schedule', color: 'text-blue-500' },
                 { label: 'Gastos (Mês)', val: formatCurrency(stats.spent), icon: 'trending_down', color: 'text-red-500' },
                 { label: 'Lucro Real', val: formatCurrency(stats.profit), icon: 'account_balance_wallet', color: 'text-primary' },
               ].map(kpi => (
                 <div key={kpi.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <span className={`material-symbols-outlined ${kpi.color} mb-2`}>{kpi.icon}</span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
                    <p className="text-lg font-black text-dark-accent truncate">{kpi.val}</p>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Velocímetro da Meta */}
               <section className="bg-dark-accent p-8 rounded-[32px] text-white relative overflow-hidden">
                  <h3 className="font-black text-lg mb-6">Desempenho da Meta</h3>
                  <div className="relative z-10 flex flex-col items-center justify-center py-4">
                     <div className="text-center">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[2px] mb-2">Meta: {formatCurrency(MOCK_GOAL.goalCommission)}</p>
                        <h4 className="text-5xl font-black">{Math.round((stats.received / MOCK_GOAL.goalCommission) * 100)}%</h4>
                        <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">Atingido do Objetivo Mensal</p>
                     </div>
                     
                     <div className="w-full mt-8 space-y-4">
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                           <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${(stats.received / MOCK_GOAL.goalCommission) * 100}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                           <span>Projeção: <span className="text-white">{formatCurrency(stats.projection)}</span></span>
                           <span className={stats.projection >= MOCK_GOAL.goalCommission ? 'text-green-400' : 'text-amber-400'}>
                             {stats.projection >= MOCK_GOAL.goalCommission ? 'Tendência: META BATIDA' : 'Tendência: ABAIXO'}
                           </span>
                        </div>
                     </div>
                  </div>
                  <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[150px] text-white/5 rotate-12">insights</span>
               </section>

               {/* Próximos Recebimentos */}
               <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <h3 className="font-black text-lg mb-6 text-dark-accent">Cronograma de Recebimentos</h3>
                  <div className="space-y-4">
                     {MOCK_PAYMENTS.map(payment => (
                       <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-4">
                             <div className={`size-10 rounded-xl flex items-center justify-center font-black text-xs ${
                               payment.status === 'RECEIVED' ? 'bg-green-50 text-green-600' : 
                               payment.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                             }`}>
                                {payment.dueDate.split('-')[2]}
                             </div>
                             <div>
                                <p className="text-sm font-black text-dark-accent">{formatCurrency(payment.amount)}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Vencimento: {new Date(payment.dueDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                             payment.status === 'RECEIVED' ? 'bg-green-100 text-green-600' : 
                             payment.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {payment.status}
                          </span>
                       </div>
                     ))}
                  </div>
               </section>
            </div>
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Negócio / Lead</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Valor Venda</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Previsto</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Recebido</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {commissions.map(c => (
                     <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                           <p className="font-black text-dark-accent text-sm leading-none mb-1">{c.leadName}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Cód: {c.propertyCode}</p>
                        </td>
                        <td className="px-6 py-5 font-bold text-xs">{formatCurrency(c.dealValue)}</td>
                        <td className="px-6 py-5 text-center font-black text-dark-accent text-sm">{formatCurrency(c.amountExpected)}</td>
                        <td className="px-6 py-5 text-center font-black text-green-500 text-sm">{formatCurrency(c.amountReceived)}</td>
                        <td className="px-6 py-5 text-right">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                             c.status === 'RECEIVED' ? 'bg-green-50 text-green-600' : 
                             c.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-gray-400'
                           }`}>
                              {c.status}
                           </span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Marketing & Ads', val: expenses.filter(e => e.category === 'ADS' || e.category === 'TRAFFIC').reduce((a, b) => a + b.amount, 0), icon: 'ads_click' },
                  { label: 'Logística & Fuel', val: expenses.filter(e => e.category === 'TRANSPORT' || e.category === 'FUEL').reduce((a, b) => a + b.amount, 0), icon: 'local_gas_station' },
                  { label: 'Software & Taxas', val: expenses.filter(e => e.category === 'TOOLS' || e.category === 'OTHER').reduce((a, b) => a + b.amount, 0), icon: 'hub' },
                ].map(cat => (
                  <div key={cat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                     <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined font-bold">{cat.icon}</span>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">{cat.label}</p>
                        <p className="text-xl font-black text-dark-accent">{formatCurrency(cat.val)}</p>
                     </div>
                  </div>
                ))}
             </div>

             <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                         <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Descrição da Despesa</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Categoria</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Data</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Valor</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {expenses.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-5 font-black text-dark-accent text-sm">{e.description}</td>
                           <td className="px-6 py-5">
                              <span className="text-[9px] font-black bg-slate-100 text-gray-400 px-2 py-1 rounded-full uppercase tracking-widest">{e.category}</span>
                           </td>
                           <td className="px-6 py-5 text-center text-xs font-bold text-gray-400">{new Date(e.date).toLocaleDateString()}</td>
                           <td className="px-6 py-5 text-right font-black text-red-500 text-sm">{formatCurrency(e.amount)}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
             <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8 text-center">
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                   <span className="material-symbols-outlined text-4xl font-bold">flag</span>
                </div>
                <div>
                   <h3 className="text-2xl font-black text-dark-accent">Configurar Objetivos</h3>
                   <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2 font-medium">Sua meta de comissões define o ritmo de suas campanhas de tráfego.</p>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Meta Financeira (R$)</label>
                      <input 
                         type="number"
                         className="w-full bg-gray-50 border-none rounded-2xl p-6 text-2xl font-black text-center text-dark-accent focus:ring-4 focus:ring-primary/10" 
                         defaultValue={MOCK_GOAL.goalCommission} 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Meta de Vendas</label>
                         <input type="number" className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-center" defaultValue={MOCK_GOAL.goalDeals} />
                      </div>
                      <div className="space-y-1 text-left">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Meta de Visitas</label>
                         <input type="number" className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-center" placeholder="15" />
                      </div>
                   </div>
                </div>

                <div className="pt-6">
                   <button className="w-full bg-dark-accent text-white h-16 rounded-2xl font-black text-sm transition-active shadow-xl shadow-black/10 hover:bg-primary hover:text-black">
                      Salvar Objetivos
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Modal de Novo Gasto */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsExpenseModalOpen(false)}></div>
           <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up">
              <header className="p-8 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-black text-dark-accent">Novo Gasto Operacional</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Controle suas despesas fixas e variáveis.</p>
                 </div>
                 <button onClick={() => setIsExpenseModalOpen(false)} className="size-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </header>

              <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Descrição</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                      placeholder="Ex: Anúncio Meta - Mansão Riviera"
                      value={newExpense.description}
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Valor (R$)</label>
                       <input 
                         type="number" 
                         step="0.01"
                         required
                         className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-dark-accent focus:ring-2 focus:ring-primary/20"
                         placeholder="0,00"
                         value={newExpense.amount}
                         onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Categoria</label>
                       <select 
                         className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                         value={newExpense.category}
                         onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                       >
                          <option value="ADS">Anúncios / Ads</option>
                          <option value="FUEL">Combustível</option>
                          <option value="TRAFFIC">Tráfego Pago</option>
                          <option value="TRANSPORT">Transporte / Uber</option>
                          <option value="TOOLS">Ferramentas / Software</option>
                          <option value="PHOTOGRAPHY">Fotografia / Drone</option>
                          <option value="OTHER">Outros</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Data</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold"
                      value={newExpense.date}
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                    />
                 </div>

                 <div className="pt-4">
                    <button type="submit" className="w-full bg-primary text-black h-16 rounded-2xl font-black shadow-xl shadow-primary/20 transition-active uppercase tracking-widest text-[10px]">
                       Confirmar Gasto
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Finance;
