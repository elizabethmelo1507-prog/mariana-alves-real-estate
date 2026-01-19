import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ContainerScroll } from '../../components/ui/container-scroll-animation';
import { BlurFade } from '../../components/ui/blur-fade';
import { AuroraBackground } from '../../components/ui/aurora-background';

// --- COMPONENTE DE INTRODUÇÃO (SPLASH SCREEN) ---
const IntroScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [textVisible, setTextVisible] = useState(true);
    const [screenVisible, setScreenVisible] = useState(true);

    useEffect(() => {
        const timerText = setTimeout(() => {
            setTextVisible(false);
        }, 3000);

        const timerScreen = setTimeout(() => {
            setScreenVisible(false);
        }, 4000);

        const timerFinish = setTimeout(() => {
            onFinish();
        }, 5500);

        return () => {
            clearTimeout(timerText);
            clearTimeout(timerScreen);
            clearTimeout(timerFinish);
        };
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity ease-in-out duration-[1500ms] ${screenVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <section id="header" className={`flex flex-col items-center text-center transition-opacity duration-1000 ease-in-out ${textVisible ? 'opacity-100' : 'opacity-0'}`}>
                <BlurFade delay={0.25} inView={true}>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-2 text-dark-accent">
                        Corretor,
                    </h2>
                </BlurFade>
                <BlurFade delay={0.5} inView={true}>
                    <span className="text-xl text-pretty tracking-tighter sm:text-3xl xl:text-4xl/none text-gray-600">
                        Já pensou em ter a sua Imobiliária particular? 🤔
                    </span>
                </BlurFade>
            </section>
        </div>
    );
};

const Landing: React.FC = () => {
    const [showIntro, setShowIntro] = useState(true);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">

            {/* Intro Screen */}
            {showIntro && (
                <IntroScreen onFinish={() => setShowIntro(false)} />
            )}

            {/* Navbar */}
            <nav className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-1000 ${!showIntro ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-dark-accent font-bold">domain</span>
                        </div>
                        <span className="font-black text-xl tracking-tight text-dark-accent">Admin MA</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a>
                        <a href="#pricing" className="hover:text-primary transition-colors">Planos</a>
                        <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/admin/login" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">
                            Entrar
                        </Link>
                        <Link
                            to="/signup"
                            className="px-5 py-2.5 bg-primary text-dark-accent rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-green-400 transition-all hover:-translate-y-0.5"
                        >
                            Criar Conta
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <AuroraBackground className="h-auto min-h-screen overflow-hidden">

                <ContainerScroll
                    titleComponent={
                        <div className="relative z-10 text-center mb-10">
                            <BlurFade delay={0.5} inView={!showIntro} duration={1.2}>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
                                    <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Novo Sistema 2.0
                                </div>
                            </BlurFade>

                            <BlurFade delay={0.8} inView={!showIntro} duration={1.2}>
                                <h1 className="text-5xl md:text-7xl font-black text-dark-accent tracking-tight mb-6 leading-tight max-w-5xl mx-auto">
                                    Seu negócio imobiliário 24/7: <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">CRM, Site e Automação</span> em um único lugar.
                                </h1>
                            </BlurFade>

                            <BlurFade delay={1.1} inView={!showIntro} duration={1.2}>
                                <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                                    Pare de perder leads e organize seu funil com o sistema mais completo para corretores de imóveis autônomos e imobiliárias.
                                </p>
                            </BlurFade>

                            <BlurFade delay={1.4} inView={!showIntro} duration={1.2}>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        to="/signup"
                                        className="w-full sm:w-auto px-8 py-4 bg-dark-accent text-white rounded-2xl text-lg font-bold shadow-xl hover:bg-black transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        Criar conta agora
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </Link>
                                    <a
                                        href="#pricing"
                                        className="w-full sm:w-auto px-8 py-4 bg-white text-dark-accent border border-gray-200 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        Ver planos
                                    </a>
                                </div>
                            </BlurFade>
                        </div>
                    }
                >
                    <img
                        src="https://bxnwsdepbjxkhsoucxvn.supabase.co/storage/v1/object/sign/video%20do%20ipad/semlogo-ezgif.com-video-to-webp-converter.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMTU5YTZmNi1lODhhLTRmMTctOGQ0Yi1iODliMmJlZGExYWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlbyBkbyBpcGFkL3NlbWxvZ28tZXpnaWYuY29tLXZpZGVvLXRvLXdlYnAtY29udmVydGVyLndlYnAiLCJpYXQiOjE3Njg3ODM1NDcsImV4cCI6MjA4NDE0MzU0N30.fcixzwVNfS-TETG9AyFVVfdlHl-gUHPqsRHOkAJOf30"
                        alt="Dashboard Animation"
                        className="mx-auto rounded-2xl object-cover h-full w-full object-left-top"
                        draggable={false}
                    />
                </ContainerScroll>
            </AuroraBackground>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-dark-accent mb-4">Como Funciona</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Tudo o que você precisa para vender imóveis – do primeiro contato ao contrato assinado.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: 'web', title: 'Site e Catálogo', desc: 'Crie seu site com catálogo de imóveis em minutos, sem pagar hospedagem.' },
                            { icon: 'filter_list', title: 'CRM e Funil', desc: 'Organize leads, visitas, propostas e fechamentos em um pipeline visual.' },
                            { icon: 'chat', title: 'Automação', desc: 'Templates prontos pós‑contato, pós‑visita, pós‑proposta e reativação.' },
                            { icon: 'calendar_month', title: 'Gestão Completa', desc: 'Agende visitas, controle comissões, despesas e metas em um só lugar.' }
                        ].map((feature, i) => (
                            <BlurFade key={i} delay={0.2 + (i * 0.2)} inView={!showIntro} duration={1}>
                                <div className="btn-liquido group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                        <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-dark-accent mb-3 group-hover:text-black transition-colors relative z-10">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm group-hover:text-gray-900 transition-colors relative z-10">{feature.desc}</p>
                                </div>
                            </BlurFade>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-dark-accent mb-4">Escolha seu plano</h2>
                        <p className="text-gray-500">Comece grátis e evolua conforme suas vendas aumentam.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Basic Plan */}
                        <div className="p-8 rounded-3xl border border-gray-200 bg-white relative">
                            <h3 className="text-xl font-bold text-gray-500 mb-2">Plano Básico</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-dark-accent">R$ 69,90</span>
                                <span className="text-gray-400">/mês</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-8">Ideal para corretores que estão começando a organizar sua carteira.</p>

                            <ul className="space-y-4 mb-8">
                                {[
                                    'Catálogo de imóveis ilimitado',
                                    'Site pronto (template padrão)',
                                    'CRM completo (leads e funil)',
                                    'Automação de mensagens básicas',
                                    'Agenda de visitas',
                                    'Controle financeiro básico',
                                    'Suporte via chat/e-mail'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/signup"
                                className="block w-full py-4 text-center border-2 border-dark-accent text-dark-accent rounded-xl font-bold hover:bg-dark-accent hover:text-white transition-all"
                            >
                                Assinar Básico
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="p-8 rounded-3xl border-2 border-primary bg-gray-900 text-white relative shadow-2xl transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-primary text-dark-accent text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                                Mais Popular
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Plano Pro</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-white">R$ 120,00</span>
                                <span className="text-gray-400">/mês</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-8">Para quem quer escalar vendas com personalização e consultoria.</p>

                            <ul className="space-y-4 mb-8">
                                <li className="font-bold text-white flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-primary text-lg">star</span>
                                    Tudo do Básico, mais:
                                </li>
                                {[
                                    'Personalização de site (Domínio Próprio)',
                                    'Layout Premium Exclusivo',
                                    'Reunião mensal de consultoria',
                                    'Limites maiores de leads/automação',
                                    'Biblioteca de conteúdo premium',
                                    'Suporte prioritário (WhatsApp)'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/signup"
                                className="block w-full py-4 text-center bg-primary text-dark-accent rounded-xl font-bold hover:bg-green-400 transition-all shadow-lg shadow-primary/20"
                            >
                                Assinar Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-dark-accent mb-4">Por que escolher nosso sistema?</h2>
                        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                            <span className="material-symbols-outlined fill-current">star</span>
                            <span className="material-symbols-outlined fill-current">star</span>
                            <span className="material-symbols-outlined fill-current">star</span>
                            <span className="material-symbols-outlined fill-current">star</span>
                            <span className="material-symbols-outlined fill-current">star</span>
                        </div>
                        <p className="text-gray-500 font-bold">+120 corretores satisfeitos</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Carlos Mendes', role: 'Corretor em SP', text: 'A organização do meu dia a dia mudou da água pro vinho. Não perco mais nenhum lead por esquecimento.' },
                            { name: 'Fernanda Lima', role: 'Imobiliária Lima', text: 'O site ficou pronto muito rápido e meus clientes elogiam muito a facilidade de ver os imóveis.' },
                            { name: 'Roberto Souza', role: 'Autônomo', text: 'Fechei 3x mais rápido depois que comecei a usar as automações de mensagem. Recomendo demais!' }
                        ].map((t, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-gray-600 italic mb-6">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-dark-accent text-sm">{t.name}</p>
                                        <p className="text-xs text-gray-400">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-24 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-dark-accent mb-4">Perguntas Frequentes</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: 'Posso cancelar quando quiser?', a: 'Sim! Não temos fidelidade. Você pode cancelar sua assinatura a qualquer momento direto pelo painel.' },
                            { q: 'Preciso pagar hospedagem ou domínio?', a: 'No plano Básico, você usa nosso subdomínio grátis. No Pro, você pode conectar seu domínio próprio (custo do domínio à parte).' },
                            { q: 'Quanto tempo leva para configurar meu site?', a: 'Segundos! Assim que você cria a conta, seu site já está no ar com um modelo padrão. Você só precisa personalizar as cores e infos.' },
                            { q: 'Posso migrar de plano depois?', a: 'Com certeza. Você pode começar no Básico e fazer o upgrade para o Pro quando sentir necessidade.' }
                        ].map((faq, i) => (
                            <div key={i} className="border border-gray-200 rounded-xl p-6 hover:border-primary/50 transition-colors">
                                <h3 className="font-bold text-lg text-dark-accent mb-2">{faq.q}</h3>
                                <p className="text-gray-500">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-dark-accent relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#00ff88_0%,transparent_40%)] opacity-20"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Pare de perder leads hoje mesmo.</h2>
                    <p className="text-xl text-gray-400 mb-10">Experimente a plataforma completa por 7 dias grátis e veja suas vendas aumentarem.</p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-dark-accent rounded-2xl text-xl font-bold shadow-xl shadow-primary/20 hover:bg-white transition-all hover:-translate-y-1"
                    >
                        Criar conta agora
                        <span className="material-symbols-outlined">rocket_launch</span>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-dark-accent text-sm font-bold">domain</span>
                            </div>
                            <span className="font-bold text-white text-lg">Admin MA</span>
                        </div>
                        <p className="text-sm max-w-xs">O sistema definitivo para corretores de imóveis que querem vender mais e trabalhar melhor.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Produto</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-primary">Funcionalidades</a></li>
                            <li><a href="#pricing" className="hover:text-primary">Planos</a></li>
                            <li><Link to="/admin/login" className="hover:text-primary">Login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-primary">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-primary">Privacidade</a></li>
                            <li><a href="#" className="hover:text-primary">Contato</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
                    © 2024 Admin MA. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
