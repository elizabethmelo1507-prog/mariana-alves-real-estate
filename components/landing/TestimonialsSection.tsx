import React from 'react';
import { TestimonialsColumn } from '../ui/testimonials-column';

const testimonials = [
    {
        text: "O Broker Pilot transformou completamente minha rotina. Antes eu perdia muito tempo organizando planilhas, agora tenho tudo automatizado e consigo focar no que importa: vender.",
        image: "/testimonials/user1.jpg",
        name: "Ricardo Silva",
        role: "Corretor de Imóveis"
    },
    {
        text: "A facilidade de criar meu site e gerenciar os leads em um só lugar é incrível. Meus clientes elogiam muito a apresentação dos imóveis. Recomendo demais!",
        image: "/testimonials/user2.jpg",
        name: "Antônio Carlos",
        role: "Gestor Imobiliário"
    },
    {
        text: "Desde que comecei a usar o sistema, minhas vendas aumentaram 30%. As automações de mensagem me ajudam a não deixar nenhum cliente sem resposta.",
        image: "/testimonials/user3.jpg",
        name: "Gabriel Souza",
        role: "Especialista em Lançamentos"
    },
    {
        text: "Melhor investimento que fiz para minha carreira. O CRM é intuitivo e o suporte é excelente. Sinto que tenho uma imobiliária inteira no meu bolso.",
        image: "/testimonials/user4.jpg",
        name: "Marcos Vinícius",
        role: "Corretor Autônomo"
    },
    {
        text: "A plataforma é muito completa e fácil de usar. Consigo acompanhar o desempenho da minha equipe e garantir que todos os leads sejam bem atendidos.",
        image: "/testimonials/user5.jpg",
        name: "Juliana Mendes",
        role: "Diretora Comercial"
    }
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(2, 5); // Overlap slightly for visual density or just split
const thirdColumn = testimonials.slice(0, 5).reverse(); // Mix it up

export const TestimonialsSection = () => {
    return (
        <section className="py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-black text-dark-accent mb-4">O que dizem nossos parceiros</h2>
                <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                    <span className="material-symbols-outlined fill-current">star</span>
                    <span className="material-symbols-outlined fill-current">star</span>
                    <span className="material-symbols-outlined fill-current">star</span>
                    <span className="material-symbols-outlined fill-current">star</span>
                    <span className="material-symbols-outlined fill-current">star</span>
                </div>
                <p className="text-gray-500 font-bold">+500 corretores acelerando vendas</p>
            </div>

            <div className="relative flex h-[500px] w-full flex-row items-center justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
                <TestimonialsColumn testimonials={firstColumn} duration={15} />
                <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
                <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
            </div>
        </section>
    );
};
