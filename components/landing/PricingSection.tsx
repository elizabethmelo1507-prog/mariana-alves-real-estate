"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
    {
        name: "Básico",
        description:
            "Ideal para corretores que estão começando a organizar sua carteira.",
        price: 69.90,
        yearlyPrice: 699,
        buttonText: "Começar Agora",
        buttonVariant: "outline" as const,
        includes: [
            "Catálogo de imóveis ilimitado",
            "Site pronto (template padrão)",
            "CRM completo (leads e funil)",
            "Automação de mensagens básicas",
            "Agenda de visitas",
            "Controle financeiro básico",
            "Suporte via chat/e-mail",
        ],
    },
    {
        name: "Pro",
        description:
            "Para quem quer escalar vendas com personalização e consultoria.",
        price: 120,
        yearlyPrice: 1200,
        buttonText: "Assinar Pro",
        buttonVariant: "default" as const,
        popular: true,
        includes: [
            "Tudo do Básico, mais:",
            "Personalização de site (Domínio Próprio)",
            "Layout Premium Exclusivo",
            "Reunião mensal de consultoria",
            "Limites maiores de leads/automação",
            "Biblioteca de conteúdo premium",
            "Suporte prioritário (WhatsApp)",
        ],
    },
    {
        name: "Imobiliária",
        description:
            "Plano avançado para gestão de equipes e múltiplos corretores.",
        price: 299,
        yearlyPrice: 2990,
        buttonText: "Falar com Consultor",
        buttonVariant: "outline" as const,
        includes: [
            "Tudo do Pro, mais:",
            "Múltiplos usuários (até 5)",
            "Gestão de equipe e metas",
            "Relatórios avançados de performance",
            "API para integrações",
            "Gerente de conta dedicado",
        ],
    },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
    const [selected, setSelected] = useState("0");

    const handleSwitch = (value: string) => {
        setSelected(value);
        onSwitch(value);
    };

    return (
        <div className="flex justify-center">
            <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
                <button
                    onClick={() => handleSwitch("0")}
                    className={cn(
                        "relative z-10 w-fit h-10  rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
                        selected === "0" ? "text-white" : "text-gray-200",
                    )}
                >
                    {selected === "0" && (
                        <motion.span
                            layoutId={"switch"}
                            className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-green-600 border-green-600 bg-gradient-to-t from-green-500 to-green-600"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative">Mensal</span>
                </button>

                <button
                    onClick={() => handleSwitch("1")}
                    className={cn(
                        "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
                        selected === "1" ? "text-white" : "text-gray-200",
                    )}
                >
                    {selected === "1" && (
                        <motion.span
                            layoutId={"switch"}
                            className="absolute top-0 left-0 h-10 w-full  rounded-full border-4 shadow-sm shadow-green-600 border-green-600 bg-gradient-to-t from-green-500 to-green-600"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative flex items-center gap-2">Anual (-20%)</span>
                </button>
            </div>
        </div>
    );
};

export function PricingSection() {
    const [isYearly, setIsYearly] = useState(false);
    const pricingRef = useRef<HTMLDivElement>(null);

    const revealVariants = {
        visible: (i: number) => ({
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                delay: i * 0.4,
                duration: 0.5,
            },
        }),
        hidden: {
            filter: "blur(10px)",
            y: -20,
            opacity: 0,
        },
    };

    const togglePricingPeriod = (value: string) =>
        setIsYearly(Number.parseInt(value) === 1);

    return (
        <div
            className="min-h-screen mx-auto relative bg-black overflow-x-hidden py-24"
            ref={pricingRef}
            id="pricing"
        >
            <TimelineContent
                animationNum={4}
                timelineRef={pricingRef}
                customVariants={revealVariants}
                className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] pointer-events-none"
            >
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px] "></div>
                <Sparkles
                    particleDensity={100}
                    speed={1}
                    particleColor="#FFFFFF"
                    className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
                />
            </TimelineContent>
            <TimelineContent
                animationNum={5}
                timelineRef={pricingRef}
                customVariants={revealVariants}
                className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0 pointer-events-none"
            >
                <div className="framer-1i5axl2">
                    <div
                        className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
                        style={{
                            border: "200px solid #22c55e",
                            filter: "blur(92px)",
                            WebkitFilter: "blur(92px)",
                            opacity: 0.1
                        }}
                        data-border="true"
                        data-framer-name="Ellipse 1"
                    ></div>
                </div>
            </TimelineContent>

            <article className="text-center mb-12 pt-10 max-w-3xl mx-auto space-y-2 relative z-50 px-4">
                <h2 className="text-4xl md:text-5xl font-medium text-white">
                    <VerticalCutReveal
                        splitBy="words"
                        staggerDuration={0.15}
                        staggerFrom="first"
                        reverse={true}
                        containerClassName="justify-center"
                        transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 40,
                            delay: 0,
                        }}
                    >
                        Planos que cabem no seu bolso
                    </VerticalCutReveal>
                </h2>

                <TimelineContent
                    as="p"
                    animationNum={0}
                    timelineRef={pricingRef}
                    customVariants={revealVariants}
                    className="text-gray-300 text-lg"
                >
                    Comece grátis e evolua conforme suas vendas aumentam.
                </TimelineContent>

                <TimelineContent
                    as="div"
                    animationNum={1}
                    timelineRef={pricingRef}
                    customVariants={revealVariants}
                    className="pt-6"
                >
                    <PricingSwitch onSwitch={togglePricingPeriod} />
                </TimelineContent>
            </article>

            <div
                className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0 pointer-events-none"
                style={{
                    backgroundImage: `
        radial-gradient(circle at center, #22c55e 0%, transparent 70%)
      `,
                    opacity: 0.15,
                    mixBlendMode: "screen",
                }}
            />

            <div className="grid md:grid-cols-3 max-w-6xl gap-6 px-4 py-6 mx-auto relative z-10">
                {plans.map((plan, index) => (
                    <TimelineContent
                        key={plan.name}
                        as="div"
                        animationNum={2 + index}
                        timelineRef={pricingRef}
                        customVariants={revealVariants}
                    >
                        <Card
                            className={`relative text-white border-neutral-800 h-full flex flex-col ${plan.popular
                                    ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#22c55e40] z-20 border-green-500/50"
                                    : "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 z-10"
                                }`}
                        >
                            <CardHeader className="text-left">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                                    {plan.popular && (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                                            Popular
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-baseline mt-4">
                                    <span className="text-4xl font-semibold">
                                        R$
                                        <NumberFlow
                                            format={{
                                                currency: "BRL",
                                                minimumFractionDigits: 2,
                                            }}
                                            value={isYearly ? plan.yearlyPrice / 12 : plan.price}
                                            className="text-4xl font-semibold"
                                        />
                                    </span>
                                    <span className="text-gray-300 ml-1">
                                        /mês
                                    </span>
                                </div>
                                {isYearly && (
                                    <p className="text-xs text-green-400 font-bold mt-1">
                                        Faturado R$ {plan.yearlyPrice} anualmente
                                    </p>
                                )}
                                <p className="text-sm text-gray-400 mt-4 mb-4 min-h-[40px]">{plan.description}</p>
                            </CardHeader>

                            <CardContent className="pt-0 flex-1 flex flex-col">
                                <button
                                    className={`w-full mb-6 p-4 text-lg font-bold rounded-xl transition-all ${plan.popular
                                            ? "bg-gradient-to-t from-green-500 to-green-600 shadow-lg shadow-green-900/50 border border-green-500 text-white hover:brightness-110"
                                            : plan.buttonVariant === "outline"
                                                ? "bg-gradient-to-t from-neutral-950 to-neutral-800 shadow-lg shadow-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800"
                                                : ""
                                        }`}
                                >
                                    {plan.buttonText}
                                </button>

                                <div className="space-y-3 pt-4 border-t border-neutral-800 flex-1">
                                    <h4 className="font-medium text-sm text-gray-300 mb-3">
                                        O que está incluso:
                                    </h4>
                                    <ul className="space-y-3">
                                        {plan.includes.map((feature, featureIndex) => (
                                            <li
                                                key={featureIndex}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="h-5 w-5 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                                </span>
                                                <span className="text-sm text-gray-400 leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TimelineContent>
                ))}
            </div>
        </div>
    );
}
