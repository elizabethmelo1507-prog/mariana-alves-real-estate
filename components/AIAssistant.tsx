import React, { useState, useEffect, useRef } from 'react';
import { openai } from '../lib/openai';

const AIAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Olá! Sou a assistente virtual da Mariana Alves. Como posso te ajudar a encontrar seu imóvel ideal em Manaus hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é a assistente virtual da Mariana Alves, uma corretora de imóveis de luxo em Manaus (CRECI AM-12345). 
            Seu tom deve ser profissional, prestativo e sofisticado. 
            Ajude o usuário a navegar nos principais bairros: Ponta Negra, Adrianópolis e Vieiralves.
            Responda como se estivesse em um chat premium de alto padrão.`
          },
          ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user' as any, content: m.text })),
          { role: 'user', content: userMessage }
        ]
      });

      const aiText = response.choices[0].message.content || 'Desculpe, tive um problema.';
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Ops, erro técnico. Pode me chamar no WhatsApp?' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-full max-w-[400px] flex flex-col items-end">
      <div className="bg-white w-full h-[600px] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-slide-up">
        <header className="bg-dark-accent p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-black font-bold">smart_toy</span>
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight leading-none">Mariana Assistant</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-[2px] mt-1">Inteligência Artificial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user'
                  ? 'bg-dark-accent text-white rounded-tr-none shadow-lg shadow-black/10'
                  : 'bg-white text-dark-accent shadow-sm rounded-tl-none border border-gray-100'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre bairros, preços..."
              className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/30 font-bold"
            />
            <button
              onClick={handleSend}
              className="bg-primary text-black size-14 rounded-2xl flex items-center justify-center transition-active shadow-xl shadow-primary/20"
            >
              <span className="material-symbols-outlined font-bold">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
