
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase environment variables. The app will not function correctly.');
}

// Initialize with fallback to prevent immediate crash, but calls will fail
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

const getSetting = async (key: string, defaultValue: string): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error || !data) return defaultValue;
        return data.value;
    } catch {
        return defaultValue;
    }
};

export const sendLeadToWebhook = async (leadName: string, propertyTitle: string, phone: string) => {
    try {
        const url = await getSetting('webhook_new_lead', 'https://dancingshrimp-n8n.cloudfy.live/webhook/b6dc27ac-b215-4a81-8132-f98d0cec0ae2');
        const cleanPhone = phone.replace(/\D/g, '');
        const whatsappLink = `https://wa.me/55${cleanPhone}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: 'new_lead',
                lead_name: leadName,
                property: propertyTitle,
                phone: phone,
                whatsapp_link: whatsappLink,
                broker_name: "Mariana Alves",
                broker_phone: "5592982031507",
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            console.error(`Webhook error (${response.status}):`, await response.text());
        }
    } catch (error) {
        console.error('Error sending lead to webhook:', error);
    }
};

export const sendVisitRequestToWebhook = async (leadName: string, propertyTitle: string, visitDate: string, visitTime: string, phone: string) => {
    try {
        const url = await getSetting('webhook_new_visit', 'https://dancingshrimp-n8n.cloudfy.live/webhook/894eb000-b2b5-404e-a946-53cbbd041f27');
        const cleanPhone = phone.replace(/\D/g, '');
        const whatsappLink = `https://wa.me/55${cleanPhone}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: 'new_visit_request',
                lead_name: leadName,
                property: propertyTitle,
                visit_date: visitDate,
                visit_time: visitTime,
                phone: phone,
                whatsapp_link: whatsappLink,
                broker_name: "Mariana Alves",
                broker_phone: "5592982031507",
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            console.error(`Visits Webhook error (${response.status}):`, await response.text());
        } else {
            console.log('Visits Webhook sent successfully');
        }
    } catch (error) {
        console.error('Error sending visit request to webhook:', error);
    }
};

export const sendEvaluationRequestToWebhook = async (formData: any) => {
    try {
        const url = await getSetting('webhook_new_evaluation', 'https://dancingshrimp-n8n.cloudfy.live/webhook/06319c8b-70d3-4baa-a5df-5b20802a3c93');
        const cleanPhone = formData.phone.replace(/\D/g, '');
        const whatsappLink = `https://wa.me/55${cleanPhone}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: 'new_evaluation_request',
                ...formData,
                whatsapp_link: whatsappLink,
                broker_name: "Mariana Alves",
                broker_phone: "5592982031507",
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            console.error(`Evaluation Webhook error (${response.status}):`, await response.text());
        } else {
            console.log('Evaluation Webhook sent successfully');
        }
    } catch (error) {
        console.error('Error sending evaluation request to webhook:', error);
    }
};

export const sendVisitReminderToWebhook = async (visitData: any) => {
    try {
        const url = await getSetting('webhook_reminder', 'https://dancingshrimp-n8n.cloudfy.live/webhook/3b1e327e-e2b2-4ad7-8a70-1ecfda873ed9');
        const cleanPhone = visitData.lead_phone.replace(/\D/g, '');
        const whatsappLink = `https://wa.me/55${cleanPhone}`;

        const followUpMessage = `Olá ${visitData.lead_name}! Confirmando nossa visita amanhã às ${visitData.visit_time} no imóvel ${visitData.property_title}. Nos vemos lá!`;
        const encodedMessage = encodeURIComponent(followUpMessage);
        const brokerToLeadWhatsappLink = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: 'visit_reminder_24h',
                ...visitData,
                whatsapp_link: whatsappLink,
                broker_to_lead_whatsapp_link: brokerToLeadWhatsappLink,
                follow_up_message: followUpMessage,
                broker_name: "Mariana Alves",
                broker_phone: "5592982031507",
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Webhook error (${response.status}):`, errorText);
            throw new Error(`Webhook failed with status ${response.status}`);
        }

        console.log('Webhook sent successfully');
    } catch (error) {
        console.error('Error sending visit reminder to webhook:', error);
        throw error;
    }
};

export const sendAutomationShortcutToWebhook = async (lead: any, templateName: string, message: string) => {
    try {
        const url = await getSetting('webhook_automation', 'https://dancingshrimp-n8n.cloudfy.live/webhook/25f6fe71-fde6-4adc-8b23-8297c58d3550');
        const cleanPhone = lead.phone.replace(/\D/g, '');
        const whatsappLink = `https://wa.me/55${cleanPhone}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: 'automation_shortcut_trigger',
                template_name: templateName,
                lead_id: lead.id,
                lead_name: lead.name,
                lead_phone: lead.phone,
                message: message,
                whatsapp_link: whatsappLink,
                broker_name: "Mariana Alves",
                broker_phone: "5592982031507",
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            throw new Error(`Webhook failed with status ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error sending automation shortcut to webhook:', error);
        throw error;
    }
};
