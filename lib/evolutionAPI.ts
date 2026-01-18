// Evolution API Configuration and Service

interface EvolutionConfig {
    apiUrl: string;
    apiKey: string;
    instanceName: string;
}

interface SendMessageParams {
    number: string;
    message: string;
}

class EvolutionAPIService {
    private config: EvolutionConfig | null = null;

    setConfig(config: EvolutionConfig) {
        this.config = config;
        localStorage.setItem('evolution-config', JSON.stringify(config));
    }

    getConfig(): EvolutionConfig | null {
        if (this.config) return this.config;

        const stored = localStorage.getItem('evolution-config');
        if (stored) {
            this.config = JSON.parse(stored);
            return this.config;
        }

        return null;
    }

    isConfigured(): boolean {
        return this.getConfig() !== null;
    }

    async sendMessage(params: SendMessageParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
        const config = this.getConfig();

        if (!config) {
            return { success: false, error: 'Evolution API não configurada' };
        }

        try {
            const encodedInstance = encodeURIComponent(config.instanceName);
            const response = await fetch(`${config.apiUrl}/message/sendText/${encodedInstance}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': config.apiKey
                },
                body: JSON.stringify({
                    number: params.number.replace(/\D/g, ''), // Remove non-digits
                    text: params.message
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    success: false,
                    error: errorData.message || `Erro HTTP: ${response.status}`
                };
            }

            const data = await response.json();
            return {
                success: true,
                messageId: data.key?.id
            };
        } catch (error: any) {
            console.error('Evolution API Error:', error);
            return {
                success: false,
                error: error.message || 'Erro ao enviar mensagem'
            };
        }
    }

    async sendMediaMessage(params: {
        number: string;
        mediaUrl: string;
        caption?: string;
    }): Promise<{ success: boolean; error?: string }> {
        const config = this.getConfig();

        if (!config) {
            return { success: false, error: 'Evolution API não configurada' };
        }

        try {
            const response = await fetch(`${config.apiUrl}/message/sendMedia/${config.instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': config.apiKey
                },
                body: JSON.stringify({
                    number: params.number.replace(/\D/g, ''),
                    mediaUrl: params.mediaUrl,
                    caption: params.caption
                })
            });

            if (!response.ok) {
                return { success: false, error: `Erro HTTP: ${response.status}` };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async testConnection(): Promise<{ success: boolean; error?: string; instanceData?: any; allInstances?: string[] }> {
        const config = this.getConfig();

        if (!config) {
            return { success: false, error: 'Evolution API não configurada' };
        }

        try {
            const response = await fetch(`${config.apiUrl}/instance/fetchInstances`, {
                method: 'GET',
                headers: {
                    'apikey': config.apiKey
                }
            });

            if (!response.ok) {
                return { success: false, error: `Erro de conexão: ${response.status}` };
            }

            const data = await response.json();

            // Extract all instance names for debugging
            const allInstanceNames = data.map((i: any) => i.instance?.instanceName || i.instanceName).filter(Boolean);

            // Try to find the instance (case-insensitive and trimmed)
            const targetName = config.instanceName.toLowerCase().trim();
            const instance = data.find((i: any) => {
                const name = (i.instance?.instanceName || i.instanceName || '').toLowerCase().trim();
                return name === targetName;
            });

            if (!instance) {
                return {
                    success: false,
                    error: `Instância "${config.instanceName}" não encontrada`,
                    allInstances: allInstanceNames
                };
            }

            return {
                success: true,
                instanceData: instance,
                allInstances: allInstanceNames
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}

export const evolutionAPI = new EvolutionAPIService();
export type { EvolutionConfig, SendMessageParams };
