import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LiveSiteContent from '../../components/LiveSiteContent';

const UserSite: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSiteConfig = async () => {
            if (!slug) return;

            try {
                const { data, error } = await supabase
                    .from('site_configs')
                    .select('config')
                    .eq('slug', slug)
                    .single();

                if (error) throw error;

                if (data) {
                    setConfig(data.config);
                } else {
                    setError('Site não encontrado');
                }
            } catch (err) {
                console.error('Error fetching site config:', err);
                setError('Site não encontrado ou erro ao carregar.');
            } finally {
                setLoading(false);
            }
        };

        fetchSiteConfig();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">link_off</span>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Site não encontrado</h1>
                <p className="text-gray-500 max-w-md">
                    O endereço que você tentou acessar não existe ou foi removido. Verifique o link e tente novamente.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <LiveSiteContent config={config} />
        </div>
    );
};

export default UserSite;
