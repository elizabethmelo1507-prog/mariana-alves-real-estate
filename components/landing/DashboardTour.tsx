import React from 'react';
import { cn } from '../../lib/utils';
import { BlurFade } from '../ui/blur-fade';

const modules = [
    {
        title: 'Central de Imóveis',
        subtitle: 'Catálogo + Saúde do anúncio',
        icon: 'apartment',
        result: 'Catálogo sempre atualizado + você sabe quais imóveis estão “morrendo” e precisam de ação.'
    },
    {
        title: 'Leads & CRM',
        subtitle: 'Funil de fechamento',
        icon: 'filter_alt',
        result: 'Acabou “lead perdido no WhatsApp”.'
    },
    {
        title: 'Automação Inteligente',
        subtitle: 'Sem ser robô chato',
        icon: 'smart_toy',
        result: 'Resposta rápida + follow-up consistente = mais visitas e fechamentos.'
    },
    {
        title: 'Agenda de Guerra',
        subtitle: 'Visitas',
        icon: 'calendar_clock',
        result: 'Menos furos, menos caos e mais produtividade.'
    },
    {
        title: 'Propostas & Negociação',
        subtitle: 'O coração do dinheiro',
        icon: 'handshake',
        result: 'Negociação organizada e controle total do que está “perto de fechar”.'
    },
    {
        title: 'Documentos & Checklist',
        subtitle: 'Compra e Aluguel',
        icon: 'description',
        result: 'Menos enrolação e fechamento mais rápido.'
    },
    {
        title: 'Prioridades',
        subtitle: 'Top 5 do dia',
        icon: 'priority_high',
        result: 'Você faz o que dá dinheiro primeiro.'
    },
    {
        title: 'Financeiro',
        subtitle: 'Simples e poderoso',
        icon: 'attach_money',
        result: 'Controle real do lucro e do ritmo de vendas.'
    },
    {
        title: 'Reativação 1-clique',
        subtitle: 'Dinheiro na gaveta',
        icon: 'restore_from_trash',
        result: 'Recupera oportunidades esquecidas.'
    }
];

export function DashboardTour() {
    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <BlurFade delay={0.2} inView={true}>
                        <h2 className="text-3xl md:text-4xl font-black text-dark-accent mb-4">
                            Touro Guiado do Dashboard
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                            Tudo o que vem no <span className="text-primary font-bold">BrokerPilot</span>
                        </p>
                    </BlurFade>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 max-w-7xl mx-auto">
                    {modules.map((module, index) => (
                        <Feature key={module.title} {...module} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

const Feature = ({
    title,
    subtitle,
    result,
    icon,
    index,
}: {
    title: string;
    subtitle: string;
    result: string;
    icon: string;
    index: number;
}) => {
    return (
        <div
            className={cn(
                "flex flex-col lg:border-r py-10 relative group/feature border-gray-200",
                (index % 3 === 0) && "lg:border-l border-gray-200",
                (index < 6) && "lg:border-b border-gray-200"
            )}
        >
            {/* Hover Gradients */}
            <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-green-50 to-transparent pointer-events-none" />

            <div className="mb-4 relative z-10 px-10 text-primary">
                <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                </div>
            </div>

            <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-gray-300 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-dark-accent">
                    {title}
                </span>
            </div>

            <p className="text-sm text-gray-500 max-w-xs relative z-10 px-10 font-bold mb-1">
                {subtitle}
            </p>
            <p className="text-sm text-gray-400 max-w-xs relative z-10 px-10 leading-relaxed">
                {result}
            </p>
        </div>
    );
};
