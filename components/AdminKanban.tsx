'use client';

import React, { useState } from 'react';
import { useApp, Student } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Columns, UserCheck, MessageSquare, Award, ArrowRightLeft, Plus, Check, ChevronUp, ChevronDown, CheckCircle, Search, Mail, ExternalLink, X, Edit, Phone, Calendar, ArrowRight, Trash2 } from 'lucide-react';

export default function AdminKanban() {
  const { students, updateStudentStatus, updateStudent, deleteStudent, addCourseToStudent, enrollExistingStudentDirectly, courses } = useApp();
  
  // Custom filter states
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal toggle states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [certStudent, setCertStudent] = useState<Student | null>(null);

  // Drag and Drop states
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<Student['status'] | null>(null);

  // Active detailed student modal
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  
  // Local edit states inside the detail modal
  const [isEditingDetailProgress, setIsEditingDetailProgress] = useState(false);
  const [editDetailProgressVal, setEditDetailProgressVal] = useState(0);
  const [isEditingDetailPhone, setIsEditingDetailPhone] = useState(false);
  const [editDetailPhoneVal, setEditDetailPhoneVal] = useState('');
  const [isEditingDetailName, setIsEditingDetailName] = useState(false);
  const [editDetailNameVal, setEditDetailNameVal] = useState('');
  const [editDetailCourseIdVal, setEditDetailCourseIdVal] = useState('');
  const [newCourseToAddId, setNewCourseToAddId] = useState('');

  const handleOpenDetailModal = (student: Student) => {
    setSelectedStudentDetail(student);
    setEditDetailProgressVal(student.progress);
    setEditDetailPhoneVal(student.whatsapp);
    setEditDetailNameVal(student.name);
    setEditDetailCourseIdVal(student.courseId);
    setIsEditingDetailProgress(false);
    setIsEditingDetailPhone(false);
    setIsEditingDetailName(false);
    setNewCourseToAddId('');
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, studentId: string) => {
    setDraggedStudentId(studentId);
    e.dataTransfer.setData('text/plain', studentId);
  };

  const handleDragEnd = () => {
    setDraggedStudentId(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: Student['status']) => {
    e.preventDefault();
    setDragOverColumnId(columnId);
  };

  const handleDrop = (e: React.DragEvent, columnId: Student['status']) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData('text/plain') || draggedStudentId;
    if (studentId) {
      updateStudentStatus(studentId, columnId);
      // Synchronize detailed view as well
      if (selectedStudentDetail && selectedStudentDetail.id === studentId) {
        setSelectedStudentDetail(prev => prev ? { ...prev, status: columnId } : null);
      }
    }
    setDraggedStudentId(null);
    setDragOverColumnId(null);
  };

  // New Student input properties
  const [newStudName, setNewStudName] = useState('');
  const [newStudEmail, setNewStudEmail] = useState('');
  const [newStudPhone, setNewStudPhone] = useState('');
  const [newStudCourse, setNewStudCourse] = useState(courses[0]?.id || 'course-1');

  const columns: { id: Student['status']; title: string; color: string; border: string; bg: string }[] = [
    { id: 'Novos', title: 'Novas Matrículas', color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5' },
    { id: 'Em Andamento', title: 'Em Atividade', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
    { id: 'Concluídos', title: 'Certificação Pendente', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
    { id: 'Inativos', title: 'Inativos / Trancado', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' }
  ];

  const handleAddNewStudentManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudName || !newStudEmail || !newStudPhone) return;

    const selectedCourseSelected = courses.find(c => c.id === newStudCourse);
    const courseTitle = selectedCourseSelected ? selectedCourseSelected.title : 'Curso Especialista';

    enrollExistingStudentDirectly({
      name: newStudName,
      email: newStudEmail,
      whatsapp: newStudPhone,
      courseId: newStudCourse,
      courseTitle,
      progress: 0,
      status: 'Novos',
      codeUsed: 'ADM-MANUAL-REG'
    });

    // Reset fields
    setNewStudName('');
    setNewStudEmail('');
    setNewStudPhone('');
    setIsAddStudentOpen(false);
  };

  const handleCertifyComplete = (student: Student) => {
    setCertStudent(student);
  };

  const shiftStudentColumn = (studentId: string, currentStatus: Student['status'], direction: 'next' | 'prev') => {
    const statuses: Student['status'][] = ['Novos', 'Em Andamento', 'Concluídos', 'Inativos'];
    const index = statuses.indexOf(currentStatus);
    
    let targetIndex = index;
    if (direction === 'next' && index < statuses.length - 1) {
      targetIndex = index + 1;
    } else if (direction === 'prev' && index > 0) {
      targetIndex = index - 1;
    }

    if (targetIndex !== index) {
      updateStudentStatus(studentId, statuses[targetIndex]);
    }
  };

  const handleSendEmailSimulated = (email: string) => {
    alert(`E-mail enviado para o aluno: ${email} como auditoria de segurança.`);
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 py-2 relative">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-purple-950/20 pb-4">
        <div>
          <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
            <Columns className="w-5 h-5 text-purple-400" /> CRM de Relacionamento & Kanban
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Modulação ágil de turmas, progresso do aluno e canais diretos de suporte ao cliente. Arraste os cards para mudar o funil.
          </p>
        </div>

        <div className="flex gap-2.5">
          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por estudante..."
              className="pl-8 pr-3 py-1.5 w-44 sm:w-56 bg-black/35 border border-purple-900/20 text-xs text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <button 
            onClick={() => setIsAddStudentOpen(true)}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 hover:cursor-pointer transition-colors"
            id="kanban-btn-add-student"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Aluno
          </button>
        </div>
      </div>

      {/* 2. Drag & Drop style 4 Col Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
        {columns.map(col => {
          const colStudents = filteredStudents.filter(s => s.status === col.id);
          const isOverThisCol = dragOverColumnId === col.id;
          
          return (
            <div 
              key={col.id} 
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverColumnId(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border p-4 flex flex-col space-y-3 min-h-[460px] ${col.border} ${col.bg} ${
                isOverThisCol ? 'border-purple-400 bg-purple-500/10 scale-[1.01] shadow-[0_0_15px_rgba(168,85,247,0.15)]' : ''
              } transition-all duration-250`}
            >
              {/* Header Title count */}
              <div className="flex justify-between items-center border-b border-purple-950/30 pb-2.5">
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-[11px] font-mono text-gray-400 bg-black/20 py-0.5 px-2 rounded-full font-bold">
                  {colStudents.length}
                </span>
              </div>

              {/* Items Card loop */}
              <div className="space-y-3 flex-grow overflow-y-auto max-h-[500px] scrollbar-none pr-1">
                <AnimatePresence mode="popLayout">
                  {colStudents.map(student => {
                    const isBeingDragged = draggedStudentId === student.id;
                    return (
                      <motion.div
                        key={student.id}
                        layoutId={`student-card-${student.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: isBeingDragged ? 0.4 : 1, scale: isBeingDragged ? 0.98 : 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable="true"
                        onDragStart={(e: any) => handleDragStart(e, student.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOpenDetailModal(student)}
                        className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/35 transition-all flex flex-col justify-between space-y-4 bg-black/55 group relative cursor-grab active:cursor-grabbing hover:bg-[#12082b]/80 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/5 duration-300"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-1.5">
                            <span className="block text-base font-bold text-white font-display line-clamp-1 group-hover:text-purple-300 transition-colors">
                              {student.name}
                            </span>
                            <span className="text-[9.5px] text-purple-400 font-mono bg-purple-950/50 border border-purple-500/25 px-2 py-0.5 rounded font-bold shrink-0 select-none">
                              DRAG ☰
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs font-mono leading-none pt-0.5 select-none">
                            <span className="text-purple-400/90 truncate max-w-[65%] font-medium" title={student.courseTitle}>
                              {student.courseTitle}
                            </span>
                            <span className="text-gray-400 shrink-0">
                              {student.registeredAt ? student.registeredAt.split(' ')[0] : ''}
                            </span>
                          </div>
                        </div>

                        {/* Bar metrics representation */}
                        <div className="flex justify-between items-center text-xs font-mono text-gray-300 leading-none">
                          <span>Progresso</span>
                          <div className="flex items-center gap-2.5 w-1/2 justify-end">
                            <span className={`${col.color} font-bold text-[11px]`}>{student.progress}%</span>
                            <div className="w-16 bg-purple-950/50 h-2 rounded-full overflow-hidden border border-purple-950/40">
                              <div 
                                className="bg-purple-500 h-full rounded-full" 
                                style={{ width: `${student.progress}%` }} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Interaction toolbar */}
                        <div className="flex items-center justify-between border-t border-purple-950/20 pt-3">
                          
                          {/* Direct Whatsapp chat link */}
                          <a 
                            href={`https://wa.me/${student.whatsapp.replace('+', '').replace(' ', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 rounded-lg text-xs font-mono text-green-400 flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-green-400/15" /> Chat
                          </a>

                          {col.id === 'Concluídos' && (
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleCertifyComplete(student);
                              }}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-lg text-xs font-mono text-emerald-400 flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                              id={`crm-btn-certify-${student.id}`}
                            >
                              <Award className="w-3.5 h-3.5 text-emerald-400" /> Cert
                            </button>
                          )}

                          {/* Slide controllers as accessible back-up */}
                          <div className="flex gap-0.5 animate-pulse-slow" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                shiftStudentColumn(student.id, student.status, 'prev');
                              }}
                              disabled={student.status === 'Novos'}
                              className="p-0.5 rounded bg-purple-950/20 border border-purple-500/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:cursor-pointer"
                              title="Mover de volta"
                            >
                              <ChevronDown className="w-2.5 h-2.5 transform rotate-90" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                shiftStudentColumn(student.id, student.status, 'next');
                              }}
                              disabled={student.status === 'Inativos'}
                              className="p-0.5 rounded bg-purple-950/20 border border-purple-500/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:cursor-pointer"
                              title="Mover adiante"
                            >
                              <ChevronUp className="w-2.5 h-2.5 transform rotate-90" />
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: ADD MANUAL STUDENT */}
      <AnimatePresence>
        {isAddStudentOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card p-6 rounded-2xl relative border border-purple-500/20"
            >
              <button 
                onClick={() => setIsAddStudentOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-display font-medium text-white mb-4">Adicionar Matrícula Manual (Auditoria Admin)</h3>
              
              <form onSubmit={handleAddNewStudentManual} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Nome Completo</label>
                  <input 
                    type="text" 
                    value={newStudName}
                    onChange={(e) => setNewStudName(e.target.value)}
                    placeholder="Ex: Ana Nogueira"
                    className="w-full bg-[#0a0715] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">E-mail Profissional</label>
                  <input 
                    type="email" 
                    value={newStudEmail}
                    onChange={(e) => setNewStudEmail(e.target.value)}
                    placeholder="ana.nogueira@tech.com"
                    className="w-full bg-[#0a0715] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Número WhatsApp</label>
                  <input 
                    type="text" 
                    value={newStudPhone}
                    onChange={(e) => setNewStudPhone(e.target.value)}
                    placeholder="+55 11 98888-8888"
                    className="w-full bg-[#0a0715] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Curso Alocado</label>
                  <select 
                    value={newStudCourse}
                    onChange={(e) => setNewStudCourse(e.target.value)}
                    className="w-full bg-[#0a0715] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all pt-1 hover:cursor-pointer"
                >
                  Confirmar Matrícula Direta
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CERTIFY SUCCESS MODAL */}
      <AnimatePresence>
        {certStudent && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-card p-6 rounded-2xl relative border-2 border-emerald-500/20 text-center space-y-5"
            >
              <button 
                onClick={() => setCertStudent(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Award className="w-8 h-8 font-bold text-center" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest block">CERTIFICAÇÃO OFICIAL NZILA</span>
                <h3 className="text-lg font-bold font-display text-white">Pronto para Emissão</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                  O aluno {certStudent.name} atingiu a marca de {certStudent.progress}% do curso {certStudent.courseTitle}. O certificado digital quântico de conclusão com assinatura SHA-256 está autorizado.
                </p>
              </div>

              {/* Graphical simulation design of the certificate */}
              <div className="p-4 rounded-lg bg-black/40 border border-purple-500/10 font-mono text-[10.5px] text-gray-300 text-left space-y-2 relative overflow-hidden bg-gradient-to-tr from-[#0e071e] via-[#04030a] to-[#04030a]">
                <div className="absolute top-[-30px] right-[-30px] w-20 h-20 rounded-full bg-purple-600/5 blur-2xl" />
                <div className="flex justify-between items-center text-[9px] text-purple-400 border-b border-purple-950/35 pb-1.5 mb-1.5">
                  <span>NZILA ACADEMY SÃO PAULO</span>
                  <span>REGISTRY: #{certStudent.id.toUpperCase()}</span>
                </div>
                <div>CERTIFICAMOS QUE <span className="text-white font-bold">{certStudent.name.toUpperCase()}</span></div>
                <div>CONCLUIU COM ÊXITO O <span className="text-purple-300 font-semibold">{certStudent.courseTitle.toUpperCase()}</span>.</div>
                <div className="text-[9px] text-gray-500 pt-3 border-t border-purple-950/35 mt-3 flex justify-between">
                  <span>SIGN: ALEX_RIVERA_FOUNDER</span>
                  <span>HASH: AF3D91...CE89</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleSendEmailSimulated(certStudent.email);
                    setCertStudent(null);
                  }}
                  className="flex-grow h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 hover:cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" /> Enviar por E-mail do Aluno
                </button>
                <button
                  onClick={() => setCertStudent(null)}
                  className="px-4 h-10 bg-gray-900 border border-gray-800 hover:bg-gray-850 rounded-lg text-xs font-mono text-gray-300 hover:cursor-pointer transition-colors"
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: COMPREHENSIVE STUDENT DETAIL VIEW */}
      <AnimatePresence>
        {selectedStudentDetail && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-lg bg-[#0e0a1f] border border-purple-500/20 rounded-2xl relative overflow-hidden shadow-2xl font-sans"
            >
              {/* Header Visual Stripe */}
              <div className="h-1.5 bg-gradient-to-r from-purple-600 via-indigo-650 to-cyan-500" />

              <button 
                onClick={() => setSelectedStudentDetail(null)}
                className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full bg-black/45 hover:bg-black/85 text-gray-400 hover:text-white flex items-center justify-center border border-purple-900/30 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="p-4 sm:p-5 space-y-3.5 text-left">
                {/* Profile Header Block */}
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-650 flex items-center justify-center text-sm font-display font-black text-white shadow-md border border-purple-400/20 shrink-0">
                    {selectedStudentDetail.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] text-purple-400 font-mono font-bold uppercase tracking-wider block leading-none">Ficha do Estudante</span>
                    <h3 className="text-base sm:text-lg font-display font-semibold text-white leading-tight truncate">
                      {selectedStudentDetail.name}
                    </h3>
                    <span className="text-[9px] text-gray-400 block font-mono truncate">Matrícula: #{selectedStudentDetail.id.toUpperCase()} • {selectedStudentDetail.registeredAt.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Compact contact grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-black/30 border border-purple-950/20 rounded-lg p-2 flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[8px] text-gray-500 font-mono block leading-none">CONTATO</span>
                      <span className="text-xs text-white font-mono font-medium truncate block">{selectedStudentDetail.whatsapp}</span>
                    </div>
                  </div>
                  <div className="bg-black/30 border border-purple-950/20 rounded-lg p-2 flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <div className="min-w-0 block">
                      <span className="text-[8px] text-gray-500 font-mono block leading-none">E-MAIL</span>
                      <span className="text-xs text-white font-mono font-medium truncate block text-ellipsis overflow-hidden" title={selectedStudentDetail.email}>{selectedStudentDetail.email}</span>
                    </div>
                  </div>
                </div>

                {/* Allocation Box */}
                <div className="bg-[#0b0817c0] border border-purple-500/10 rounded-xl p-3 space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-purple-300">
                      <span>Cursos Ativos</span>
                      <span className="text-[8px] text-gray-400 uppercase">Acesso Liberado</span>
                    </div>
                    
                    <div className="space-y-1 max-h-[85px] overflow-y-auto pr-1 scrollbar-thin">
                      {(selectedStudentDetail.enrolledCourses || [{ courseId: selectedStudentDetail.courseId, courseTitle: selectedStudentDetail.courseTitle }]).map((ec) => (
                        <div 
                          key={ec.courseId} 
                          className="flex justify-between items-center text-[10.5px] bg-[#0c091bc2] border border-purple-500/5 rounded-md px-2.5 py-1 text-gray-200"
                        >
                          <span className="truncate max-w-[80%] text-white/90">
                            📚 {ec.courseTitle}
                          </span>
                          <span className="text-[8px] font-mono font-bold bg-purple-500/15 border border-purple-500/25 text-purple-300 px-1 py-0.5 rounded uppercase shrink-0">
                            Ativo
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add new course selector dropdown */}
                    {courses.filter(c => !(selectedStudentDetail.enrolledCourses || [{ courseId: selectedStudentDetail.courseId }]).some(ec => ec.courseId === c.id)).length > 0 ? (
                      <div className="flex gap-2 pt-1.5 border-t border-purple-500/5">
                        <select
                          value={newCourseToAddId}
                          onChange={(e) => setNewCourseToAddId(e.target.value)}
                          className="bg-[#050308] border border-purple-900/40 text-[10px] text-gray-300 rounded px-2 py-1 font-mono focus:outline-none w-full"
                        >
                          <option value="">-- Adicionar mais um curso --</option>
                          {courses
                            .filter(c => !(selectedStudentDetail.enrolledCourses || [{ courseId: selectedStudentDetail.courseId }]).some(ec => ec.courseId === c.id))
                            .map(c => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))
                          }
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newCourseToAddId) return;
                            const courseFound = courses.find(c => c.id === newCourseToAddId);
                            if (courseFound) {
                              addCourseToStudent(selectedStudentDetail.id, newCourseToAddId);
                              const currentEC = selectedStudentDetail.enrolledCourses || [{ courseId: selectedStudentDetail.courseId, courseTitle: selectedStudentDetail.courseTitle }];
                              const updatedEC = [...currentEC, { courseId: courseFound.id, courseTitle: courseFound.title }];
                              setSelectedStudentDetail(prev => prev ? { ...prev, enrolledCourses: updatedEC } : null);
                              setNewCourseToAddId('');
                            }
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Adicionar
                        </button>
                      </div>
                    ) : (
                      <span className="text-[8.5px] text-gray-500 font-mono block italic select-none text-center">
                        Todos os cursos disponíveis estão ativos.
                      </span>
                    )}
                  </div>

                  {/* Voucher tracking info */}
                  <div className="pt-2 border-t border-purple-950/20 flex justify-between items-center text-[9px] font-mono text-gray-400">
                    <span>CÓDIGO DE ATIVAÇÃO:</span>
                    <span className="text-cyan-400 bg-cyan-950/40 border border-cyan-500/10 rounded px-1.5 py-0.5 font-bold uppercase tracking-wide">
                      {selectedStudentDetail.codeUsed}
                    </span>
                  </div>
                </div>

                {/* Unified Funnel & Academic Progress Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Dynamic Funnel Position Selector */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-gray-400 block uppercase tracking-wider">Estágio no CRM</label>
                    <div className="grid grid-cols-2 gap-1 font-mono">
                      {columns.map(col => {
                        const isActive = selectedStudentDetail.status === col.id;
                        return (
                          <button
                            key={col.id}
                            onClick={() => {
                              updateStudentStatus(selectedStudentDetail.id, col.id);
                              setSelectedStudentDetail(prev => prev ? { ...prev, status: col.id } : null);
                            }}
                            className={`py-1 px-1 rounded text-center border transition-all text-[9.5px] cursor-pointer font-semibold ${
                              isActive 
                                ? 'bg-purple-600 border-purple-400 text-white shadow-sm opacity-100' 
                                : 'bg-black/30 border-purple-950/20 text-gray-400 hover:text-white'
                            }`}
                          >
                            {col.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operational Slider for Academic progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9.5px] font-mono text-gray-400">
                      <span className="uppercase tracking-wider">Progresso: <span className="text-cyan-400 font-bold">{selectedStudentDetail.progress}%</span></span>
                    </div>
                    
                    <div className="bg-black/40 border border-purple-950/15 p-2 rounded-lg space-y-1">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={editDetailProgressVal}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditDetailProgressVal(val);
                          updateStudent(selectedStudentDetail.id, { progress: val });
                          setSelectedStudentDetail(prev => prev ? { ...prev, progress: val } : null);
                        }}
                        className="w-full h-1.5 bg-[#0e0722] rounded-full appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-[8px] font-mono text-gray-500 leading-none">
                        <span>Faltando</span>
                        <span>Completo</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Compact quick actions bar */}
                <div className="pt-2.5 flex justify-end gap-2.5 border-t border-purple-950/25">
                  <a
                    href={`https://wa.me/${selectedStudentDetail.whatsapp.replace('+', '').replace(' ', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" /> Iniciar Suporte Whatsapp 
                  </a>
                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza de que deseja apagar o aluno ${selectedStudentDetail.name} do sistema de forma permanente?`)) {
                        deleteStudent(selectedStudentDetail.id);
                        setSelectedStudentDetail(null);
                      }
                    }}
                    className="py-2 px-3 bg-red-950/20 border border-red-500/20 hover:bg-red-900/30 rounded-lg text-xs font-mono text-red-400 font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Apagar Estudante Permanentemente"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                  <button
                    onClick={() => {
                      handleSendEmailSimulated(selectedStudentDetail.email);
                    }}
                    className="py-2 px-3 bg-[#1d123e] border border-purple-500/10 hover:bg-purple-850/20 rounded-lg text-xs font-mono text-purple-300 font-bold transition-all cursor-pointer"
                  >
                    Auditar Acesso
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
