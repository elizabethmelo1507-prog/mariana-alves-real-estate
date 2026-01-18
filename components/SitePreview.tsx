import React from 'react';

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
        sections: Record<string, boolean>;
        formFields: Record<string, boolean>;
    };
    viewMode: 'desktop' | 'mobile';
}

const SitePreview: React.FC<SitePreviewProps> = ({ config, viewMode }) => {
    const isMobile = viewMode === 'mobile';

    // Dynamic styles based on config
    const primaryColor = config.brandColor;
    const bgColor = config.backgroundColor;
    const textColor = bgColor === '#ffffff' ? '#1a1a1a' : '#ffffff';
    const secondaryTextColor = bgColor === '#ffffff' ? '#6b7280' : '#9ca3af';

    return (
        <div
            className={`bg-white overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border-[8px] border-gray-900 mx-auto ${isMobile ? 'w-[320px] h-[640px] rounded-[40px]' : 'w-full h-[600px] rounded-xl'
                }`}
            style={{ backgroundColor: bgColor }}
        >
            {/* Fake Browser Bar for Desktop */}
            {!isMobile && (
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-red-400"></div>
                        <div className="size-3 rounded-full bg-yellow-400"></div>
                        <div className="size-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center font-mono">
                        {config.subdomain || 'seu-site'}.brokerlink.com
                    </div>
                </div>
            )}

            {/* Mobile Status Bar */}
            {isMobile && (
                <div className="h-8 bg-black text-white flex justify-between items-center px-6 text-[10px] font-bold">
                    <span>9:41</span>
                    <div className="flex gap-1">
                        <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                        <span className="material-symbols-outlined text-[14px]">wifi</span>
                        <span className="material-symbols-outlined text-[14px]">battery_full</span>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <div className="h-full overflow-y-auto hide-scrollbar relative">

                {/* Navbar */}
                <nav className={`sticky top-0 z-10 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100/10`} style={{ backgroundColor: `${bgColor}cc` }}>
                    <div className="flex items-center gap-2">
                        {config.logoUrl ? (
                            <img src={config.logoUrl} className="h-8 w-auto object-contain" alt="Logo" />
                        ) : (
                            <div className="size-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: primaryColor }}>
                                <span className="material-symbols-outlined text-white text-sm">home</span>
                            </div>
                        )}
                        {!isMobile && <span className="font-bold text-sm" style={{ color: textColor }}>{config.title}</span>}
                    </div>
                    <div className="flex gap-2">
                        {!isMobile && (
                            <>
                                <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                                <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                            </>
                        )}
                        <div className="h-8 px-3 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: primaryColor, color: '#000' }}>
                            Contato
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="p-6 md:p-12 flex flex-col items-center text-center">
                    {config.template === 'Luxo' && (
                        <div className="w-full h-32 md:h-48 bg-gray-200 rounded-2xl mb-6 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-4">
                                <p className="text-white text-xs font-bold uppercase tracking-widest">Alto Padrão</p>
                            </div>
                        </div>
                    )}

                    <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                        {config.regions}
                    </div>

                    <h1 className="text-2xl md:text-4xl font-black leading-tight mb-4" style={{ color: textColor }}>
                        {config.title}
                    </h1>

                    <p className="text-sm md:text-base mb-8 max-w-md mx-auto" style={{ color: secondaryTextColor }}>
                        {config.description}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button className="w-full py-3 rounded-xl font-bold text-sm shadow-lg" style={{ backgroundColor: primaryColor, color: '#000' }}>
                            Ver Catálogo
                        </button>
                    </div>
                </div>

                {/* Sections */}
                <div className="px-6 pb-12 space-y-8">

                    {/* Quick Actions / Services */}
                    {config.sections['Serviços Exclusivos'] && (
                        <div>
                            <h3 className="font-bold mb-3" style={{ color: textColor }}>Serviços</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-square rounded-2xl p-3 flex flex-col justify-between border border-gray-100" style={{ backgroundColor: i === 1 ? primaryColor : `${bgColor}f0` }}>
                                        <div className="size-8 rounded-full bg-white/20"></div>
                                        <div className="h-2 w-12 bg-current opacity-20 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Testimonials */}
                    {config.sections['Depoimentos'] && (
                        <div>
                            <h3 className="font-bold mb-3" style={{ color: textColor }}>O que dizem</h3>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="flex gap-1 text-yellow-400 mb-2">
                                    {'★★★★★'.split('').map(s => <span key={Math.random()}>{s}</span>)}
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full mb-2"></div>
                                <div className="h-2 w-2/3 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                    )}

                    {/* Contact Form */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="font-bold mb-4 text-gray-900">Fale Comigo</h3>
                        <div className="space-y-3">
                            {config.formFields['Nome'] && <div className="h-10 bg-white border border-gray-200 rounded-lg w-full"></div>}
                            {config.formFields['E-mail'] && <div className="h-10 bg-white border border-gray-200 rounded-lg w-full"></div>}
                            {config.formFields['Telefone'] && <div className="h-10 bg-white border border-gray-200 rounded-lg w-full"></div>}
                            {config.formFields['Mensagem'] && <div className="h-20 bg-white border border-gray-200 rounded-lg w-full"></div>}
                            <button className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: primaryColor, color: '#000' }}>Enviar Mensagem</button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default SitePreview;
