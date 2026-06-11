'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

// Components imports
import RegisterForm from '@/components/RegisterForm';
import StudentVitrine from '@/components/StudentVitrine';
import StudentPlayer from '@/components/StudentPlayer';
import StudentFeed from '@/components/StudentFeed';
import AdminDashboard from '@/components/AdminDashboard';
import AdminKanban from '@/components/AdminKanban';
import AdminVouchers from '@/components/AdminVouchers';
import AdminCourses from '@/components/AdminCourses';
import AdminCommunity from '@/components/AdminCommunity';
import ProfileSettings from '@/components/ProfileSettings';

// Icons imports (LUCIDE only)
import { 
  GraduationCap, 
  TrendingUp, 
  Video, 
  MessageSquare, 
  Columns, 
  Ticket, 
  BookOpen, 
  Landmark, 
  Shield, 
  LogOut, 
  Globe, 
  Sparkles, 
  Menu, 
  X, 
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Settings
} from 'lucide-react';

export default function Home() {
  const { currentUser, isAdmin, logout, notifications, markNotificationsAsRead, students } = useApp();

  // Filter notifications only relevant for this student
  const visibleNotificationsForStudent = notifications.filter(n => {
    if (!currentUser) return false;
    if (!n.targetCourseId) return true; // Global
    if (n.targetCourseId === currentUser.courseId) return true;
    
    // Look up user's active student record for enrolledCourses list
    const userStudent = students?.find(s => s.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase());
    if (userStudent?.enrolledCourses?.some(ec => ec.courseId === n.targetCourseId)) return true;
    
    return false;
  });

  // Navigation management states
  const [activeStudentTab, setActiveStudentTab] = useState<'vitrine' | 'player' | 'feed' | 'settings'>('vitrine');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'kanban' | 'access-codes' | 'courses' | 'community' | 'settings'>('dashboard');
  
  // Selected course context helper to transfer from catalog directly to streaming player
  const [selectedCourseIdFromVitrine, setSelectedCourseIdFromVitrine] = useState<string | undefined>(undefined);

  // Mobile drawer responsiveness
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Fallback to register view if unauthorized/empty user sessions
  if (!currentUser) {
    return <RegisterForm />;
  }

  const handleNavigateToPlayerFromVitrine = (courseId: string) => {
    setSelectedCourseIdFromVitrine(courseId);
    setActiveStudentTab('player');
  };

  // Student Navigation Side-Links definitions
  const studentNavItems = [
    { id: 'vitrine', label: 'Ementas e Grade', icon: GraduationCap },
    { id: 'player', label: 'Player de Aula', icon: Video },
    { id: 'feed', label: 'Feed Comunidade', icon: MessageSquare },
    { id: 'settings', label: 'Perfil e Alertas', icon: Settings }
  ];

  // Admin Navigation Side-Links definitions
  const adminNavItems = [
    { id: 'dashboard', label: 'Painel Insights', icon: TrendingUp },
    { id: 'kanban', label: 'Kanban CRM Alunos', icon: Columns },
    { id: 'access-codes', label: 'Tokens de Acesso', icon: Ticket },
    { id: 'courses', label: 'Masterclasses', icon: BookOpen },
    { id: 'community', label: 'Fórum Moderação', icon: Shield },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const handleStudentTabChange = (tabId: 'vitrine' | 'player' | 'feed' | 'settings') => {
    setActiveStudentTab(tabId);
    setIsMobileNavOpen(false);
    if (tabId === 'settings') {
      markNotificationsAsRead();
    }
  };

  const handleAdminTabChange = (tabId: typeof activeAdminTab) => {
    setActiveAdminTab(tabId);
    setIsMobileNavOpen(false);
    if (tabId === 'settings') {
      markNotificationsAsRead();
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#06040a] relative select-none">
      
      {/* 1. Subtle Orbital Ambient Lights */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-900/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-900/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 2. Responsive Topbar Header (Mobile exclusively) */}
      <div className="md:hidden w-full h-14 border-b border-purple-950/40 bg-[#0c0a1a]/85 backdrop-blur-md px-4 flex items-center justify-between z-40 fixed top-0 left-0 right-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="font-display font-bold text-sm tracking-wider text-white">NZILA ACADEMY</span>
        </div>

        <button 
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-1.5 rounded-lg border border-purple-500/10 text-gray-400 hover:text-white"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 3. Sliding Contextual Mobile Drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 top-14 bg-[#090714] z-30 p-5 flex flex-col justify-between md:hidden border-r border-purple-950/40"
          >
            {/* Nav link lists */}
            <div className="space-y-6">
              <span className="text-[10px] font-mono text-purple-400 font-bold block tracking-widest uppercase">
                {isAdmin ? 'MÓDULO DE GESTÃO EXECUTIVE' : 'ÁREA DO ESTUDANTE'}
              </span>

              <div className="space-y-2">
                {isAdmin ? (
                  adminNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeAdminTab === item.id;
                    const unreadCount = item.id === 'settings' ? notifications.filter(n => !n.read).length : 0;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAdminTabChange(item.id as any)}
                        className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-between transition-all text-left ${isActive ? 'bg-purple-900/20 border border-purple-500/35 text-white' : 'text-gray-400 border border-transparent'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-purple-500 text-[9px] text-white font-mono font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  studentNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeStudentTab === item.id;
                    const unreadCount = item.id === 'settings' ? visibleNotificationsForStudent.filter(n => !n.read).length : 0;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleStudentTabChange(item.id as any)}
                        className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-between transition-all text-left ${isActive ? 'bg-purple-900/20 border border-purple-500/35 text-white' : 'text-gray-400 border border-transparent'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-purple-500 text-[9px] text-white font-mono font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-4 border-t border-purple-950/25 pt-4">
              <div className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 rounded-full bg-purple-950/40 border border-purple-500/15 overflow-hidden flex-shrink-0">
                  <img 
                    src={currentUser.avatar || (isAdmin 
                      ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                    )} 
                    alt="Author" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 font-display">
                  <span className="block text-xs font-bold text-white line-clamp-1">{currentUser.name}</span>
                  <span className="block text-[10px] text-gray-400 font-mono">Modo: {isAdmin ? 'Admin Co-Founder' : 'Estudante Pro'}</span>
                </div>
              </div>



              <button 
                onClick={logout}
                className="w-full py-2 px-3 rounded-lg bg-red-950/15 border border-red-900/20 text-[11px] font-mono text-red-400 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Fazer Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Desktop Persistent Sidebar Drawer (300px layout) */}
      <div className="hidden md:flex w-72 flex-col justify-between p-5 border-r border-[#150d2c]/60 bg-[#090714] relative z-20 flex-shrink-0">
        
        <div className="space-y-8">
          {/* Main system Logo */}
          <div className="flex items-center gap-2.5 px-1 pb-1">
            <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse ring-4 ring-purple-500/15" />
            <h1 className="font-display font-medium text-white tracking-wider text-base">
              NZILA <span className="text-[#a78bfa] font-bold">ACADEMY</span>
            </h1>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-purple-400 font-bold block tracking-widest uppercase px-1">
              {isAdmin ? 'PORTAL EXECUTIVO DIRECT' : 'ÁREA DO ESTUDANTE'}
            </span>

            {/* Sidebar navigation list */}
            <nav className="space-y-1">
              {isAdmin ? (
                // Admin Side Link Iteration
                adminNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeAdminTab === item.id;
                  const unreadCount = item.id === 'settings' ? notifications.filter(n => !n.read).length : 0;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleAdminTabChange(item.id as any)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-between transition-all text-left hover:cursor-pointer ${isActive ? 'bg-[#150d2d]/70 text-white font-bold border border-purple-500/15' : 'text-gray-400 border border-transparent hover:text-white'}`}
                      id={`sidebar-admin-link-${item.id}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-purple-450 text-purple-300" />
                        <span>{item.label}</span>
                        {unreadCount > 0 && (
                          <span className="ml-1 bg-purple-500 text-[9px] text-white font-mono font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <ChevronRight className={`w-3 h-3 opacity-30 ${isActive ? 'opacity-90 text-purple-400 translate-x-0.5' : ''} transition-all`} />
                    </button>
                  );
                })
              ) : (
                // Student Side Link Iteration
                studentNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeStudentTab === item.id;
                  const unreadCount = item.id === 'settings' ? visibleNotificationsForStudent.filter(n => !n.read).length : 0;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleStudentTabChange(item.id as any)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-between transition-all text-left hover:cursor-pointer ${isActive ? 'bg-[#150d2d]/70 text-white font-bold border border-purple-500/15' : 'text-gray-400 border border-transparent hover:text-white'}`}
                      id={`sidebar-student-link-${item.id}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-purple-450 text-purple-300" />
                        <span>{item.label}</span>
                        {unreadCount > 0 && (
                          <span className="ml-1 bg-purple-500 text-[9px] text-white font-mono font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <ChevronRight className={`w-3 h-3 opacity-30 ${isActive ? 'opacity-90 text-purple-400 translate-x-0.5' : ''} transition-all`} />
                    </button>
                  );
                })
              )}
            </nav>
          </div>
        </div>

        {/* Dynamic Sidebar Bottom profile and switcher bypass */}
        <div className="space-y-4 border-t border-[#1a113a]/30 pt-4 mt-6">
          <div className="flex items-center gap-3 px-1 text-sm">
            <div className="w-9 h-9 rounded-full bg-purple-950/40 border border-purple-500/15 overflow-hidden flex-shrink-0">
              <img 
                src={currentUser.avatar || (isAdmin 
                  ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                  : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                )} 
                alt="Account profile" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 font-display">
              <span className="block text-xs font-bold text-white line-clamp-1">{currentUser.name}</span>
              <span className="block text-[10px] text-gray-450 text-gray-400 w-fit">{isAdmin ? 'Admin Co-Founder' : 'Aluno Pro'}</span>
            </div>
          </div>



          <button 
            onClick={logout}
            className="w-full py-2 px-3 rounded-lg bg-red-950/10 hover:bg-red-950/20 border border-red-900/10 hover:border-red-900/30 text-[11px] font-mono text-red-400 flex items-center justify-center gap-1.5 transition-all hover:cursor-pointer"
            id="sidebar-btn-logout"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair da Conta
          </button>
        </div>

      </div>

      {/* 5. Centralized Content Rendering Panel Area (Fluid responsency grid) */}
      <main className="flex-1 min-w-0 px-4 md:px-8 py-5 md:py-6 relative z-10 overflow-y-auto max-h-screen pt-20 md:pt-6">
        
        {isAdmin ? (
          // RENDER ACTIVE ADMIN SUITE SCREEN MODULES
          <div className="h-full">
            {activeAdminTab === 'dashboard' && <AdminDashboard />}
            {activeAdminTab === 'kanban' && <AdminKanban />}
            {activeAdminTab === 'access-codes' && <AdminVouchers />}
            {activeAdminTab === 'courses' && <AdminCourses />}
            {activeAdminTab === 'community' && <AdminCommunity />}
            {activeAdminTab === 'settings' && <ProfileSettings />}
          </div>
        ) : (
          // RENDER ACTIVE STUDENT USER SUITE SCREEN MODULES
          <div className="h-full">
            {activeStudentTab === 'vitrine' && (
              <StudentVitrine onSelectCourse={handleNavigateToPlayerFromVitrine} />
            )}
            
            {activeStudentTab === 'player' && (
              <StudentPlayer 
                initialCourseId={selectedCourseIdFromVitrine}
                onGoBack={() => {
                  setSelectedCourseIdFromVitrine(undefined);
                  setActiveStudentTab('vitrine');
                }}
                onGoToCommunity={() => setActiveStudentTab('feed')}
              />
            )}
            
            {activeStudentTab === 'feed' && <StudentFeed />}
            {activeStudentTab === 'settings' && <ProfileSettings />}
          </div>
        )}

      </main>

    </div>
  );
}
