import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        brandName: '',
        primaryColor: '#00ff88',
        subdomain: '',
        template: 'MINIMAL'
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleFinish();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = () => {
        // Save data to Supabase (Mocked)
        console.log('Saving onboarding data:', formData);
        // Redirect to Dashboard
        navigate('/admin/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-display">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-dark-accent text-sm">real_estate_agent</span>
                        </div>
                        <span className="font-bold text-dark-accent">Configuração Inicial</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Passo {step} de 3
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-100 w-full">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>

                    <div className="p-8 md:p-12">
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Vamos dar uma cara para o seu negócio</h2>
                                    <p className="text-gray-500 mt-2">Escolha o nome da sua marca e a cor principal.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome da sua Marca / Imobiliária</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="Ex: Mariana Alves Imóveis"
                                        value={formData.brandName}
                                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Cor Principal</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            className="h-12 w-12 rounded-lg border-0 p-1 cursor-pointer"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                        />
                                        <span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-md">
                                            {formData.primaryColor}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Seu endereço na internet</h2>
                                    <p className="text-gray-500 mt-2">Escolha como seus clientes vão te encontrar.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Subdomínio Gratuito</label>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            className="flex-1 px-4 py-3 rounded-l-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-right"
                                            placeholder="marianaalves"
                                            value={formData.subdomain}
                                            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                        />
                                        <div className="bg-gray-100 px-4 py-3 rounded-r-xl border border-l-0 border-gray-300 text-gray-500 font-medium">
                                            .brokerlink.com
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Você poderá conectar seu domínio próprio (ex: suaempresa.com.br) depois.</p>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in text-center">
                                <div className="mb-8">
                                    <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Tudo pronto!</h2>
                                    <p className="text-gray-500 mt-2">Seu site já está sendo gerado. Vamos acessar seu painel.</p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200 text-left max-w-sm mx-auto">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="size-10 rounded-full bg-gray-200" style={{ backgroundColor: formData.primaryColor }}></div>
                                        <div>
                                            <p className="font-bold text-gray-900">{formData.brandName || 'Sua Marca'}</p>
                                            <p className="text-xs text-gray-500">{formData.subdomain || 'seusite'}.brokerlink.com</p>
                                        </div>
                                    </div>
                                    <div className="h-24 bg-gray-200 rounded-lg w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t border-gray-100">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Voltar
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-primary text-dark-accent rounded-xl font-bold text-sm hover:bg-green-400 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            {step === 3 ? 'Ir para Dashboard' : 'Continuar'}
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
