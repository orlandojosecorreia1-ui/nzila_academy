'use client';

import React, { useState } from 'react';
import { useApp, Course } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Flame, 
  Clock, 
  Calendar, 
  CheckCircle, 
  GraduationCap, 
  ArrowUpRight, 
  TrendingUp, 
  Info, 
  Lock, 
  X, 
  MessageCircle, 
  Sparkles,
  BookOpen,
  Search,
  RotateCcw,
  Brain,
  Check
} from 'lucide-react';

interface StudentVitrineProps {
  onSelectCourse: (courseId: string) => void;
}

export default function StudentVitrine({ onSelectCourse }: StudentVitrineProps) {
  const { courses, currentUser, students, addActivityLog } = useApp();
  const [selectedPreviewCourse, setSelectedPreviewCourse] = useState<Course | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [solicitationSuccess, setSolicitationSuccess] = useState(false);

  // Find logged-in student's course and progress if applicable
  const loggedStudentDetails = students.find(s => s.email === currentUser?.email);
  const enrolledCourse = courses.find(c => c.id === currentUser?.courseId) || courses[0];
  const progressPercent = loggedStudentDetails?.progress ?? 0; 



  const isCourseEnrolled = (courseId: string) => {
    if (currentUser?.courseId === courseId) return true;
    if (!loggedStudentDetails) return false;
    const list = loggedStudentDetails.enrolledCourses || [{ courseId: loggedStudentDetails.courseId }];
    return list.some(ec => ec.courseId === courseId);
  };

  const handleStartClass = () => {
    if (enrolledCourse) {
      onSelectCourse(enrolledCourse.id);
    }
  };

  const handleCourseClick = (course: Course) => {
    const isAssigned = isCourseEnrolled(course.id);
    if (isAssigned) {
      onSelectCourse(course.id);
    } else {
      setSelectedPreviewCourse(course);
    }
  };

  const categoriesColors: Record<string, string> = {
    'Tech': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'Cyber': 'text-red-400 bg-red-400/10 border-red-400/20',
    'Dev': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    'Design': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  };

  // Sort: Enrolled course always first, followed by others
  const sortedCourses = [...courses].sort((a, b) => {
    const aAssigned = isCourseEnrolled(a.id);
    const bAssigned = isCourseEnrolled(b.id);
    if (aAssigned && !bAssigned) return -1;
    if (!aAssigned && bAssigned) return 1;
    return 0;
  });

  // Filter courses based on standard search
  const filteredCoursesToShow = sortedCourses.filter(course => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return course.title.toLowerCase().includes(q) || 
           course.tagline.toLowerCase().includes(q) || 
           course.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 py-2">
      
      {/* 1. Cinematic Hero Banner (Netflix-Style) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl min-h-[380px] sm:min-h-[440px] flex items-end border border-purple-500/20 shadow-2xl"
      >
        {/* Background Artwork Cover with fallback */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={enrolledCourse?.image || 'https://picsum.photos/seed/nzila/1920/1080'} 
            alt={enrolledCourse?.title} 
            className="w-full h-full object-cover object-center filter brightness-[0.75]"
            referrerPolicy="no-referrer"
          />
          {/* Gradients to keep information perfectly readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-[#090514]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090514] via-[#090514]/80 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full p-6 sm:p-10 space-y-4 max-w-3xl">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-purple-450/30 bg-purple-900/50 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" /> MATRÍCULA ATIVA
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-cyan-400/20 bg-cyan-900/40 text-cyan-300 text-[10px] font-mono">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400/20" /> {courses.length} Masterclasses Disponíveis
            </span>
          </div>
          
          <div className="space-y-2">
            <span className="text-purple-300 text-xs sm:text-sm font-mono tracking-wide">
              Mestrado Corporativo • Bem-vindo, {currentUser?.name || 'Alex Rivera'}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-none drop-shadow-md">
              {enrolledCourse?.title}
            </h1>
          </div>

          <p className="text-gray-200 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans drop-shadow font-medium">
            {enrolledCourse?.tagline}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button 
              onClick={handleStartClass}
              className="px-6 py-3 bg-white hover:bg-gray-100 text-purple-950 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer"
              id="vitrine-btn-resume"
            >
              <Play className="w-4 h-4 fill-purple-950 text-purple-950" />
              RETOMAR PRÓXIMA AULA
            </button>
            <button
              onClick={() => handleCourseClick(enrolledCourse)}
              className="px-5 py-3 bg-purple-900/45 hover:bg-purple-800/60 border border-purple-500/30 text-white rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-1.5 backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer"
            >
              <Info className="w-4 h-4" />
              Saber Mais
            </button>
          </div>

          {/* Embedded Mini Progress Indicator inside Movie Hero Banner */}
          <div className="pt-4 max-w-sm space-y-1.5 opacity-90">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-gray-300">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Progresso da sua Jornada
              </span>
              <span className="text-cyan-400 font-bold">{progressPercent}% Concluído</span>
            </div>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-purple-950/40">
              <div 
                className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

        </div>
      </motion.div>

      {/* 2. Quick stats and status indicators row */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#a78bfa] flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-purple-400 animate-pulse" /> Métricas e Indicadores de Aprendizado
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Enrolled Quick-Resume Card */}
          <div className="glass-card p-5 rounded-xl border border-purple-500/10 flex flex-col justify-between bg-gradient-to-br from-[#120b29] to-[#04010a]">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-emerald-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Matrícula Verificada
                </span>
                <span className="text-gray-400 font-bold">Módulo Ativo: {enrolledCourse?.lessonsList?.length > 0 ? '01' : '--'}</span>
              </div>
              <h3 className="text-sm font-medium text-white font-display line-clamp-1">
                {enrolledCourse?.title}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                Continue estudando as lições complementares e use seu acesso exclusivo e ilimitado às apostilas e ebooks.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-950/20 flex items-center justify-between text-xs font-mono">
              <button 
                onClick={handleStartClass}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                Fazer Aulas Agora <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-gray-400 text-[10px] font-mono">Último acesso: Hoje</span>
            </div>
          </div>

          {/* Core Analytics Metrics card */}
          <div className="glass-card p-5 rounded-xl border border-purple-500/10 flex flex-col justify-between bg-[#110d24]/20">
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-purple-350 tracking-wider">
                DESEMPENHO ACADÊMICO INTEGRADO
              </span>
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 rounded bg-purple-950/15 border border-purple-900/10">
                  <span className="block text-sm sm:text-base font-bold text-white">{Math.round((progressPercent / 100) * (enrolledCourse?.lessonsList?.flatMap(m => m.lessons).length || 0))}/{enrolledCourse?.lessonsList?.flatMap(m => m.lessons).length || 0}</span>
                  <span className="text-[9px] text-gray-400 header font-sans">Aulas Vistas</span>
                </div>
                <div className="p-2 rounded bg-purple-950/15 border border-purple-900/10">
                  <span className="block text-sm sm:text-base font-bold text-white">{progressPercent > 0 ? (progressPercent * 0.05).toFixed(1) : '0'}h</span>
                  <span className="text-[9px] text-gray-400 header font-sans text-ellipsis overflow-hidden whitespace-nowrap">Estudo</span>
                </div>
                <div className="p-2 rounded bg-purple-950/15 border border-purple-900/10">
                  <span className="block text-sm sm:text-base font-bold text-white">{progressPercent}%</span>
                  <span className="text-[9px] text-gray-400 header font-sans">Aproveitamento</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-purple-300 font-mono pt-2.5 border-t border-purple-950/20 mt-1">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Próximo Download: Ebook de Protocolos
              </span>
              <span className="text-emerald-400 font-semibold">• Ativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Vitrine dos Cursos (Staggered Movie Posters Layout with Fuzzy Search) */}
      <div className="space-y-6 pt-4" id="course-vitrine-section">
        
        {/* Search header container */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl bg-[#090514]/85 border border-purple-500/10 space-y-4">
          
          <div className="flex items-center justify-between border-b border-purple-950/20 pb-3">
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-purple-900/40 text-purple-300 border border-purple-500/30 shadow">
                <Search className="w-3.5 h-3.5" /> Busca de Cursos
              </div>
            </div>

            <div className="text-[10px] font-mono text-gray-400 hidden sm:block">
              Total: {courses.length} Trilhas Ativas
            </div>
          </div>

          {/* Standard Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busque por 'Inteligência Artificial', 'Hacking', 'Design', 'Mestrado'..."
              className="w-full bg-[#05030c]/90 border border-purple-950/60 focus:border-purple-500/50 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white outline-none transition-all placeholder-gray-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white hover:cursor-pointer bg-transparent border-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" /> Grade de Masterclasses Disponíveis
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery 
              ? `Exibindo resultados filtrados para "${searchQuery}" (${filteredCoursesToShow.length} encontrados)` 
              : 'Escolha um programa para estudar ou selecione outras opções para consultar e solicitar acesso para sua empresa.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
          {filteredCoursesToShow.length === 0 ? (
            <div className="col-span-full py-12 text-center space-y-3 font-mono">
              <p className="text-gray-500 text-xs">Nenhum programa acadêmico correspondente foi localizado.</p>
              <button
                onClick={() => { setSearchQuery(''); }}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Redefinir Filtros de Busca
              </button>
            </div>
          ) : (
            filteredCoursesToShow.map((course, index) => {
              const isAssigned = isCourseEnrolled(course.id);
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => handleCourseClick(course)}
                  className={`flex flex-col rounded-xl overflow-hidden border transition-all duration-300 group min-h-[310px] cursor-pointer hover:y-[-4px] border-purple-500/10 hover:border-purple-500/25 bg-black/20 hover:shadow-[0_8px_30px_rgb(168_85_247_/_0.08)]`}
                >
                  {/* Image background detailing heading */}
                  <div className="relative h-44 w-full overflow-hidden bg-purple-950/30">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-500 filter brightness-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a1b] via-[#0e0a1b]/40 to-transparent" />
                    
                    {/* Category Pill Tag */}
                    <span className={`absolute top-4 left-4 border text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${categoriesColors[course.category] || 'text-purple-400 border-purple-500/20 bg-purple-500/5'}`}>
                      {course.category}
                    </span>

                    {isAssigned ? (
                      <span className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> JORNADA ATIVA
                      </span>
                    ) : (
                      <span className="absolute top-4 right-4 bg-black/60 border border-purple-900/30 text-purple-300 text-[9px] font-mono px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-purple-400" /> FECHADO
                      </span>
                    )}
                  </div>

                  {/* Info block body */}
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-4 bg-black/20">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-display font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                        {course.tagline}
                      </p>
                    </div>

                    <div className="border-t border-purple-950/30 pt-3 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-0.5 text-gray-400">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" /> {course.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAssigned ? (
                          <span className="text-xs text-cyan-400 font-bold font-mono group-hover:underline flex items-center gap-0.5">
                            Acessar Aulas <Play className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400 inline-block ml-0.5" />
                          </span>
                        ) : (
                          <span className="text-[10px] text-purple-400 font-mono flex items-center gap-0.5 hover:underline">
                            Ver Ementa <Info className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Interactive Details Modal (Access Block for non-assigned courses) */}
      <AnimatePresence>
        {selectedPreviewCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedPreviewCourse(null); setSolicitationSuccess(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal card content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#0e0a1f] border border-purple-500/25 rounded-2xl overflow-hidden shadow-2xl z-10 font-sans"
            >
              {/* Close button */}
              <button 
                onClick={() => { setSelectedPreviewCourse(null); setSolicitationSuccess(false); }}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-purple-900/30"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Poster Cover Banner */}
              <div className="relative h-48 w-full select-none">
                <img 
                  src={selectedPreviewCourse.image} 
                  alt={selectedPreviewCourse.title} 
                  className="w-full h-full object-cover filter brightness-[0.70]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a1f] via-transparent to-transparent" />
                
                {/* Visual Label Tag */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className={`border text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${categoriesColors[selectedPreviewCourse.category] || 'bg-purple-950/20 text-purple-300 border-purple-500/20'}`}>
                    {selectedPreviewCourse.category}
                  </span>
                  <span className="bg-red-950/80 border border-red-500/20 text-red-400 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> ACESSO RESTRITO
                  </span>
                </div>
              </div>

              {/* Information body container */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5 text-left">
                  <span className="text-purple-400 text-xs font-mono font-semibold block uppercase tracking-wider">Masterclass Corporativa</span>
                  <h3 className="text-xl font-display font-black text-white leading-tight">
                    {selectedPreviewCourse.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Grade curricular: {selectedPreviewCourse.duration} • {selectedPreviewCourse.modulesCount} Módulos estruturados
                  </p>
                </div>

                <div className="bg-[#06030c] border border-purple-500/10 p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Resumo Acadêmico</span>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans font-medium">
                    {selectedPreviewCourse.tagline}
                  </p>
                </div>

                {solicitationSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-950/30 border border-emerald-500/35 p-4 rounded-xl flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-left">
                      <span className="block text-xs font-bold text-emerald-400">Solicitação Registrada!</span>
                      <span className="block text-[11px] text-gray-300 leading-normal">
                        O administrador já recebeu seu pedido de matrícula para <strong>{selectedPreviewCourse.title}</strong> e fará a análise em instantes.
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  /* Locker Instruction & Request callout */
                  <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-300">
                      <Lock className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="block text-xs font-bold text-white">Solicitar Matrícula</span>
                      <span className="block text-[11px] text-gray-300 leading-normal">
                        Você ainda não possui acesso ativo a esta trilha. Por favor, <strong>consulte o administrador ou tutor pedagógico</strong> para te dar o acesso em seu crachá digital.
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick actions for calling administrator */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <a
                    href="https://wa.me/244900000000?text=Ol%C3%A1%21+Gostaria+de+solicitar+o+acesso+ao+curso+de+Masterclass+no+portal+Nzila"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-4 h-4" /> Whatsapp 💬
                  </a>
                  <button
                    onClick={() => {
                      setSolicitationSuccess(true);
                      addActivityLog(`Solicitou matrícula no curso: "${selectedPreviewCourse.title}"`, 'courses');
                    }}
                    disabled={solicitationSuccess}
                    className="py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950 disabled:text-gray-500 text-white font-mono text-xs font-bold transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    {solicitationSuccess ? 'Enviado ✔' : 'Solicitar pelo Portal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
