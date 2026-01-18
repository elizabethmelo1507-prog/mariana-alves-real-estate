import React from 'react';
import LiveSiteContent from './LiveSiteContent';

interface SitePreviewProps {
    config: {
        brandColor: string;
        backgroundColor: string;
        logoUrl?: string;
        title: string;
        description: string;
        template: 'Minimalista' | 'Luxo' | 'Foco em Leads';
        regions: string;
        subdomain: string;
        sections: Array<{ id: string; label: string; enabled: boolean; fixed?: boolean }>;
        formFields: Array<{ id: string; label: string; enabled: boolean; required: boolean }>;
    };
    viewMode: 'desktop' | 'mobile';
}

const SitePreview: React.FC<SitePreviewProps> = ({ config, viewMode }) => {
    const isMobile = viewMode === 'mobile';
    const bgColor = config.backgroundColor;

    return (
        <div
            className={`bg-white overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border-[8px] border-gray-900 mx-auto ${isMobile ? 'w-[320px] h-[640px] rounded-[40px]' : 'w-full h-[600px] rounded-xl'
                }`}
            style={{ backgroundColor: bgColor }}
        >
            {/* Fake Browser Bar for Desktop */}
            {!isMobile && (
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2 shrink-0">
                    <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-red-400"></div>
                        <div className="size-3 rounded-full bg-yellow-400"></div>
                        <div className="size-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center font-mono">
                        brokerlink.netlify.app/s/{config.subdomain || 'seu-site'}
                    </div>
                </div>
            )}

            {/* Mobile Status Bar */}
            {isMobile && (
                <div className="h-8 bg-black text-white flex justify-between items-center px-6 text-[10px] font-bold shrink-0">
                    <span>9:41</span>
                    <div className="flex gap-1">
                        <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                        <span className="material-symbols-outlined text-[14px]">wifi</span>
                        <span className="material-symbols-outlined text-[14px]">battery_full</span>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <div className="h-[calc(100%-32px)] md:h-[calc(100%-40px)] overflow-hidden">
                <LiveSiteContent config={config} />
            </div>
        </div>
    );
};

export default SitePreview;
