
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout activeTab="settings">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-6 py-5 flex items-center gap-4">
          <button onClick={() => navigate('/admin/dashboard')} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-50 active:scale-95 transition-all">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">Editar Perfil / CRECI</h1>
        </div>
      </header>

      <main className="pb-44">
        <section className="px-6 py-8 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="size-28 rounded-full bg-cover bg-center border-4 border-white shadow-xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDJIZwwSiX-4gH0pJ5abnEQF5PybRxHJxaOaliz31VzfdDxUhdIi7lWTHtvWJRvTBPt_YNEPAmlEZ7l9fhaoQwAZZaIQnqnNhtuluBM_Kiz52fhlCEQh-J9imy7oAchZwKI1ZMNK6ce9GmB4S65iZL87jR1fIsE5I0yLRmQw9TNRuAgBIbM8plFgSVJTeFcm7NZnARIPvB0q6Bm2602JVTe5M8olub-WrqhwR0lUEsKCkVrhG2fyhvJX8oeKCPphjYuJPpXi8qjTdc")' }}></div>
            <button className="absolute bottom-0 right-0 size-9 bg-primary text-black rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-active">
              <span className="material-symbols-outlined text-lg font-bold">photo_camera</span>
            </button>
          </div>
          <button className="mt-4 text-sm font-bold text-gray-500 hover:text-dark-accent transition-colors">Alterar Foto</button>
        </section>

        <form className="px-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Informações Pessoais</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">Nome Completo</label>
                <input className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="text" defaultValue="Mariana Alves" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">CRECI</label>
                <input className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="text" defaultValue="AM-12345" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Canais de Contato</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">WhatsApp</label>
                <input className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="tel" defaultValue="+55 92 99999-9999" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">E-mail Profissional</label>
                <input className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="email" defaultValue="contato@marianaalves.com.br" />
              </div>
            </div>
          </div>
        </form>
      </main>

      <div className="md:ml-64 fixed bottom-4 left-0 right-0 px-6 pointer-events-none z-50">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full pointer-events-auto h-14 bg-dark-accent text-white rounded-2xl font-black text-sm shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">save</span>
            Salvar Alterações
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Profile;
