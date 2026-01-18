import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { evolutionAPI, EvolutionConfig } from '../../lib/evolutionAPI';

const Settings: React.FC = () => {
    const [config, setConfig] = useState<EvolutionConfig>({
        apiUrl: '',
        apiKey: '',
        instanceName: ''
    });
    const [isConfigured, setIsConfigured] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const existingConfig = evolutionAPI.getConfig();
        if (existingConfig) {
            setConfig(existingConfig);
            setIsConfigured(true);
        }
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        evolutionAPI.setConfig(config);
        setIsConfigured(true);
        setIsSaving(false);
        alert('✅ Configuração salva com sucesso!');
    };

    const handleTest = async () => {
        setIsTesting(true);
        setTestResult(null);

        const result = await evolutionAPI.testConnection();

        if (result.success) {
            setTestResult({
                success: true,
                message: `✅ Conexão estabelecida! Instância: ${result.instanceData?.instance?.instanceName || 'OK'}`
            });
        } else {
            let errorMessage = `❌ Erro: ${result.error}`;

            // If we got a list of instances, show them
            if (result.allInstances && result.allInstances.length > 0) {
                errorMessage += `\n\n📋 Instâncias disponíveis:\n${result.allInstances.map(name => `  • ${name}`).join('\n')}`;
            }

            setTestResult({
                success: false,
                message: errorMessage
            });
        }

        setIsTesting(false);
    };

    return (
        <AdminLayout activeTab="config">
            <div className="p-6 max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-dark-accent mb-2">⚙️ Configurações</h1>
                    <p className="text-gray-500 font-medium">Configure a Evolution API para envio automático de mensagens</p>
                </header>

                <div className="bg-white rounded-[40px] p-8 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">settings_applications</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-dark-accent">Evolution API</h2>
                            <p className="text-sm text-gray-500">Envio automático de mensagens via WhatsApp</p>
                        </div>
                    </div>

                    {isConfigured && (
                        <div className="bg-green-50 border-2 border-green-200 p-4 rounded-2xl mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                            <div>
                                <p className="font-black text-green-600 text-sm">API Configurada</p>
                                <p className="text-xs text-green-600">Mensagens podem ser enviadas automaticamente</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                                URL da API
                            </label>
                            <input
                                type="text"
                                value={config.apiUrl}
                                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                                placeholder="https://sua-evolution-api.com"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-2">Ex: https://evolution.seudominio.com</p>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                                API Key
                            </label>
                            <input
                                type="password"
                                value={config.apiKey}
                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                placeholder="Sua chave de API"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-2">Chave de autenticação da Evolution API</p>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                                Nome da Instância
                            </label>
                            <input
                                type="text"
                                value={config.instanceName}
                                onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
                                placeholder="minha-instancia"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-2">Nome da instância do WhatsApp conectada</p>
                        </div>
                    </div>

                    {testResult && (
                        <div className={`mt-6 p-4 rounded-2xl border-2 ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <p className={`text-sm font-bold ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                                {testResult.message}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={handleTest}
                            disabled={isTesting || !config.apiUrl || !config.apiKey || !config.instanceName}
                            className="flex-1 bg-gray-100 text-gray-700 h-14 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isTesting ? (
                                <>
                                    <div className="size-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                    Testando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">wifi_find</span>
                                    Testar Conexão
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !config.apiUrl || !config.apiKey || !config.instanceName}
                            className="flex-[2] bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-14 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    Salvar Configuração
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 border-2 border-blue-200 p-6 rounded-[32px]">
                    <h3 className="font-black text-blue-600 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">info</span>
                        Como configurar a Evolution API
                    </h3>
                    <ol className="space-y-3 text-sm text-blue-800">
                        <li className="flex gap-3">
                            <span className="font-black">1.</span>
                            <span>Acesse sua instância da Evolution API</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-black">2.</span>
                            <span>Copie a URL base da API (ex: https://evolution.seudominio.com)</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-black">3.</span>
                            <span>Gere ou copie sua API Key nas configurações</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-black">4.</span>
                            <span>Cole o nome da sua instância do WhatsApp</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-black">5.</span>
                            <span>Clique em "Testar Conexão" para verificar</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-black">6.</span>
                            <span>Se tudo estiver ok, clique em "Salvar Configuração"</span>
                        </li>
                    </ol>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
