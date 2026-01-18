import React, { useState } from 'react';
import { supabase, sendLeadToWebhook } from '../lib/supabase';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: {
        id?: string;
        code: string;
        title: string;
        neighborhood: string;
    };
}

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose, property }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;

        setIsSubmitting(true);

        try {
            // Save lead to database
            const { data, error } = await supabase.from('leads').insert([{
                name: name.trim(),
                phone: phone.trim(),
                property_code: property.code,
                property_id: property.id,
                status: 'Novo',
                timestamp: new Date().toISOString(),
                created_at: new Date().toISOString(),
                last_contact_at: new Date().toISOString()
            }]).select();

            if (error) {
                console.error('Error saving lead:', error);
                alert('⚠️ Erro ao salvar no sistema: ' + error.message + '\nMas você ainda pode enviar a mensagem.');
            } else {
                console.log('Lead saved successfully:', data);
                // Send to Webhook
                sendLeadToWebhook(name.trim(), property.title, phone.trim());
            }

            // Increment WhatsApp clicks
            if (property.id) {
                await supabase.rpc('increment_whatsapp_clicks', { property_id: property.id });
            }

            // Create personalized WhatsApp message (without phone number)
            const message = `Olá Mariana, eu me chamo ${name} e tenho interesse no imóvel ${property.title} (Cód: ${property.code}) localizado em ${property.neighborhood}. Gostaria de saber mais informações!`;

            // Open WhatsApp
            window.open(`https://wa.me/5592982031507?text=${encodeURIComponent(message)}`, '_blank');

            // Close modal and reset
            onClose();
            setName('');
            setPhone('');
        } catch (error) {
            console.error('Error:', error);
            alert('Ocorreu um erro. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative animate-scale-up">
                <header className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-dark-accent">Falar no WhatsApp</h3>
                            <p className="text-xs text-gray-500 font-bold mt-1">{property.code} • {property.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-2xl bg-green-500 text-white flex items-center justify-center">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <div>
                                <h4 className="font-black text-dark-accent">Qual é o seu nome?</h4>
                                <p className="text-xs text-gray-500">Vamos personalizar sua mensagem</p>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Digite seu nome completo"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none mb-4"
                            autoFocus
                            required
                        />

                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center">
                                <span className="material-symbols-outlined">phone</span>
                            </div>
                            <div>
                                <h4 className="font-black text-dark-accent">Qual é o seu telefone?</h4>
                                <p className="text-xs text-gray-500">Para contato futuro (não aparece na mensagem)</p>
                            </div>
                        </div>

                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(92) 99999-9999"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>

                    {name.trim() && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6 animate-fade-in">
                            <p className="text-xs font-bold text-blue-600 mb-2">📱 Prévia da mensagem:</p>
                            <p className="text-xs text-gray-700 italic leading-relaxed">
                                "Olá Mariana, eu me chamo <strong>{name}</strong> e tenho interesse no imóvel{' '}
                                <strong>{property.title}</strong> (Cód: {property.code}) localizado em{' '}
                                <strong>{property.neighborhood}</strong>. Gostaria de saber mais informações!"
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-600 h-14 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || !phone.trim() || isSubmitting}
                            className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-14 rounded-2xl font-black text-sm transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">chat</span>
                                    Abrir WhatsApp
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeadCaptureModal;
