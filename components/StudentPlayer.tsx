'use client';

import React, { useState } from 'react';
import { useApp, Course, Lesson } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle, 
  FileText, 
  Download, 
  Lock, 
  HelpCircle, 
  ChevronRight, 
  Video, 
  ArrowLeft, 
  RefreshCw, 
  Layers,
  BookOpen,
  Type,
  Moon,
  Sun,
  Link2,
  FileArchive,
  Globe,
  Sparkles
} from 'lucide-react';

interface StudentPlayerProps {
  initialCourseId?: string;
  onGoBack: () => void;
  onGoToCommunity: () => void;
}

// Helper to convert watch links or short links to proper iframe embed syntax
function getEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.includes('/embed/')) return trimmed;
  if (trimmed.includes('player.vimeo.com')) return trimmed;
  
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
  } catch (e) {
    // Fail silently, return original
  }
  return trimmed;
}

export default function StudentPlayer({ initialCourseId, onGoBack, onGoToCommunity }: StudentPlayerProps) {
  const { courses, currentUser, students, updateStudentStatus } = useApp();
  
  // Find course or fall back to assigned student course
  const activeCourseId = initialCourseId || currentUser?.courseId || courses[0].id;
  const course = courses.find(c => c.id === activeCourseId) || courses[0];

  // Keep track of active lesson
  const firstModule = course.lessonsList[0] || { moduleName: 'Módulo 1', lessons: [] };
  const firstLesson = firstModule.lessons[0] || { id: '1', title: 'Carregando Aula...', duration: '0 min' };
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(firstLesson);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Ebook-specific configurations
  const [readingSize, setReadingSize] = useState<'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl'>('text-base');
  const [readingTheme, setReadingTheme] = useState<'slate' | 'sepia' | 'darkblack'>('slate');

  // Interactive alert feedback for simulator clicks
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  // Mark completion logic
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([
    '1-1', '1-2', '2-1', '2-2', '2c-1', '2c-2', '2c-3', '2c-4', '3c-1', '4c-1', '4c-2'
  ]);

  const toggleLessonCompletion = (lessonId: string) => {
    let nextFinished: string[];
    if (completedLessonIds.includes(lessonId)) {
      nextFinished = completedLessonIds.filter(id => id !== lessonId);
      triggerToast('Aula desmarcada como concluída.');
    } else {
      nextFinished = [...completedLessonIds, lessonId];
      triggerToast('Parabéns! Aula concluída com sucesso.');
    }
    setCompletedLessonIds(nextFinished);

    // Calculate new course progress estimation and save to students CRM if logged in
    const totalLessons = course.lessonsList.reduce((acc, curr) => acc + curr.lessons.length, 0);
    const courseLessonsListIds = course.lessonsList.flatMap(m => m.lessons.map(l => l.id));
    const finishedCount = courseLessonsListIds.filter(id => nextFinished.includes(id)).length;
    
    const calculatedPercentage = totalLessons > 0 ? Math.round((finishedCount / totalLessons) * 100) : 0;
    
    // Sync to CRM if student
    const studentObj = students.find(s => s.email === currentUser?.email);
    if (studentObj) {
      studentObj.progress = calculatedPercentage;
      if (calculatedPercentage >= 100) {
        updateStudentStatus(studentObj.id, 'Concluídos');
      } else {
        updateStudentStatus(studentObj.id, 'Em Andamento');
      }
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    if (lesson.locked) return;
    setSelectedLesson(lesson);
    setIsPlaying(false);
    setVideoProgress(0);
  };

  const handleSimulateWatch = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          return 100;
        }
        return prev + 10;
      });
    }, 355);
  };

  // Build simulated file downloading / opening logic
  const handleMaterialClick = (material: any) => {
    if (material.url && material.url.startsWith('http')) {
      triggerToast(`Redirecionando para o link de material: ${material.name}`);
      setTimeout(() => {
        window.open(material.url, '_blank', 'noopener,noreferrer');
      }, 1000);
    } else {
      // Offline/simulation download fallback
      triggerToast(`Download iniciado: ${material.name} (${material.size || 'Arquivo Complementar'})`);
    }
  };

  // Decide if lesson is a video or ebook
  const isEbook = selectedLesson.contentType === 'ebook';

  // Format ebook theme styles
  const getEbookThemeClasses = () => {
    switch(readingTheme) {
      case 'sepia':
        return 'bg-[#efe6d5] text-[#3b2a1a] border-[#dfd4bc]';
      case 'darkblack':
        return 'bg-black text-[#d1d5db] border-zinc-900';
      case 'slate':
      default:
        return 'bg-[#0f0c1e]/60 text-[#edf2f7] border-purple-500/10';
    }
  };

  // Default lesson description fallback
  const fallbackDescription = 'Esta aula traz abordagens estratégicas de Engenharia de Sistemas em ambiente de alta performance. Desenvolvemos soluções técnicas com alto rigor de arquitetura e estabilidade.';

  // Parsed Video URL
  const parsedVideoEmbed = getEmbedUrl(selectedLesson.videoUrl);

  return (
    <div className="space-y-6 py-2 relative">
      
      {/* Dynamic alert banner feedback */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0d091e] border border-fuchsia-500/30 text-white shadow-xl shadow-fuchsia-950/20 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-mono"
          >
            <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse flex-shrink-0" />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Back to vitrine */}
      <div className="flex items-center justify-between border-b border-purple-950/20 pb-4">
        <button 
          onClick={onGoBack}
          className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 bg-purple-950/10 border border-purple-500/10 hover:border-purple-500/25 px-3 py-1.5 rounded-lg transition-all hover:cursor-pointer"
          id="player-btn-back"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar à Grade
        </button>

        <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider block bg-purple-500/5 py-1 px-3 rounded-md border border-purple-500/10">
          AULA: {selectedLesson.title ? (selectedLesson.title.length > 30 ? selectedLesson.title.substring(0, 30) + '...' : selectedLesson.title) : 'Selecione uma aula'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Player/E-book and Materials (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CONTENT ACCORDING TO LESSON TYPE (VIDEO VS EBOOK) */}
          {!isEbook ? (
            // ================== VIDEO PLAYER ==================
            <div className="aspect-video w-full rounded-2xl glass-card relative flex flex-col items-center justify-center overflow-hidden border border-purple-500/15 bg-black/50 group">
              
              {/* If we have a valid converted video url (like an iframe embed for youtube/vimeo) */}
              {parsedVideoEmbed && (parsedVideoEmbed.startsWith('http') || parsedVideoEmbed.includes('embed')) ? (
                <div className="absolute inset-0 w-full h-full bg-black">
                  <iframe
                    title={selectedLesson.title}
                    src={parsedVideoEmbed}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : selectedLesson.videoUrl ? (
                // Direct video player for uploaded files
                <div className="absolute inset-0 w-full h-full bg-black">
                  <video 
                    src={selectedLesson.videoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                // Simulators for basic lessons without explicit URL
                <>
                  <div className="absolute inset-0 bg-[#0e071e]/30 pointer-events-none" />

                  {isPlaying ? (
                    <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/40">
                      <div className="flex justify-between items-center bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-mono">
                        <span className="text-cyan-400 animate-pulse flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          TRANSMISSÃO EM PROGRESSO...
                        </span>
                        <span className="text-gray-400">{selectedLesson.duration}</span>
                      </div>

                      <div className="w-full text-center space-y-2 select-none pointer-events-none">
                        <span className="text-xs font-mono text-purple-300 neon-text-purple animate-pulse block">
                          Carregando fluxo multimídia de dados integrado...
                        </span>
                        <div className="text-lg font-bold text-white font-display max-w-sm mx-auto overflow-hidden text-ellipsis whitespace-nowrap">
                          {selectedLesson.title}
                        </div>
                      </div>

                      <div className="space-y-2 font-mono">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Aulas Assistidas: {completedLessonIds.length}</span>
                          <span>Progresso: {videoProgress}%</span>
                        </div>
                        <div className="w-full bg-purple-950/40 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300" style={{ width: `${videoProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 space-y-5 z-10">
                      <button 
                        onClick={handleSimulateWatch}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center border border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all outline-none hover:cursor-pointer mx-auto"
                        id="player-btn-play"
                      >
                        <Play className="w-6 h-6 text-white fill-white ml-1 font-bold" />
                      </button>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-white font-display">{selectedLesson.title}</h4>
                        <p className="text-xs text-gray-400 font-mono">Tempo de Aula: {selectedLesson.duration} • Toque para Iniciar Transmissão</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Grid backdrop */}
              <div className="absolute inset-0 grid grid-cols-12 gap-1 opacity-[0.02] pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-full border-r border-white" />
                ))}
              </div>
            </div>
          ) : (
            // ================== INTERACTIVE EBOOK READER ==================
            <div className={`p-4 sm:p-5 rounded-2xl border transition-colors flex flex-col space-y-4 ${getEbookThemeClasses()}`}>
              
              {/* E-Book Toolbar settings */}
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-purple-500/10 pb-3 text-xs">
                
                <span className="font-mono text-[10px] font-bold tracking-wider text-purple-400 uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" /> LEITURA DE E-BOOK ACADÊMICO
                </span>

                <div className="flex items-center gap-3">
                  
                  {/* Theme Selectors */}
                  <div className="flex bg-black/30 border border-purple-500/5 p-0.5 rounded-lg">
                    <button
                      onClick={() => setReadingTheme('slate')}
                      className={`p-1.5 rounded text-[10px] font-mono transition-all hover:cursor-pointer ${readingTheme === 'slate' ? 'bg-purple-600/30 text-purple-300' : 'text-gray-400'}`}
                      title="Tema Escuro Espacial"
                    >
                      Slate
                    </button>
                    <button
                      onClick={() => setReadingTheme('sepia')}
                      className={`p-1.5 rounded text-[10px] font-mono transition-all hover:cursor-pointer ${readingTheme === 'sepia' ? 'bg-[#3b2a1a]/15 text-[#3b2a1a] font-bold' : 'text-gray-400'}`}
                      title="Tema Fluido Sépia"
                    >
                      Sepia
                    </button>
                    <button
                      onClick={() => setReadingTheme('darkblack')}
                      className={`p-1.5 rounded text-[10px] font-mono transition-all hover:cursor-pointer ${readingTheme === 'darkblack' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500'}`}
                      title="Tema Pitch Black"
                    >
                      Pitch
                    </button>
                  </div>

                  {/* Font Sizers */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setReadingSize('text-sm')}
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] bg-black/10 border ${readingSize === 'text-sm' ? 'border-purple-500/30 text-purple-400' : 'border-transparent text-gray-500'}`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setReadingSize('text-base')}
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs bg-black/10 border ${readingSize === 'text-base' ? 'border-purple-500/30 text-purple-400' : 'border-transparent text-gray-500'}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setReadingSize('text-lg')}
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-sm bg-black/10 border ${readingSize === 'text-lg' ? 'border-purple-500/30 text-purple-400' : 'border-transparent text-gray-500'}`}
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setReadingSize('text-xl')}
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-base bg-black/10 border ${readingSize === 'text-xl' ? 'border-purple-500/30 text-purple-400' : 'border-transparent text-gray-500'}`}
                    >
                      A++
                    </button>
                  </div>

                </div>
              </div>

              {/* E-Book direct file / external URL attachment banner */}
              {selectedLesson.ebookUrl && (
                <div className="bg-purple-950/20 shadow-inner border border-purple-500/20 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 animate-fadeIn">
                  <div className="flex items-center gap-2.5 min-w-0 self-start sm:self-center">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 font-bold font-mono text-xs">
                      PDF
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="block text-xs font-semibold text-white truncate">
                        {selectedLesson.ebookFileName || 'E-book Acadêmico Integrado'}
                      </span>
                      <span className="block text-[10px] text-gray-400 font-mono truncate">
                        Leitura Direta Ativa • Disponível para Download complementar
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedLesson.ebookUrl?.startsWith('blob:')) {
                        const link = document.createElement('a');
                        link.href = selectedLesson.ebookUrl;
                        link.download = selectedLesson.ebookFileName || 'ebook_aula.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        triggerToast('Download e-book local efetuado com sucesso!');
                      } else if (selectedLesson.ebookUrl) {
                        triggerToast('Abrindo link do e-book em aba externa...');
                        setTimeout(() => {
                          window.open(selectedLesson.ebookUrl, '_blank', 'noreferrer,noopener');
                        }, 600);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-tr from-purple-650 to-indigo-650 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold leading-none flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] transition-transform flex-shrink-0 border border-purple-400/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Acessar E-book 📥
                  </button>
                </div>
              )}

              {/* Text content area */}
              <div className={`leading-relaxed whitespace-pre-wrap ${readingSize} font-sans`}>
                {selectedLesson.ebookContent || `### Apostila de Estudos Acadêmicos\n\nEste módulo está em processamento de formatação digital integrada. No entanto, por favor verifique o campo de descrição ou os links na grade para baixar o PDF completo desta aula.\n\nTítulo: **${selectedLesson.title}**\nDuração Acadêmica Recomendada: **${selectedLesson.duration}**`}
              </div>

              {/* Marker Hint */}
              <div className="border-t border-purple-500/5 pt-3.5 flex justify-between items-center text-[10px] font-mono text-gray-400">
                <span>Total estimado para conclusão: {selectedLesson.duration}</span>
                <span className="text-emerald-500 flex items-center gap-1 font-bold">● Proteção Antipirataria Ativa</span>
              </div>

            </div>
          )}

          {/* Lesson Details Info */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4 bg-[#0a0715]/40 border border-purple-500/10">
            <div className="space-y-2">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block font-bold">EMENTA EM EXECUÇÃO</span>
              <h2 className="text-lg sm:text-xl font-display font-medium text-white leading-tight">
                {selectedLesson.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-1">
                {selectedLesson.description || fallbackDescription}
              </p>
            </div>

            <div className="border-t border-purple-950/20 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => toggleLessonCompletion(selectedLesson.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all hover:cursor-pointer border ${completedLessonIds.includes(selectedLesson.id) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15' : 'bg-purple-600/10 border-purple-500/20 text-purple-300 hover:bg-purple-600/20'}`}
                  id="player-btn-toggle-completion"
                >
                  <CheckCircle className={`w-3.5 h-3.5 ${completedLessonIds.includes(selectedLesson.id) ? 'fill-emerald-400/10' : ''}`} />
                  {completedLessonIds.includes(selectedLesson.id) ? 'Marcar como não Assistida' : 'Concluir Aula'}
                </button>

                <button 
                  onClick={onGoToCommunity}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-indigo-505 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 hover:cursor-pointer"
                  id="player-btn-ask"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Perguntar na Comunidade
                </button>
              </div>

              <div className="text-[10px] font-mono text-gray-500">
                ID da Disciplina: {selectedLesson.id}
              </div>
            </div>
          </div>

          {/* Downloadable Materials Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-display font-medium text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> Materias Adicionais de Aula Complementar
            </h3>
            
            {selectedLesson.materials && selectedLesson.materials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedLesson.materials.map((mat) => {
                  const isPdf = mat.type === 'pdf';
                  const isZip = mat.type === 'zip';
                  const isDoc = mat.type === 'doc';
                  
                  return (
                    <div 
                      key={mat.id} 
                      onClick={() => handleMaterialClick(mat)}
                      className="glass-card p-3 rounded-xl border border-purple-500/10 hover:border-purple-500/25 flex items-center justify-between hover:cursor-pointer hover:bg-black/30 transition-all select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 ${
                          isPdf 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                            : isZip 
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : isDoc 
                                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        }`}>
                          {isPdf && <span className="text-[9px] font-mono font-bold">PDF</span>}
                          {isZip && <span className="text-[9px] font-mono font-bold">ZIP</span>}
                          {isDoc && <span className="text-[9px] font-mono font-bold">DOC</span>}
                          {!isPdf && !isZip && !isDoc && <Link2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-medium text-white line-clamp-1">{mat.name}</span>
                          <span className="block text-[10px] text-gray-500 font-mono">{mat.size || 'Disponível Online'} • Toque para baixar</span>
                        </div>
                      </div>
                      <button 
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-purple-950/20 hover:bg-purple-500/10 border border-purple-500/10 flex-shrink-0"
                        title="Acessar material"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty template
              <div className="p-4 border border-purple-500/5 text-center bg-purple-950/5 rounded-xl text-xs text-gray-500">
                Nenhum link ou PDF de apoio anexado nesta aula. Siga as orientações da aula em texto/vídeo.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Complete Course Syllabus / Ementa Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-4 animate-fadeIn">
          <div className="glass-card rounded-2xl overflow-hidden border border-purple-500/12 bg-[#090615]/50">
            
            <div className="p-4 bg-purple-950/15 border-b border-purple-950/20">
              <span className="block text-[10px] text-purple-400 font-mono uppercase tracking-widest font-bold">EMENTA COMPLETA DO CURSO</span>
              <h3 className="text-sm font-bold font-display text-white line-clamp-1 mt-1">{course.title}</h3>
            </div>

            <div className="max-h-[500px] overflow-y-auto divide-y divide-purple-950/30">
              {course.lessonsList.map((mod, modIndex) => (
                <div key={modIndex} className="p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 font-display">
                    <Layers className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="line-clamp-1">{mod.moduleName}</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {mod.lessons.map((lesson) => {
                      const isSelected = selectedLesson.id === lesson.id;
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      
                      return (
                        <div 
                          key={lesson.id}
                          className={`flex items-start gap-2.5 p-2 rounded-lg text-xs leading-relaxed transition-all relative ${
                            lesson.locked 
                              ? 'opacity-40 cursor-not-allowed bg-black/5' 
                              : isSelected
                                ? 'bg-purple-950/25 border border-purple-500/30 text-white shadow-sm shadow-purple-500/5' 
                                : 'hover:bg-purple-500/5 text-gray-300 border border-transparent hover:cursor-pointer'
                          }`}
                          onClick={() => handleSelectLesson(lesson)}
                          id={`lesson-${lesson.id}`}
                        >
                          {/* Left interactive circle checkbox */}
                          <div 
                            className="pt-0.5 flex-shrink-0"
                            onClick={(e) => {
                              if (!lesson.locked) {
                                e.stopPropagation();
                                toggleLessonCompletion(lesson.id);
                              }
                            }}
                          >
                            {lesson.locked ? (
                              <Lock className="w-3.5 h-3.5 text-gray-500" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/10 hover:opacity-80 transition-all hover:scale-105" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-purple-500/40 hover:border-purple-300 transition-all" />
                            )}
                          </div>

                          {/* Lesson title */}
                          <div className="flex-grow min-w-0 pr-1 select-none">
                            <span className={`block font-medium leading-tight line-clamp-2 ${isSelected ? 'text-purple-300 font-semibold' : ''} ${isCompleted && !isSelected ? 'text-gray-400 line-through decoration-gray-500/50' : ''}`}>
                              {lesson.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {lesson.contentType === 'ebook' ? (
                                <span className="text-[8px] bg-indigo-500/15 text-indigo-300 px-1 py-0.2 rounded font-mono font-bold uppercase">Ebook</span>
                              ) : (
                                <span className="text-[8px] bg-purple-500/15 text-purple-300 px-1 py-0.2 rounded font-mono font-bold uppercase">Video</span>
                              )}
                              <span className="text-[10px] text-gray-500 block font-mono">{lesson.duration}</span>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="w-1.5 h-6 rounded bg-purple-500 absolute right-0 top-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
