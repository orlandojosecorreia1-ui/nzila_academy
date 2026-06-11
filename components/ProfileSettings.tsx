'use client';

import React, { useState, useRef } from 'react';
import { useApp, SystemNotification, ActivityLog } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  History, 
  Search, 
  Check, 
  Activity, 
  Sparkles, 
  MessageSquare, 
  Sliders, 
  Lock, 
  Smartphone,
  CheckCircle,
  Clock,
  Camera,
  Upload,
  Eye,
  Trash2,
  Inbox,
  Download,
  RefreshCw,
  FileText,
  Database
} from 'lucide-react';

export default function ProfileSettings() {
  const { 
    currentUser, 
    isAdmin, 
    updateProfile, 
    activityLogs, 
    addActivityLog, 
    notifications, 
    triggerSystemNotification,
    markNotificationsAsRead,
    courses,
    students
  } = useApp();

  // Profile Edit fields State
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [userPhone, setUserPhone] = useState(currentUser?.whatsapp || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser?.avatar || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // File Upload reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications channels toggles State (Admins see and toggle this)
  const [channels, setChannels] = useState({
    browser: true,
    email: false,
    whatsapp: true,
    weeklyDigest: false,
  });

  // Custom Simulator states (for admin notifications)
  const [testTitle, setTestTitle] = useState('Desafio Prático de Engenharia Neuronal');
  const [testMsg, setTestMsg] = useState('Novo laboratório avançado de IA estocástica disponível na Aba Masterclass!');
  const [testCategory, setTestCategory] = useState<'info' | 'success' | 'alert'>('info');
  const [selectedTargetCourseId, setSelectedTargetCourseId] = useState<string>('all');

  // Logs and Notification filters state
  const [filterSearch, setFilterSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Dedicated logs visualizer states
  const [logSearch, setLogSearch] = useState('');
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('all');
  const [logNotificationSuccess, setLogNotificationSuccess] = useState<string | null>(null);

  const AVATAR_PRESETS = [
    { name: "Cyan Cyberpunk", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" },
    { name: "Neon Violet Mesh", url: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=150&q=80" },
    { name: "Emerald Cyber", url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=150&q=80" },
    { name: "Chrome Core AI", url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=150&q=80" },
    { name: "Warm Aura Spectrum", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=150&q=80" },
    { name: "Quantum Shadow", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=150&q=80" }
  ];

  // Save changes handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    setIsUpdating(true);
    setTimeout(() => {
      updateProfile(userName, userEmail, userPhone, selectedAvatar);
      setIsUpdating(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 4000);
    }, 850);
  };

  // Mock toggle channel notifications (Admin settings)
  const toggleChannel = (key: keyof typeof channels) => {
    const updated = { ...channels, [key]: !channels[key] };
    setChannels(updated);
    addActivityLog(
      `Canal de notificações ${key} alterado para: ${updated[key] ? 'ATIVO' : 'DESATIVADO'}`,
      'notification'
    );
  };

  // Trigger dispatch simulation
  const handleTriggerTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim() || !testMsg.trim()) return;

    const courseIdParam = selectedTargetCourseId === 'all' ? undefined : selectedTargetCourseId;
    triggerSystemNotification(testTitle, testMsg, testCategory, courseIdParam);
  };

  // Quick prep defaults
  const handleSetQuickNotification = (title: string, msg: string, cat: 'info' | 'success' | 'alert') => {
    setTestTitle(title);
    setTestMsg(msg);
    setTestCategory(cat);
  };

  const handleExportLogs = () => {
    try {
      const logsText = activityLogs
        .map(log => `[${log.timestamp}] [${log.category.toUpperCase()}] Responsável: ${log.user} - Ação: ${log.action}`)
        .join('\r\n');
      
      const blob = new Blob([logsText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nzila_audit_logs_${new Date().toISOString().substring(0,10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setLogNotificationSuccess("Logs de auditoria exportados com sucesso em formato TXT!");
      setTimeout(() => setLogNotificationSuccess(null), 3500);
      
      addActivityLog('Logs de auditoria exportados pelo Administrador', 'system');
    } catch (err) {
      console.error(err);
    }
  };



  // Log lists filter math
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
                          log.user.toLowerCase().includes(logSearch.toLowerCase());
    const matchesCategory = logCategoryFilter === 'all' || log.category === logCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Student Notification Inbox math
  const filteredNotifications = notifications
    .filter(notif => {
      // If student role, they should NOT see notifications targeted to a different course
      if (!isAdmin) {
        if (!currentUser) return false;
        if (!notif.targetCourseId) return true; // Global
        if (notif.targetCourseId === currentUser.courseId) return true;
        
        // Look up user's active student record for enrolledCourses list
        const userStudent = students?.find(s => s.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase());
        if (userStudent?.enrolledCourses?.some(ec => ec.courseId === notif.targetCourseId)) return true;
        
        return false;
      }
      return true; // Admin sees all
    })
    .filter(notif => {
      const matchesSearch = notif.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
                            notif.message.toLowerCase().includes(filterSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || notif.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

  // File Upload converting Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem de perfil deve possuir menos de 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-950/25 pb-5">
        <div>
          <span className="text-xs font-mono text-purple-400 font-bold block tracking-widest uppercase">
            {isAdmin ? 'PAINEL CENTRAL DO FUNDADOR' : 'CONFIGURAÇÕES PEDAGÓGICAS'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-tight animate-fade-in">
            {isAdmin ? 'Configurações de' : 'Meu Perfil &'}{' '}
            <span className="text-[#a78bfa] font-bold">{isAdmin ? 'Gestor e Auditoria' : 'Notificações'}</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-purple-950/15 border border-purple-500/15 py-1.5 px-3 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Servidor Nzila Core: Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Profile Settings (Shared container - left panel on widescreen) */}
        <div className="space-y-6 lg:col-span-7 col-span-1">
          
          {/* Card: Perfil do Utilizador */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-purple-500/10 bg-[#0c091f]/60 relative overflow-hidden" id="profile-card">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-purple-950/20 pb-4 mb-4">
              <div className="p-2 bg-purple-900/10 rounded-lg border border-purple-500/20">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Configuração de Perfil</h3>
                <p className="text-xs text-gray-400 font-mono">Modifique seus dados de cadastro e foto identificadora</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {/* Dynamic photo and presets selector section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#090514]/40 border border-purple-500/5">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-full bg-[#130b2c] border-2 border-purple-500/20 overflow-hidden flex items-center justify-center relative shadow-inner">
                      {selectedAvatar ? (
                        <img 
                          src={selectedAvatar} 
                          alt="Profile visual" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <User className="w-8 h-8 text-purple-400" />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full border border-purple-400/20 shadow-md transition-all cursor-pointer hover:scale-105"
                      title="Carregar nova foto"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  <div className="space-y-2 flex-grow text-center sm:text-left">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Foto identificadora do Alpini</span>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-purple-950/20 hover:bg-purple-900/40 border border-purple-500/20 text-purple-300 py-1.5 px-3 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-purple-400" /> Enviar do Dispositivo
                      </button>
                      {selectedAvatar && (
                        <button
                          type="button"
                          onClick={() => setSelectedAvatar('')}
                          className="bg-red-950/20 hover:bg-red-900/40 border border-red-500/20 text-red-300 py-1.5 px-2.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                          title="Remover foto de perfil"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" /> Limpar
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-normal">
                      Clique no botão para carregar uma imagem personalizada ou selecione um dos avatares artísticos abaixo.
                    </p>
                  </div>
                </div>

                {/* Cyber Avatars preset gallery block */}
                <div className="space-y-1.5 pb-2">
                  <span className="block text-[10px] text-gray-400 font-mono uppercase tracking-widest pl-1">Avatares Pro (Seleção Inteligente)</span>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_PRESETS.map((p, idx) => {
                      const isSel = selectedAvatar === p.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatar(p.url)}
                          className={`relative rounded-xl overflow-hidden border aspect-square transition-all h-11 w-full group cursor-pointer ${isSel ? 'border-[#a78bfa] shadow-[0_0_12px_rgba(168,85,247,0.35)] scale-[1.04]' : 'border-purple-950/30 opacity-70 hover:opacity-100 hover:border-purple-500/35'}`}
                          title={p.name}
                        >
                          <img 
                            src={p.url} 
                            alt={p.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                          <div className={`absolute inset-0 flex items-center justify-center transition-all bg-black/45 ${isSel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 bg-black/20'}`}>
                            <Check className="w-3.5 h-3.5 text-purple-200" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Data input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-widest pl-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
                    <input 
                      type="text" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-[#070514]/90 border border-purple-950/60 focus:border-purple-500/60 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-white outline-none transition-all placeholder-gray-500"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-widest pl-1">Endereço de Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
                    <input 
                      type="email" 
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-[#070514]/90 border border-purple-950/60 focus:border-purple-500/60 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-white outline-none transition-all placeholder-gray-500"
                      placeholder="voce@exemplo.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-widest pl-1">Contacto Whatsapp (Para Alertas e Desafios)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
                  <input 
                    type="text" 
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-[#070514]/90 border border-purple-950/60 focus:border-purple-500/60 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-white outline-none transition-all placeholder-gray-500"
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>
              </div>

              <div className="bg-purple-950/10 border border-purple-500/10 p-3 rounded-xl flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-[11px] font-mono text-gray-400">
                  Nível de Acesso: <strong className="text-white">{isAdmin ? 'Administrador Co-Founder' : 'Estudante Pro'}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {updateSuccess && (
                     <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                       <CheckCircle className="w-3.5 h-3.5" />
                       Dados de perfil e avatar sincronizados!
                     </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold py-2 px-5 rounded-lg border border-purple-500/30 transition-all shadow-md flex items-center gap-2 hover:cursor-pointer disabled:opacity-40"
                >
                  {isUpdating ? 'Atualizando...' : 'Gravar Perfil'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Configuração de Notificações do Sistema (ADMINS ONLY can view alerts channel editor) */}
          {isAdmin && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-purple-500/10 bg-[#0c091f]/60 relative" id="notifications-settings">
              
              <div className="flex items-center gap-3 border-b border-purple-950/20 pb-4 mb-4">
                <div className="p-2 bg-indigo-900/10 rounded-lg border border-indigo-500/20">
                  <Bell className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Canais de Notificações Ativos (Global)</h3>
                  <p className="text-xs text-gray-400 font-mono">Configure quais canais estarão operacionais para os alunos</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Channel 1: Browser push */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#070514]/50 border border-purple-950/40 hover:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${channels.browser ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-900/20 text-gray-500'}`}>
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-white text-xs block">Push Notificações no Portal</span>
                      <span className="text-[10px] text-gray-300 font-sans">Alertas automáticos no canto da tela do aluno</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleChannel('browser')}
                    className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 flex ${channels.browser ? 'bg-indigo-500 justify-end' : 'bg-[#150d2d] justify-start'} hover:cursor-pointer`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block shadow-sm" />
                  </button>
                </div>

                {/* Channel 2: WhatsApp Alerts */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#070514]/50 border border-purple-950/40 hover:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${channels.whatsapp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-900/20 text-gray-500'}`}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-white text-xs block">Mensageria Direta (WhatsApp)</span>
                      <span className="text-[10px] text-gray-300 font-sans">Alertas de suporte ao vivo e liberação de vagas exclusivas</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleChannel('whatsapp')}
                    className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 flex ${channels.whatsapp ? 'bg-emerald-500 justify-end' : 'bg-[#150d2d] justify-start'} hover:cursor-pointer`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block shadow-sm" />
                  </button>
                </div>

                {/* Channel 3: Email newsletter */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#070514]/50 border border-purple-950/40 hover:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${channels.email ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-900/20 text-gray-500'}`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-white text-xs block">E-mails de Boas-Vindas & Faturas</span>
                      <span className="text-[10px] text-gray-300 font-sans">Envio de notas fiscais, liberação de vouchers e acessos</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleChannel('email')}
                    className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 flex ${channels.email ? 'bg-purple-500 justify-end' : 'bg-[#150d2d] justify-start'} hover:cursor-pointer`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block shadow-sm" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right side panel section:
            - If ADMIN: Shows Notifications Trigger Simulator ANDNzila Smart system activity logs (auditing logs).
            - If STUDENT: Shows beautiful "Central de Comunicações" notifications feed. EXCLUDES logs entirely. */}
        <div className="space-y-6 lg:col-span-5 col-span-1">
          
          {isAdmin ? (
            /* ADMIN SECTION RENDER */
            <>
              {/* Card 1: Notification Simulator */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-purple-500/10 bg-[#0c091f]/60 relative" id="notifications-trigger">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#a78bfa]/5 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="flex items-center gap-3 border-b border-purple-950/20 pb-4 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-[#a78bfa]/30">
                    <Sliders className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Simulador NZILA Push</h3>
                    <p className="text-xs text-gray-400 font-mono">Dispare e teste notificações do sistema ao vivo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-4">
                  <button 
                    type="button"
                    onClick={() => handleSetQuickNotification('Desafio Prático IA', 'Novo desafio lançado para criar uma rede neural simples.', 'success')}
                    className="bg-[#0e0821] hover:bg-purple-900/10 border border-purple-500/5 hover:border-purple-500/20 rounded-lg p-2 text-left transition-all"
                  >
                    <span className="text-[10px] text-purple-400 font-bold font-mono block">1. Desafio IA</span>
                    <span className="text-[9px] text-gray-400 font-sans block line-clamp-1">Teste de neurônios</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSetQuickNotification('Live Cancelada', 'A mentoria de Criptologia Quântica foi reagendada para Sábado.', 'alert')}
                    className="bg-[#0e0821] hover:bg-purple-900/10 border border-purple-500/5 hover:border-purple-500/20 rounded-lg p-2 text-left transition-all"
                  >
                    <span className="text-[10px] text-amber-400 font-bold font-mono block">2. Reagendamento</span>
                    <span className="text-[9px] text-gray-400 font-sans block line-clamp-1">Aviso de última hora</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSetQuickNotification('Promoção Exclusiva', 'O teu cupom do NZILA Core Masterclass já está ativo!', 'info')}
                    className="bg-[#0e0821] hover:bg-purple-900/10 border border-purple-500/5 hover:border-purple-500/20 rounded-lg p-2 text-left transition-all"
                  >
                    <span className="text-[10px] text-indigo-400 font-bold font-mono block">3. Token Ativado</span>
                    <span className="text-[9px] text-gray-400 font-sans block line-clamp-1">Sucesso de voucher</span>
                  </button>
                </div>

                <form onSubmit={handleTriggerTest} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-mono uppercase">Título do Alerta</label>
                    <input 
                      type="text" 
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                      className="w-full bg-[#070514]/95 border border-purple-950/60 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none"
                      placeholder="Título"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-mono uppercase">Mensagem Descritiva</label>
                    <textarea 
                      value={testMsg}
                      onChange={(e) => setTestMsg(e.target.value)}
                      className="w-full bg-[#070514]/95 border border-purple-950/60 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none h-16 min-h-[4rem] max-h-32 resize-none"
                      placeholder="Mensagem"
                      required
                    />
                  </div>

                  <div className="space-y-3.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 bg-[#100a2b]/20 p-2 rounded-xl border border-purple-950/40">
                        <label className="block text-[10px] text-purple-300 font-mono uppercase pl-1 pb-1">Destinatários</label>
                        <select
                          value={selectedTargetCourseId}
                          onChange={(e) => setSelectedTargetCourseId(e.target.value)}
                          className="w-full bg-[#0e0924] border border-purple-900/60 text-purple-200 text-[11px] font-mono rounded py-1 px-1.5 focus:outline-none"
                        >
                          <option value="all">Alunos de Todos Cursos (Geral)</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              Apenas: {course.title.substring(0, 30)}...
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 bg-[#100a2b]/20 p-2 rounded-xl border border-purple-950/40">
                        <label className="block text-[10px] text-purple-300 font-mono uppercase pl-1 pb-1">Categoria de Alerta</label>
                        <select 
                          value={testCategory}
                          onChange={(e: any) => setTestCategory(e.target.value)}
                          className="w-full bg-[#0e0924] border border-purple-900/60 text-purple-200 text-[11px] font-mono rounded py-1 px-1.5 focus:outline-none"
                        >
                          <option value="info">Info</option>
                          <option value="success">Sucesso</option>
                          <option value="alert">Alerta</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold py-2 px-6 rounded-xl border border-purple-500/40 hover:border-purple-500/80 transition-all hover:cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Disparar Alerta Acadêmico
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Card 2: Visualizador de Logs do Sistema */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-purple-500/15 bg-[#0b081e]/85 relative h-auto min-h-[580px] flex flex-col justify-between" id="activity-logs">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />
                
                <div>
                  {/* Title and Header Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-950/30 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <Database className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Visualizador de Logs</h3>
                        <p className="text-xs text-gray-400">Auditoria operacional e integridade de eventos do sistema</p>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportLogs}
                        className="text-[10px] font-mono font-bold text-purple-300 hover:text-white bg-purple-900/40 border border-purple-500/30 px-2.5 py-1.5 rounded-lg transition-all hover:cursor-pointer flex items-center gap-1"
                        type="button"
                        title="Exportar todos os logs formatados em formato TXT"
                      >
                        <Download className="w-3 h-3" /> Exportar TXT
                      </button>
                    </div>
                  </div>

                  {/* Toast Alert */}
                  {logNotificationSuccess && (
                     <div className="mb-4 p-2 px-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[10.5px] flex items-center gap-2 animate-pulse">
                       <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                       <span>{logNotificationSuccess}</span>
                     </div>
                  )}

                  {/* Micro-analytics boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    <div className="bg-[#080516]/80 p-2 rounded-xl border border-purple-950/45 text-center">
                      <span className="block text-[8px] font-mono text-gray-500 uppercase">Todos Eventos</span>
                      <span className="text-sm font-bold text-white font-mono">{activityLogs.length}</span>
                    </div>
                    <div className="bg-[#080516]/80 p-2 rounded-xl border border-cyan-950/45 text-center">
                      <span className="block text-[8px] font-mono text-cyan-400 uppercase">Sessões & Login</span>
                      <span className="text-sm font-bold text-cyan-300 font-mono">
                        {activityLogs.filter(l => l.category === 'auth').length}
                      </span>
                    </div>
                    <div className="bg-[#080516]/80 p-2 rounded-xl border border-purple-900/45 text-center">
                      <span className="block text-[8px] font-mono text-purple-300 uppercase">Cursos Criados</span>
                      <span className="text-sm font-bold text-purple-400 font-mono">
                        {activityLogs.filter(l => l.category === 'courses').length}
                      </span>
                    </div>
                    <div className="bg-[#080516]/80 p-2 rounded-xl border border-pink-950/45 text-center">
                      <span className="block text-[8px] font-mono text-pink-400 uppercase">Disparos Push</span>
                      <span className="text-sm font-bold text-pink-300 font-mono">
                        {activityLogs.filter(l => l.category === 'notification').length}
                      </span>
                    </div>
                  </div>

                  {/* Filters / Search and Pill Tab buttons */}
                  <div className="space-y-3 mb-4">
                    {/* Search bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-purple-500" />
                      <input 
                        type="text" 
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        placeholder="Pesquisar por ação ou utilizador..."
                        className="w-full bg-[#060411]/90 border border-purple-950/60 focus:border-purple-500/30 rounded-xl py-1.5 px-3 pl-9 text-[11px] font-mono text-white outline-none placeholder-gray-500 transition-all"
                      />
                    </div>

                    {/* Category quick filters row */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setLogCategoryFilter('all')}
                        type="button"
                        className={`px-3 py-1 rounded-lg text-[10px] font-mono font-medium transition-all ${logCategoryFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-[#0e0a24] text-gray-400 border border-purple-950/50 hover:text-white'}`}
                      >
                        Todos ({activityLogs.length})
                      </button>
                      <button
                        onClick={() => setLogCategoryFilter('auth')}
                        type="button"
                        className={`px-3 py-1 rounded-lg text-[10px] font-mono font-medium transition-all ${logCategoryFilter === 'auth' ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/30' : 'bg-[#0e0a24] text-gray-400 border border-purple-950/50 hover:text-white'}`}
                      >
                        Sessões ({activityLogs.filter(l => l.category === 'auth').length})
                      </button>
                      <button
                        onClick={() => setLogCategoryFilter('courses')}
                        type="button"
                        className={`px-3 py-1 rounded-lg text-[10px] font-mono font-medium transition-all ${logCategoryFilter === 'courses' ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/20' : 'bg-[#0e0a24] text-gray-400 border border-purple-950/50 hover:text-white'}`}
                      >
                        Cursos ({activityLogs.filter(l => l.category === 'courses').length})
                      </button>
                      <button
                        onClick={() => setLogCategoryFilter('notification')}
                        type="button"
                        className={`px-3 py-1 rounded-lg text-[10px] font-mono font-medium transition-all ${logCategoryFilter === 'notification' ? 'bg-pink-950/50 text-pink-300 border border-pink-500/35' : 'bg-[#0e0a24] text-gray-400 border border-purple-950/50 hover:text-white'}`}
                      >
                        Disparos ({activityLogs.filter(l => l.category === 'notification').length})
                      </button>
                      <button
                        onClick={() => setLogCategoryFilter('system')}
                        type="button"
                        className={`px-3 py-1 rounded-lg text-[10px] font-mono font-medium transition-all ${logCategoryFilter === 'system' ? 'bg-amber-950/50 text-amber-300 border border-amber-500/35' : 'bg-[#0e0a24] text-gray-400 border border-purple-950/50 hover:text-white'}`}
                      >
                        Sistema ({activityLogs.filter(l => l.category === 'system').length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* List scroll container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar scrollbar-thin scrollbar-thumb-purple-900/60 max-h-[280px] min-h-[180px]">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-16 font-mono text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-gray-650 animate-pulse" />
                      <span>Nenhum registro de atividade localizado para o filtro atual.</span>
                    </div>
                  ) : (
                    filteredLogs.map(log => {
                      let badgeColor = 'text-purple-400 bg-purple-950/40 border-purple-900/50';
                      let catLabel = 'Perfil';
                      if (log.category === 'auth') {
                        badgeColor = 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50';
                        catLabel = 'Acesso';
                      } else if (log.category === 'system') {
                        badgeColor = 'text-amber-400 bg-amber-950/40 border-amber-850/50';
                        catLabel = 'Sistema';
                      } else if (log.category === 'notification') {
                        badgeColor = 'text-pink-400 bg-pink-950/40 border-pink-850/50';
                        catLabel = 'Alerta';
                      } else if (log.category === 'courses') {
                        badgeColor = 'text-indigo-400 bg-indigo-950/40 border-indigo-850/50';
                        catLabel = 'Curso';
                      }

                      return (
                        <div 
                          key={log.id} 
                          className="p-3 rounded-xl bg-[#060412]/90 border border-purple-950/45 hover:border-purple-500/20 transition-all duration-200 text-left flex items-start gap-3 relative overflow-hidden"
                        >
                          {/* Inner Category Visual Side Stripe */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1 ${log.category === 'auth' ? 'bg-cyan-500' : log.category === 'courses' ? 'bg-indigo-500' : log.category === 'notification' ? 'bg-pink-500' : log.category === 'system' ? 'bg-amber-500' : 'bg-purple-500'}`} />

                          <div className="space-y-1.5 flex-1 pl-1">
                            {/* Action message and category */}
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-bold text-gray-100 text-[11px] font-sans break-all leading-normal flex-1">
                                {log.action}
                              </span>
                              <span className={`text-[8px] font-mono py-0.5 px-2 rounded-md uppercase border shrink-0 ${badgeColor}`}>
                                {catLabel}
                              </span>
                            </div>

                            {/* Details: timestamp and administrative actor */}
                            <div className="flex items-center justify-between text-[10px] text-gray-550 font-mono pt-1 border-t border-purple-950/20">
                              <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                <span className="text-gray-400">{log.user}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                <span className="text-gray-400">{log.timestamp}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-purple-950/30 pt-3.5 mt-4 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-purple-600" /> Trilha de Auditoria Validada</span>
                  <span className="text-purple-400 hover:text-purple-300 transition-all font-bold">Nzila Audit Engine v2.5</span>
                </div>
              </div>
            </>
          ) : (
            /* STUDENT SECTION RENDER - BEAUTIFUL NOTIFICATION INBOX */
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-purple-500/10 bg-[#0c091f]/60 relative h-[560px] flex flex-col justify-between" id="student-notifications">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-550/5 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-purple-950/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-950/25 rounded-lg border border-indigo-500/20">
                      <Bell className="w-5 h-5 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Central de Comunicações</h3>
                      <p className="text-xs text-gray-400 font-mono">Avisos, comunicados e comunicados pedagógicos</p>
                    </div>
                  </div>

                  <button 
                    onClick={markNotificationsAsRead}
                    className="text-[10px] font-mono text-purple-400 hover:text-purple-300 font-bold bg-[#140b2a]/60 border border-purple-500/20 px-2 py-1 rounded-lg transition-all hover:cursor-pointer"
                  >
                    Ler Todas
                  </button>
                </div>

                {/* Filters for notifications */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-indigo-500" />
                    <input 
                      type="text" 
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder="Buscar avisos..."
                      className="w-full bg-[#070514]/90 border border-purple-950/40 focus:border-indigo-500/30 rounded-lg py-1 px-3 pl-8 text-[11px] font-mono text-white outline-none placeholder-gray-500"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#070514]/90 border border-purple-950/40 text-gray-400 text-[11px] font-mono rounded-lg py-1 px-2 outline-none focus:border-indigo-500/30"
                  >
                    <option value="all">Todas</option>
                    <option value="info">Info</option>
                    <option value="success">Sucesso</option>
                    <option value="alert">Alertas</option>
                  </select>
                </div>
              </div>

              {/* Scroll notification feed */}
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 my-4 custom-scrollbar max-h-[350px]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <Inbox className="w-10 h-10 text-purple-900/45 animate-bounce" />
                    <div className="space-y-1">
                      <p className="text-xs font-mono font-bold text-gray-400">Nenhum aviso ativo</p>
                      <p className="text-[10px] text-gray-500 leading-normal max-w-xs font-sans">
                        Sua caixa de correio está vazia. Quando um instrutor postar um lembrete importante ou vaga, ele aparecerá aqui.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredNotifications.map(notif => {
                    let typeBadge = 'text-cyan-400 bg-cyan-950/20 border-cyan-800/30';
                    let typeIcon = <Smartphone className="w-4 h-4 text-cyan-400" />;
                    
                    if (notif.category === 'success') {
                      typeBadge = 'text-emerald-400 bg-emerald-950/20 border-emerald-800/30';
                      typeIcon = <CheckCircle className="w-4 h-4 text-emerald-400" />;
                    } else if (notif.category === 'alert') {
                      typeBadge = 'text-amber-400 bg-amber-950/20 border-amber-800/30';
                      typeIcon = <Bell className="w-4 h-4 text-amber-400 animate-pulse" />;
                    }

                    return (
                      <div 
                        key={notif.id} 
                        className={`p-3.5 rounded-xl border transition-all text-left flex items-start gap-3 relative ${notif.read ? 'bg-[#060411]/50 border-purple-950/20 opacity-80' : 'bg-[#0f0a28]/60 border-[#a78bfa]/25 shadow-[0_0_15px_rgba(167,139,250,0.06)]'}`}
                      >
                        {/* Static categories visual icon */}
                        <div className="shrink-0 pt-0.5">
                          {typeIcon}
                        </div>

                        {/* Text and body details */}
                        <div className="space-y-1.5 flex-grow pr-4">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <h4 className={`text-xs font-bold leading-relaxed ${notif.read ? 'text-gray-300' : 'text-white'}`}>
                              {notif.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {notif.targetCourseId ? (
                                <span className="text-[7.5px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase max-w-[100px] truncate" title={courses.find(c => c.id === notif.targetCourseId)?.title}>
                                  {courses.find(c => c.id === notif.targetCourseId)?.title.substring(0, 10)}...
                                </span>
                              ) : (
                                <span className="text-[7.5px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase">
                                  Geral
                                </span>
                              )}
                              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded shrink-0 ${typeBadge}`}>
                                {notif.category}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
                            {notif.message}
                          </p>

                          <div className="text-[9px] font-mono text-gray-500 flex items-center gap-1 pt-0.5">
                            <Clock className="w-2.5 h-2.5 text-gray-650" /> {notif.timestamp}
                          </div>
                        </div>

                        {/* Pulsator for unread indicator */}
                        {!notif.read && (
                          <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Box Footer status indicators */}
              <div className="border-t border-purple-950/20 pt-3 flex items-center justify-between text-[9px] text-gray-500 font-mono">
                <span className="flex items-center gap-1">📡 Canal Pedagógico Nzila Core</span>
                <span className="text-[#a78bfa]">
                  {notifications.filter(n => !n.read).length} não lidas
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
