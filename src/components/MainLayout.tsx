"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useConfig } from '@/context/ConfigContext';

const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const UserIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { highContrast, toggleContrast, lang, toggleLang, t } = useConfig();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const theme = {
    wrapper: highContrast ? 'bg-white text-black' : 'bg-[#0a0a0a] text-gray-200',
    sidebar: highContrast ? 'bg-gray-100 border-r border-gray-300' : 'bg-[#121212] border-r border-gray-800',
    header: highContrast ? 'bg-white border-b border-gray-300' : 'bg-[#0a0a0a] border-b border-gray-800',
    input: highContrast ? 'bg-gray-100 border border-gray-400 text-black' : 'bg-gray-800 border border-gray-700 text-white',
    sidebarActive: 'bg-[#00E5FF] text-black font-black shadow-[0_0_15px_rgba(0,229,255,0.3)]',
    sidebarLink: highContrast ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-400 hover:bg-gray-800',
    divider: highContrast ? 'border-gray-300' : 'border-gray-800',
    metaText: highContrast ? 'text-gray-500' : 'text-gray-600',
    actionButton: highContrast
      ? 'text-[10px] font-bold border px-4 py-1.5 rounded-full border-gray-400 text-black hover:bg-black hover:text-white transition-all'
      : 'text-[10px] font-bold border px-4 py-1.5 rounded-full border-gray-500 text-gray-200 hover:bg-gray-200 hover:text-black transition-all',
  };


  const menuItems = [
    { id: 'dashboard', label: 'dashboard', path: '/dashboard', icon: '🏠' },
    { id: 'vehiculos', label: 'vehiculos', path: '/dashboard/vehiculos', icon: '🏍️' },
    { id: 'taller', label: 'taller', path: '/dashboard/taller', icon: '🔧' },
    { id: 'tarifas', label: 'tarifas', path: '/dashboard/tarifas', icon: '💰' },
    { id: 'reservas', label: 'reservas', path: '/dashboard/reservas', icon: '📅' },
    { id: 'calendario', label: 'calendario', path: '/dashboard/calendario', icon: '📆' },
    { id: 'clientes', label: 'clientes', path: '/dashboard/clientes', icon: '👥' },
    { id: 'notificaciones', label: 'notificaciones', path: '/dashboard/notificaciones', icon: '🔔' },
    { id: 'reportes', label: 'reportes', path: '/dashboard/reportes', icon: '📊' },
    { id: 'asistente', label: 'asistente', path: '/dashboard/asistente-ia', icon: '🤖' },
  ];

  const superAdminItems = [
    { id: 'superadmin', label: 'superadmin', path: '/superadmin/tenants', icon: '🌐' },
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${theme.wrapper}`}>
      
      <aside className={`hidden md:flex flex-col w-64 ${theme.sidebar} min-h-screen sticky top-0`}>
        <div className="p-8 text-2xl font-black italic tracking-tighter">
          RENT<span className="text-[#00E5FF]">OS</span>
        </div>
        
        <nav className="flex-1 px-3 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.id} 
                href={item.path}
                className={`flex items-center gap-3 w-full px-6 py-3.5 rounded-xl transition-all duration-200 uppercase text-[11px] tracking-widest ${
                  isActive ? theme.sidebarActive : theme.sidebarLink
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {t('nav', item.label)}
              </Link>
            );
          })}
          
          <div className={`pt-4 mt-4 border-t ${theme.divider}`}>
            {superAdminItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.id} 
                  href={item.path}
                  className={`flex items-center gap-3 w-full px-6 py-3.5 rounded-xl transition-all duration-200 uppercase text-[11px] tracking-widest ${
                    isActive ? theme.sidebarActive : theme.sidebarLink
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {t('nav', item.label)}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={`p-6 border-t ${theme.divider}`}>
          <p className={`text-[10px] ${theme.metaText} font-bold uppercase tracking-widest`}>v1.0.4 - 2026</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`flex justify-between items-center p-4 px-8 ${theme.header}`}>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <MenuIcon />
          </button>

          <div className={`hidden md:flex flex-1 mx-8 rounded-2xl px-5 py-2.5 max-w-xl ${theme.input} items-center`}>
            <input 
              type="text" 
              placeholder={t('header', 'search')} 
              className="bg-transparent outline-none w-full text-sm font-medium" 
            />
            <span className="opacity-50">🔍</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleContrast} className={theme.actionButton}>
              {highContrast ? t('a11y', 'light') : t('a11y', 'dark')}
            </button>
            
            <button onClick={toggleLang} className={theme.actionButton}>
              {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>

            <div className={`p-2 rounded-xl ${highContrast ? 'bg-gray-200 text-black border border-gray-300' : 'bg-white/5 text-white border border-white/10'}`}>
              <UserIcon />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto bg-transparent">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}