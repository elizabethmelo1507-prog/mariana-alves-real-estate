
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, sendLeadToWebhook } from '../../lib/supabase';

const Simulation: React.FC = () => {
  const navigate = useNavigate();
  const [propertyValue, setPropertyValue] = useState<string>('850000');
  const [downPayment, setDownPayment] = useState<string>('170000');
  const [years, setYears] = useState<string>('30');
  const [isCalculated, setIsCalculated] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLeadSubmit = async () => {
    if (!name || !phone) {
      alert('Por favor, preencha seu nome e telefone.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('leads').insert([{
        name,
        phone,
        interest_type: 'simulation',
        message: `Simulação: Imóvel ${formatCurrency(parseFloat(propertyValue))}, Entrada ${formatCurrency(parseFloat(downPayment))}, Parcela ${formatCurrency(result)}`,
        status: 'Novo'
      }]);

      if (error) throw error;

      await sendLeadToWebhook(name, `Simulação de Crédito - Parcela: ${formatCurrency(result)}`, phone);

      alert('Dados enviados com sucesso! Entraremos em contato em breve.');
      navigate('/');
    } catch (error) {
      console.error('Error saving simulation lead:', error);
      alert('Erro ao enviar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const result = useMemo(() => {
    const pv = parseFloat(propertyValue) || 0;
    const dp = parseFloat(downPayment) || 0;
    const y = parseFloat(years) || 1;
    const loanAmount = pv - dp;
    if (loanAmount <= 0) return 0;

    // Simplified amortization (SAC/Price average estimate)
    // Monthly interest approx 0.8%
    const monthlyRate = 0.008;
    const n = y * 12;
    const pmt = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
    return pmt;
  }, [propertyValue, downPayment, years]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="font-extrabold tracking-tight text-lg">Simulação de Crédito</h1>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col lg:flex-row">

          {/* Left Side - Info & Inputs */}
          <div className="p-8 md:p-12 lg:w-1/2 flex flex-col justify-center">
            <header className="mb-10">
              <div className="inline-flex items-center justify-center bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest">Simulador Rápido</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-6 text-dark-accent">
                Planeje sua <br />próxima conquista.
              </h2>
              <p className="text-gray-500 leading-relaxed text-lg max-w-md">
                Descubra o valor das suas parcelas e o potencial de financiamento em poucos minutos com nossas taxas exclusivas.
              </p>
            </header>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Valor do Imóvel</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 group-focus-within:text-primary transition-colors">R$</span>
                  <input
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 h-16 pl-12 pr-4 rounded-2xl font-bold text-lg focus:border-primary focus:ring-0 transition-colors outline-none"
                    placeholder="0,00"
                    type="number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Valor da Entrada</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 group-focus-within:text-primary transition-colors">R$</span>
                  <input
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 h-16 pl-12 pr-4 rounded-2xl font-bold text-lg focus:border-primary focus:ring-0 transition-colors outline-none"
                    placeholder="0,00"
                    type="number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Prazo (Anos)</label>
                <input
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 h-16 px-6 rounded-2xl font-bold text-lg focus:border-primary focus:ring-0 transition-colors outline-none"
                  placeholder="30"
                  type="number"
                />
              </div>

              <button
                onClick={() => setIsCalculated(true)}
                className="w-full bg-dark-accent text-white font-black h-16 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10 mt-4"
              >
                Calcular Parcelas
              </button>
            </div>
          </div>

          {/* Right Side - Results */}
          <div className="lg:w-1/2 bg-slate-50 p-8 md:p-12 flex flex-col justify-center border-l border-gray-100">
            {isCalculated ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-xl border border-gray-100 text-center mb-8">
                  <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Parcela mensal estimada</p>
                  <h3 className="text-5xl md:text-6xl font-black text-primary tracking-tighter mb-2">
                    {formatCurrency(result)}
                  </h3>
                  <p className="text-xs text-gray-400 italic">
                    *Cálculo baseado em taxa média de 9.5% a.a.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="font-black text-xl mb-2 text-dark-accent">Gostou da simulação?</h4>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">Receba uma análise de crédito detalhada e personalizada para o seu perfil.</p>
                  </div>

                  <div className="space-y-3">
                    <input
                      className="w-full bg-white border-2 border-gray-200 h-14 px-6 rounded-2xl font-bold focus:border-primary focus:ring-0 outline-none transition-colors"
                      placeholder="Seu nome completo"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      className="w-full bg-white border-2 border-gray-200 h-14 px-6 rounded-2xl font-bold focus:border-primary focus:ring-0 outline-none transition-colors"
                      placeholder="WhatsApp"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleLeadSubmit}
                    disabled={loading}
                    className="w-full bg-primary text-black font-black h-16 rounded-2xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined font-bold">verified</span>
                        Aprovar meu crédito agora
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4 opacity-50">
                <span className="material-symbols-outlined text-6xl">calculate</span>
                <p className="font-bold max-w-xs">Preencha os dados ao lado para visualizar sua simulação.</p>
              </div>
            )}

            <div className="mt-12 flex gap-4 justify-center">
              {['Bradesco', 'Itaú', 'Santander', 'Caixa'].map(bank => (
                <div key={bank} className="px-4 py-2 bg-white rounded-lg font-bold text-xs text-gray-300 border border-gray-100 select-none">
                  {bank}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
