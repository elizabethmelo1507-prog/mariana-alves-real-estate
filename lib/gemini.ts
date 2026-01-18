
const API_KEY = "AIzaSyAJS_HtF5Qn8jaGpLsuKpKL7oFNpZRF6zc";

export const getGeminiModel = (modelName: string = "gemini-2.0-flash") => {
    return {
        generateContent: async (prompt: string) => {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt,
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                const message = error.error?.message || "Erro desconhecido na API";

                if (error.error?.status === "RESOURCE_EXHAUSTED") {
                    throw new Error("Cota de uso da IA esgotada. Por favor, aguarde alguns minutos ou faça upgrade da sua chave API no Google AI Studio.");
                }

                throw new Error(message);
            }

            const data = await response.json();
            return {
                response: {
                    text: () => data.candidates[0].content.parts[0].text,
                },
            };
        },

        generateImage: async (prompt: string) => {
            // Note: Imagen models require billing. Using imagen-3.0-generate-001 or similar.
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        instances: [
                            {
                                prompt: prompt,
                            },
                        ],
                        parameters: {
                            sampleCount: 1,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                const message = error.error?.message || "Erro ao gerar imagem";

                if (message.includes("billed users")) {
                    throw new Error("A geração de imagens requer uma conta com faturamento (billing) ativado no Google Cloud.");
                }

                throw new Error(message);
            }

            const data = await response.json();
            // Imagen returns base64 in predictions[0].bytesBase64Encoded
            const base64Image = data.predictions[0].bytesBase64Encoded;
            return `data:image/png;base64,${base64Image}`;
        }
    };
};
