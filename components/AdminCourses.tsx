'use client';

import React, { useState, useRef } from 'react';
import { useApp, Course, Lesson } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Layers, 
  X, 
  Save, 
  Edit3, 
  ArrowLeft, 
  Trash2, 
  CheckCircle,
  Video,
  Sparkles,
  FileText,
  UploadCloud,
  Settings,
  Link,
  Paperclip,
  BookOpenCheck,
  Laptop
} from 'lucide-react';

export default function AdminCourses() {
  const { courses, addNewCourse, updateCourse, deleteCourse } = useApp();
  
  // Create New Course state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [duration, setDuration] = useState('180 horas');
  const [category, setCategory] = useState<'Tech' | 'Cyber' | 'Dev' | 'Design'>('Tech');
  const [lessonsRaw, setLessonsRaw] = useState('Módulo 1: Fundamentos\n- Introdução ao Algoritmo\n- Conexão de Redes');
  const [newCourseImage, setNewCourseImage] = useState('');
  const [price, setPrice] = useState('120000');

  // Interactive Edit Syllabus state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editCategory, setEditCategory] = useState<'Tech' | 'Cyber' | 'Dev' | 'Design'>('Tech');
  const [editCourseImage, setEditCourseImage] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Sub-modules creation / lessons inline states
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [activeModuleIndexForNewLesson, setActiveModuleIndexForNewLesson] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('20 min');

  // Interactive Lesson Editing modal states (General + Content + Downloads)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingLessonModIndex, setEditingLessonModIndex] = useState<number | null>(null);
  const [editingLessonIdx, setEditingLessonIdx] = useState<number | null>(null);
  
  // Field values for Lesson Custom Editor
  const [lessonEditTitle, setLessonEditTitle] = useState('');
  const [lessonEditDuration, setLessonEditDuration] = useState('');
  const [lessonEditDescription, setLessonEditDescription] = useState('');
  const [lessonEditContentType, setLessonEditContentType] = useState<'video' | 'ebook'>('video');
  const [lessonEditVideoUrl, setLessonEditVideoUrl] = useState('');
  const [lessonEditEbookContent, setLessonEditEbookContent] = useState('');
  const [lessonEditEbookUrl, setLessonEditEbookUrl] = useState('');
  const [lessonEditEbookFileName, setLessonEditEbookFileName] = useState('');
  const [lessonEditMaterials, setLessonEditMaterials] = useState<Lesson['materials']>([]);

  // Local state for adding attachment/material
  const [newMatName, setNewMatName] = useState('');
  const [newMatType, setNewMatType] = useState<'pdf' | 'zip' | 'link' | 'doc'>('pdf');
  const [newMatUrl, setNewMatUrl] = useState('');
  const [newMatSize, setNewMatSize] = useState('4.2 MB');

  // File upload simulation states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ebookFileInputRef = useRef<HTMLInputElement>(null);
  const materialFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const editCoverFileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [ebookUploadProgress, setEbookUploadProgress] = useState<number | null>(null);
  const [uploadedEbookName, setUploadedEbookName] = useState<string | null>(null);

  const [materialUploadProgress, setMaterialUploadProgress] = useState<number | null>(null);
  const [uploadedMaterialName, setUploadedMaterialName] = useState<string | null>(null);

  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [editCoverProgress, setEditCoverProgress] = useState<number | null>(null);

  const [activeLessonTab, setActiveLessonTab] = useState<'general' | 'content' | 'materials'>('general');

  const selectCourseForEditing = (course: Course) => {
    setSelectedCourse(course);
    setEditTitle(course.title);
    setEditTagline(course.tagline);
    setEditDuration(course.duration);
    setEditCategory(course.category);
    setEditCourseImage(course.image || '');
    setEditPrice(course.price ? String(course.price) : '120000');
    
    // reset other interaction inputs
    setNewModuleName('');
    setIsAddingModule(false);
    setActiveModuleIndexForNewLesson(null);
    setNewLessonTitle('');
    setNewLessonDuration('20 min');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tagline) return;

    // Transform raw text into proper structure
    const lessonsList: Course['lessonsList'] = [];
    const lines = lessonsRaw.split('\n');
    let currentModule: { moduleName: string; lessons: any[] } | null = null;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('Módulo') || trimmed.toUpperCase().startsWith('MODULO')) {
        if (currentModule) {
          lessonsList.push(currentModule);
        }
        currentModule = { moduleName: trimmed, lessons: [] };
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const lessonTitle = trimmed.substring(1).trim();
        if (currentModule) {
          currentModule.lessons.push({
            id: `c-add-${Date.now()}-${index}`,
            title: lessonTitle,
            duration: '25 min',
            contentType: 'video' as const,
            description: '',
            videoUrl: '',
            materials: []
          });
        }
      }
    });

    if (currentModule) {
      lessonsList.push(currentModule);
    }

    if (lessonsList.length === 0) {
      lessonsList.push({
        moduleName: 'Módulo 1: Fundamentos Gerais',
        lessons: [
          { 
            id: `c-add-${Date.now()}-1`, 
            title: 'Visão Geral do Curso', 
            duration: '15 min',
            contentType: 'video' as const,
            description: 'Visão geral e escopo teórico das aulas gerais do programa letivo.',
            videoUrl: '',
            materials: []
          }
        ]
      });
    }

    const randomImages = [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ];

    const newCourseObj: Course = {
      id: `course-${Date.now()}`,
      title,
      tagline,
      duration,
      modulesCount: lessonsList.length,
      category,
      image: newCourseImage || randomImages[Math.floor(Math.random() * randomImages.length)],
      studentsCount: 0,
      lessonsList,
      price: Number(price) || 120000
    };

    addNewCourse(newCourseObj);
    
    // Reset inputs
    setTitle('');
    setTagline('');
    setDuration('180 horas');
    setNewCourseImage('');
    setCoverProgress(null);
    setPrice('120000');
    setIsAddOpen(false);
  };

  // Update Base Metadata
  const handleUpdateCourseDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const updatedFields = {
      title: editTitle,
      tagline: editTagline,
      duration: editDuration,
      category: editCategory,
      image: editCourseImage,
      price: Number(editPrice) || 120000
    };

    updateCourse(selectedCourse.id, updatedFields);

    // Sync state locally
    setSelectedCourse({
      ...selectedCourse,
      ...updatedFields
    });

    setEditCoverProgress(null);
  };

  // Add a Module
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !newModuleName.trim()) return;

    const updatedSyllabus = [
      ...selectedCourse.lessonsList,
      {
        moduleName: newModuleName.trim(),
        lessons: []
      }
    ];

    const updated = {
      ...selectedCourse,
      lessonsList: updatedSyllabus,
      modulesCount: updatedSyllabus.length
    };

    updateCourse(selectedCourse.id, updated);
    setSelectedCourse(updated);
    setNewModuleName('');
    setIsAddingModule(false);
  };

  // Delete a Module
  const handleDeleteModule = (modIndex: number) => {
    if (!selectedCourse) return;
    if (!confirm('Deseja realmente remover este módulo acadêmico e todas as suas aulas permanentes?')) return;

    const updatedSyllabus = selectedCourse.lessonsList.filter((_, i) => i !== modIndex);
    const updated = {
      ...selectedCourse,
      lessonsList: updatedSyllabus,
      modulesCount: updatedSyllabus.length
    };

    updateCourse(selectedCourse.id, updated);
    setSelectedCourse(updated);
  };

  // Add lesson internally inline
  const handleAddLesson = (modIndex: number) => {
    if (!selectedCourse || !newLessonTitle.trim()) return;

    const updatedSyllabus = selectedCourse.lessonsList.map((mod, idx) => {
      if (idx === modIndex) {
        return {
          ...mod,
          lessons: [
            ...mod.lessons,
            {
              id: `c-less-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              title: newLessonTitle.trim(),
              duration: newLessonDuration.trim() || '20 min',
              completed: false,
              locked: false,
              contentType: 'video' as const,
              description: '',
              videoUrl: '',
              materials: []
            }
          ]
        };
      }
      return mod;
    });

    const updated = {
      ...selectedCourse,
      lessonsList: updatedSyllabus
    };

    updateCourse(selectedCourse.id, updated);
    setSelectedCourse(updated);
    setActiveModuleIndexForNewLesson(null);
    setNewLessonTitle('');
    setNewLessonDuration('20 min');
  };

  // Delete lesson internally
  const handleDeleteLesson = (modIndex: number, lessonIndex: number) => {
    if (!selectedCourse) return;

    const updatedSyllabus = selectedCourse.lessonsList.map((mod, idx) => {
      if (idx === modIndex) {
        return {
          ...mod,
          lessons: mod.lessons.filter((_, lIdx) => lIdx !== lessonIndex)
        };
      }
      return mod;
    });

    const updated = {
      ...selectedCourse,
      lessonsList: updatedSyllabus
    };

    updateCourse(selectedCourse.id, updated);
    setSelectedCourse(updated);
  };

  // Open full configuration panel for a specific lesson
  const handleOpenConfigureLesson = (modIndex: number, lessonIndex: number) => {
    if (!selectedCourse) return;
    const lesson = selectedCourse.lessonsList[modIndex].lessons[lessonIndex];
    if (!lesson) return;

    setEditingLesson(lesson);
    setEditingLessonModIndex(modIndex);
    setEditingLessonIdx(lessonIndex);

    // Setup form binds
    setLessonEditTitle(lesson.title || '');
    setLessonEditDuration(lesson.duration || '20 min');
    setLessonEditDescription(lesson.description || '');
    setLessonEditContentType(lesson.contentType || 'video');
    setLessonEditVideoUrl(lesson.videoUrl || '');
    setLessonEditEbookContent(lesson.ebookContent || '');
    setLessonEditEbookUrl(lesson.ebookUrl || '');
    setLessonEditEbookFileName(lesson.ebookFileName || '');
    setLessonEditMaterials(lesson.materials || []);

    // Reset upload status & tabs
    setUploadProgress(null);
    setUploadedFileName(null);
    setEbookUploadProgress(null);
    setUploadedEbookName(null);
    setActiveLessonTab('general');
  };

  // Save detailed lesson stats
  const handleSaveLessonConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || editingLessonModIndex === null || editingLessonIdx === null) return;

    const updatedSyllabus = selectedCourse.lessonsList.map((mod, mIdx) => {
      if (mIdx === editingLessonModIndex) {
        const updatedLessons = mod.lessons.map((less, lIdx) => {
          if (lIdx === editingLessonIdx) {
            return {
              ...less,
              title: lessonEditTitle,
              duration: lessonEditDuration,
              description: lessonEditDescription,
              contentType: lessonEditContentType,
              videoUrl: lessonEditVideoUrl,
              ebookContent: lessonEditEbookContent,
              ebookUrl: lessonEditEbookUrl,
              ebookFileName: lessonEditEbookFileName,
              materials: lessonEditMaterials
            };
          }
          return less;
        });
        return {
          ...mod,
          lessons: updatedLessons
        };
      }
      return mod;
    });

    const updated = {
      ...selectedCourse,
      lessonsList: updatedSyllabus
    };

    updateCourse(selectedCourse.id, updated);
    setSelectedCourse(updated);

    // Close modal
    setEditingLesson(null);
    setEditingLessonModIndex(null);
    setEditingLessonIdx(null);
  };

  // Simulated drag-and-drop file upload triggers the file input element click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const blobUrl = URL.createObjectURL(file);
    setLessonEditVideoUrl(blobUrl);
    setUploadProgress(100);
  };

  const triggerEbookFileInput = () => {
    ebookFileInputRef.current?.click();
  };

  const handleEbookFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedEbookName(file.name);
    const blobUrl = URL.createObjectURL(file);
    setLessonEditEbookUrl(blobUrl);
    setLessonEditEbookFileName(file.name);
    setEbookUploadProgress(100);
  };

  const triggerMaterialFileInput = () => {
    materialFileInputRef.current?.click();
  };

  const handleMaterialFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedMaterialName(file.name);
    setNewMatName(file.name);

    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    setNewMatSize(sizeStr);

    const blobUrl = URL.createObjectURL(file);
    setNewMatUrl(blobUrl);
    setMaterialUploadProgress(100);
  };

  const triggerCoverFileInput = () => {
    coverFileInputRef.current?.click();
  };

  const handleCoverFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverProgress(25);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setNewCourseImage(base64String);
      setCoverProgress(100);
    };
    reader.readAsDataURL(file);
  };

  const triggerEditCoverFileInput = () => {
    editCoverFileInputRef.current?.click();
  };

  const handleEditCoverFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditCoverProgress(25);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setEditCourseImage(base64String);
      setEditCoverProgress(100);
    };
    reader.readAsDataURL(file);
  };

  // Add material row inline
  const handleAddNewMaterialRow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) return;

    const newMaterialItem = {
      id: `m-item-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      name: newMatName.trim(),
      type: newMatType,
      url: newMatUrl.trim() || 'https://v8.dev',
      size: newMatSize || '2.4 MB'
    };

    setLessonEditMaterials([
      ...(lessonEditMaterials || []),
      newMaterialItem
    ]);

    // reset rows
    setNewMatName('');
    setNewMatUrl('');
    setNewMatSize('4.2 MB');
    setUploadedMaterialName(null);
    setMaterialUploadProgress(null);
  };

  // Delete material row
  const handleDeleteMaterialRow = (id: string) => {
    setLessonEditMaterials((lessonEditMaterials || []).filter(item => item.id !== id));
  };


  const categoriesColors: Record<string, string> = {
    'Tech': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Cyber': 'text-red-400 bg-red-400/10 border-red-400/20',
    'Dev': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    'Design': 'text-pink-400 bg-pink-500/10 border-pink-500/20'
  };

  return (
    <div className="space-y-6 py-2 relative">
      
      <AnimatePresence mode="wait">
        {!selectedCourse ? (
          // GRID & BASE COURSES VIEW
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header toolbar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-amber-950/20 pb-4">
              <div>
                <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" /> Grade de Masterclasses
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Gestão estratégica de ementas, duração de disciplinas e adição de novas masterclasses existentes.
                </p>
              </div>

              <button 
                onClick={() => setIsAddOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                id="courses-btn-add"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Curso
              </button>
            </div>

            {/* Grid of Existing Courses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map(course => (
                <div 
                  key={course.id} 
                  onClick={() => selectCourseForEditing(course)}
                  className="glass-card flex flex-col rounded-xl overflow-hidden border border-amber-500/10 hover:border-amber-500/30 transition-all bg-black/40 hover:scale-[1.01] hover:shadow-lg hover:shadow-amber-550/5 group hover:cursor-pointer"
                >
                  {/* Visual Header */}
                  <div className="h-32 w-full relative bg-amber-950/30">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover opacity-50 filter brightness-75 transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0813] via-transparent to-transparent" />
                    <span className={`absolute top-3 left-3 border text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${categoriesColors[course.category]}`}>
                      {course.category}
                    </span>
                  </div>

                  {/* Content info */}
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold font-display text-white line-clamp-1 group-hover:text-amber-300 transition-colors">{course.title}</h3>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{course.tagline}</p>
                    </div>

                    <div className="border-t border-amber-950/15 pt-3.5 flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-400" /> {course.duration}</span>
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-cyan-400" /> {course.lessonsList.length} Módulos</span>
                    </div>
                  </div>

                  {/* Hover Actions Bar Hint */}
                  <div className="bg-amber-950/10 border-t border-amber-900/10 py-2.5 px-4 text-[10px] font-mono text-amber-300 flex items-center justify-between group-hover:bg-amber-900/10">
                    <span>Gerenciar Aulas e Módulos</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if(window.confirm('Tem a certeza que deseja apagar permanentemente este curso?')) {
                            deleteCourse(course.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 transition-opacity flex items-center gap-1 bg-rose-950/30 px-2 py-1 rounded border border-rose-500/20"
                        title="Apagar Curso"
                      >
                        <Trash2 className="w-3 h-3" /> Apagar
                      </button>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">Gerir &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          // DETAILED WORKSPACE VIEW (MANAGE MODULES & LESSONS INSIDE THE COURSE)
          <motion.div
            key="edit-workspace"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            {/* Header and Back navigation */}
            <div className="flex items-center justify-between border-b border-amber-950/20 pb-4">
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-xs font-mono text-gray-450 text-gray-300 hover:text-white flex items-center gap-1 bg-amber-950/10 border border-amber-500/10 hover:border-amber-500/25 px-3 py-1.5 rounded-lg transition-all hover:cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Masterclasses
              </button>

              <span className="text-[10px] sm:text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block bg-cyan-950/20 py-1.5 px-3 rounded-md border border-cyan-500/20">
                WORKSPACE GERAL DE EMENTAS
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (Metadata edit fields) - 5 Cols */}
              <div className="lg:col-span-5 space-y-4">
                <div className="glass-card p-5 rounded-2xl border border-amber-500/15 bg-black/40 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block uppercase font-display">Informações da Masterclass</span>
                    <h3 className="text-sm font-display font-medium text-white">{selectedCourse.title}</h3>
                  </div>

                  <form onSubmit={handleUpdateCourseDetails} className="space-y-3.5 pt-2 border-t border-amber-950/20 text-xs text-sans">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 block">Título Oficial</label>
                      <input 
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-gray-400 block">Categoria</label>
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value as any)}
                          className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="Tech">Tech</option>
                          <option value="Dev">Dev</option>
                          <option value="Cyber">Cyber</option>
                          <option value="Design">Design</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-gray-400 block">Duração Acadêmica</label>
                        <input 
                          type="text"
                          value={editDuration}
                          onChange={e => setEditDuration(e.target.value)}
                          className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 block">Valor do Curso (KZ)</label>
                      <input 
                        type="number"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                        placeholder="Ex: 120000"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 block">Ementa / Slogan Sumarizado</label>
                      <textarea 
                        value={editTagline}
                        onChange={e => setEditTagline(e.target.value)}
                        className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg p-3 text-xs text-white font-sans min-h-[90px] focus:outline-none leading-relaxed"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 block">Identidade Visual (Capa do Curso)</label>
                      <div className="flex items-center gap-3 bg-[#0a0715] border border-amber-900/30 p-2.5 rounded-lg">
                        {editCourseImage ? (
                          <img 
                            src={editCourseImage} 
                            alt="Capa masterclass" 
                            className="w-14 h-10 object-cover rounded border border-amber-500/20 bg-amber-950/20 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-10 rounded border border-dashed border-gray-700 bg-black/40 flex items-center justify-center text-[10px] text-gray-500 font-mono">
                            Sem Capa
                          </div>
                        )}
                        <div className="flex-grow space-y-1 min-w-0">
                          <input 
                            type="text"
                            value={editCourseImage}
                            onChange={e => setEditCourseImage(e.target.value)}
                            placeholder="https://exemplo.com/capa.jpg"
                            className="w-full bg-black/40 border border-amber-900/15 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                          />
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="file" 
                              ref={editCoverFileInputRef}
                              onChange={handleEditCoverFileUploadChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={triggerEditCoverFileInput}
                              className="text-[9px] font-mono text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <UploadCloud className="w-3 h-3" /> Carregar Capa Local
                            </button>
                            {editCoverProgress !== null && (
                              <span className="text-[9px] font-mono text-cyan-400 font-bold">{editCoverProgress}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors hover:cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Salvar Configurações Gerais
                    </button>
                  </form>
                </div>

                {/* Metadata stats card */ }
                <div className="glass-card p-4 rounded-xl border border-amber-500/10 bg-[#0c091d]/20 text-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-gray-400 block">AUDITORIA DE BANCO</span>
                    <span className="block text-[#C9A84C] font-semibold">Integridade Acadêmica</span>
                    <span className="block text-[10px] text-gray-500 font-mono leading-relaxed">
                      Módulos ativos: {selectedCourse.lessonsList.length} <br />
                      Aulas totais registradas: {selectedCourse.lessonsList.flatMap(m => m.lessons).length}
                    </span>
                  </div>
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>

              {/* Right Column (Dynamic Syllabus / Modules and lessons interactive addition) - 7 Cols */}
              <div className="lg:col-span-7 space-y-4">
                <div className="glass-card p-5 rounded-2xl border border-amber-500/15 bg-black/40 space-y-4">
                  
                  {/* Title Bar */}
                  <div className="flex items-center justify-between gap-4 border-b border-amber-950/15 pb-3">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-display font-medium text-white flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-amber-400" /> Gerenciador de Aulas Nzila
                      </h3>
                      <p className="text-[10px] text-gray-400">Monte a estrutura de módulos e configure os conteúdos/links de cada aula.</p>
                    </div>

                    {!isAddingModule ? (
                      <button
                        onClick={() => setIsAddingModule(true)}
                        className="px-2.5 py-1.5 bg-amber-900/40 hover:bg-amber-900/70 text-amber-200 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-[10px] font-mono flex items-center gap-1 hover:cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Módulo
                      </button>
                    ) : null}
                  </div>

                  {/* Add module form panel */}
                  {isAddingModule && (
                    <form onSubmit={handleAddModule} className="p-3.5 bg-amber-950/10 border border-amber-500/15 rounded-xl space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-300 block">Nome do Novo Módulo / Seção Acadêmica</label>
                        <input 
                          type="text"
                          value={newModuleName}
                          onChange={e => setNewModuleName(e.target.value)}
                          placeholder="Ex: Módulo 4: Avançado em Kernel Drivers"
                          className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setIsAddingModule(false)}
                          className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white font-mono"
                        >
                          Cancelar Secção
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-mono font-medium flex items-center gap-1 transition-colors hover:cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Confirmar Módulo
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Syllabus tree iteration */}
                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                    {selectedCourse.lessonsList.map((mod, modIndex) => {
                      const isAddingLessonHere = activeModuleIndexForNewLesson === modIndex;
                      
                      return (
                        <div key={modIndex} className="p-4 rounded-xl border border-amber-950/40 bg-amber-950/5 space-y-3.5 relative overflow-hidden">
                          
                          {/* Module title and Actions */}
                          <div className="flex justify-between items-start gap-4 pb-2 border-b border-amber-950/15">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 font-display">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow shadow-amber-500/35 animate-pulse" />
                              <span className="line-clamp-1">{mod.moduleName}</span>
                            </div>

                            <button
                              onClick={() => handleDeleteModule(modIndex)}
                              className="text-red-400 hover:text-red-300 p-1 flex items-center gap-1 text-[10px] font-mono hover:underline hover:cursor-pointer transition-colors"
                              title="Remover módulo"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </button>
                          </div>

                          {/* Sub-lessons checklist */}
                          <div className="space-y-2 pl-3 border-l border-amber-900/20">
                            {mod.lessons.map((lesson, lessonIndex) => (
                              <div 
                                key={lesson.id} 
                                className="flex justify-between items-center bg-black/25 hover:bg-black/40 border border-amber-950/10 p-2.5 rounded-lg text-xs transition-colors"
                              >
                                <div className="space-y-0.5 min-w-0 pr-2 select-none">
                                  <span className="text-white block font-sans font-medium line-clamp-1">{lesson.title}</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] text-[#c084fc] font-mono uppercase bg-amber-950/35 px-1 rounded border border-amber-500/10">{lesson.contentType || 'video'}</span>
                                    <span className="text-[10px] text-gray-500 font-mono">Duração: {lesson.duration}</span>
                                    {lesson.materials && lesson.materials.length > 0 && (
                                      <span className="text-[9px] text-cyan-400 font-mono bg-cyan-950/20 px-1 rounded border border-cyan-500/5">+{lesson.materials.length} anexos</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  {/* Config detailed stats */}
                                  <button
                                    onClick={() => handleOpenConfigureLesson(modIndex, lessonIndex)}
                                    className="p-1 px-2.5 rounded bg-amber-950/30 border border-amber-500/20 text-amber-300 hover:text-white hover:bg-amber-600/20 transition-all hover:cursor-pointer font-mono text-[10px] flex items-center gap-1"
                                    title="Editar Conteúdo e Descrição"
                                  >
                                    <Settings className="w-3 h-3" /> Config
                                  </button>

                                  <button
                                    onClick={() => handleDeleteLesson(modIndex, lessonIndex)}
                                    className="text-gray-500 hover:text-red-400 p-1.5 hover:cursor-pointer transition-colors"
                                    title="Remover Aula"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {mod.lessons.length === 0 && (
                              <p className="text-[11px] text-gray-500 italic py-1">Nenhuma aula cadastrada nesta seção. Adicione pelo botão abaixo.</p>
                            )}
                          </div>

                          {/* Lesson adding configuration */}
                          {isAddingLessonHere ? (
                            <div className="p-3 bg-black/40 border border-amber-950/30 rounded-lg space-y-3 mt-3">
                              <span className="text-[10px] font-mono text-[#C9A84C] block font-bold">RÁPIDO REGISTRO DE AULA</span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                                <input 
                                  type="text" 
                                  placeholder="Ex: Aula 3: Configuração do TLS 1.3"
                                  value={newLessonTitle}
                                  onChange={e => setNewLessonTitle(e.target.value)}
                                  className="sm:col-span-8 bg-[#0a0715] border border-amber-900/30 text-xs p-2 rounded text-white focus:outline-none focus:border-amber-500/30"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Duração (ex: 20 min)"
                                  value={newLessonDuration}
                                  onChange={e => setNewLessonDuration(e.target.value)}
                                  className="sm:col-span-4 bg-[#0a0715] border border-amber-900/30 text-xs p-2 rounded text-white focus:outline-none focus:border-amber-500/30"
                                />
                              </div>

                              <p className="text-[9px] text-[#C9A84C]/70 font-mono leading-normal">
                                Dica: Após salvar, clique em <strong className="text-cyan-300 font-bold">&quot;Config&quot;</strong> ao lado da aula para cadastrar as descrições, subir vídeos ou ebooks, e anexar PDFs acadêmicos!
                              </p>

                              <div className="flex gap-2 justify-end text-xs pt-1">
                                <button 
                                  type="button"
                                  onClick={() => setActiveModuleIndexForNewLesson(null)}
                                  className="text-[11px] font-mono text-gray-400 hover:text-white px-2 py-1"
                                >
                                  Cancelar
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleAddLesson(modIndex)}
                                  className="bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-mono px-3.5 py-1.5 rounded-lg hover:cursor-pointer transition-colors"
                                >
                                  Inserir Aula
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveModuleIndexForNewLesson(modIndex);
                                setNewLessonTitle('');
                                setNewLessonDuration('20 min');
                              }}
                              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 mt-2 hover:cursor-pointer hover:underline transition-colors block"
                            >
                              <Plus className="w-3.5 h-3.5" /> Adicionar Nova Aula no Módulo
                            </button>
                          )}

                        </div>
                      );
                    })}

                    {selectedCourse.lessonsList.length === 0 && (
                      <div className="text-center py-8 text-xs text-gray-500 space-y-2">
                        <p>Este curso ainda não possui ementas de conteúdo programático.</p>
                        <p className="text-[10px] text-amber-400">Clique em &quot;Adicionar Módulo&quot; acima para estruturar matérias.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED MODAL: COMPLETE LESSON CONFIGURATION (GENERAL + DYNAMIC VIDEO UPLOADER / EBOOK + MATERIALS DOWNLOADS) */}
      <AnimatePresence>
        {editingLesson && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#090615] border border-amber-500/25 rounded-2xl relative shadow-2xl p-6 overflow-hidden my-8"
            >
              <button 
                onClick={() => {
                  setEditingLesson(null);
                  setEditingLessonModIndex(null);
                  setEditingLessonIdx(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-amber-950/40 p-1.5 rounded-full border border-amber-500/10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/35 border border-amber-550/10 px-3 py-1 rounded-md w-max uppercase tracking-wider mb-2">
                <Settings className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" /> Configurações Detalhadas de Aula
              </div>

              <h3 className="text-base sm:text-lg font-display font-bold text-white mb-4">
                Redefinindo: <span className="text-amber-300 font-medium">{editingLesson.title}</span>
              </h3>

              {/* Compartmentalized Tab Selectors */}
              <div className="flex border-b border-amber-950/40 mb-5 text-xs font-mono gap-1 font-bold">
                <button
                  type="button"
                  onClick={() => setActiveLessonTab('general')}
                  className={`px-3 py-2.5 border-b-2 hover:cursor-pointer transition-all flex items-center gap-1.5 ${activeLessonTab === 'general' ? 'border-amber-500 text-amber-300 bg-amber-500/5' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  <Laptop className="w-3.5 h-3.5" /> Metadados Básicos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLessonTab('content')}
                  className={`px-3 py-2.5 border-b-2 hover:cursor-pointer transition-all flex items-center gap-1.5 ${activeLessonTab === 'content' ? 'border-amber-500 text-amber-300 bg-amber-500/5' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  <Video className="w-3.5 h-3.5" /> Conteúdo (Vídeo/E-book)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLessonTab('materials')}
                  className={`px-3 py-2.5 border-b-2 hover:cursor-pointer transition-all flex items-center gap-1.5 ${activeLessonTab === 'materials' ? 'border-amber-500 text-amber-300 bg-amber-500/5' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  <FileText className="w-3.5 h-3.5" /> Materiais de Apoio
                </button>
              </div>

              <form onSubmit={handleSaveLessonConfig} className="space-y-4 text-xs font-sans text-white">
                
                {/* 1. GENERAL METADATA TAB */}
                {activeLessonTab === 'general' && (
                  <div className="space-y-4 py-1 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-8 space-y-1.5">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Título Técnico da Aula</label>
                        <input 
                          type="text" 
                          value={lessonEditTitle}
                          onChange={(e) => setLessonEditTitle(e.target.value)}
                          className="w-full bg-[#05030d] border border-amber-900/30 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/40"
                          required
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Duração Estimada</label>
                        <input 
                          type="text" 
                          value={lessonEditDuration}
                          onChange={(e) => setLessonEditDuration(e.target.value)}
                          className="w-full bg-[#05030d] border border-amber-900/30 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Ementa de Aula / Resumo Explicativo</label>
                      <textarea 
                        value={lessonEditDescription}
                        onChange={(e) => setLessonEditDescription(e.target.value)}
                        placeholder="Nesta aula, abordamos tópicos de extrema complexidade de engenharia de software e cibersegurança..."
                        className="w-full bg-[#05030d] border border-amber-900/30 rounded-lg p-3 text-xs text-white font-sans min-h-[120px] focus:outline-none focus:border-amber-500/40 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* 2. DYNAMIC BROADCAST CONTENT TAB (HOSTED VIDEO, LOCAL UPLOAD VISUALS, OR EBOOK WRITING) */}
                {activeLessonTab === 'content' && (
                  <div className="space-y-4 py-1 animate-fadeIn">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Formato de Transmissão Primário</label>
                      <div className="grid grid-cols-2 gap-3">
                        
                        <button
                          type="button"
                          onClick={() => setLessonEditContentType('video')}
                          className={`p-3 rounded-xl border font-mono font-medium flex flex-col items-center justify-center gap-1.5 hover:cursor-pointer transition-all ${
                            lessonEditContentType === 'video'
                              ? 'border-amber-500 bg-amber-500/10 text-white'
                              : 'border-amber-950/35 bg-[#05030d] text-gray-400'
                          }`}
                        >
                          <Video className="w-5 h-5" /> Videoaula (Hospedagem / Upload)
                        </button>

                        <button
                          type="button"
                          onClick={() => setLessonEditContentType('ebook')}
                          className={`p-3 rounded-xl border font-mono font-medium flex flex-col items-center justify-center gap-1.5 hover:cursor-pointer transition-all ${
                            lessonEditContentType === 'ebook'
                              ? 'border-amber-500 bg-amber-500/10 text-white'
                              : 'border-amber-950/35 bg-[#05030d] text-gray-400'
                          }`}
                        >
                          <BookOpenCheck className="w-5 h-5" /> E-Book Acadêmico (Leitura Direta)
                        </button>

                      </div>
                    </div>

                    {lessonEditContentType === 'video' ? (
                      <div className="space-y-4 border-t border-amber-950/20 pt-3">
                        
                        {/* Option A: YouTube/Vimeo Custom Video URL embed */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Opção A: Link Externo Incorporado (YouTube, Vimeo, etc.)</label>
                          <input 
                            type="text" 
                            value={lessonEditVideoUrl}
                            onChange={(e) => setLessonEditVideoUrl(e.target.value)}
                            placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            className="w-full bg-[#05030d] border border-amber-900/30 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none"
                          />
                          <p className="text-[9px] text-gray-500 font-mono">Nosso reprodutor converterá o link de exibição convencional em iframe automático.</p>
                        </div>

                        {/* Option B: Local Video File Uploader */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Opção B: Carregar Arquivo de Vídeo do meu Computador para a Nzila</label>
                          
                          <div 
                            onClick={triggerFileInput}
                            className="border-2 border-dashed border-amber-900/30 hover:border-amber-500/40 rounded-xl p-5 text-center bg-[#05030d] hover:bg-amber-950/5 transition-all hover:cursor-pointer flex flex-col items-center justify-center gap-2"
                          >
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              onChange={handleFileUploadChange}
                              accept="video/*"
                              className="hidden"
                            />
                            <UploadCloud className="w-8 h-8 text-amber-400 animate-pulse" />
                            <div>
                              <span className="block text-xs font-semibold text-white">Clique para selecionar ou arraste o vídeo</span>
                              <span className="block text-[10px] text-gray-500 font-mono mt-0.5">MP4, WEBM ou MKV (Suporta arquivos grandes)</span>
                            </div>
                          </div>

                          {/* Render Upload Progress */}
                          {uploadProgress !== null && (
                            <div className="bg-[#0b0816] p-3 rounded-lg border border-amber-500/10 space-y-2 animate-fadeIn">
                              <div className="flex justify-between font-mono text-[10px]">
                                <span className="text-amber-300">Enviando: {uploadedFileName || 'video.mp4'}</span>
                                <span className="text-cyan-400 font-bold">{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-amber-950/40 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-cyan-400 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                              </div>
                              {uploadProgress === 100 && (
                                <span className="block text-[9px] text-emerald-400 font-mono text-right font-bold">✓ Upload efetuado com sucesso em buffer local!</span>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    ) : (
                      // Option Ebook text editor
                      <div className="space-y-4 border-t border-amber-950/20 pt-3 animate-fadeIn">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Option A: Upload Ebook file */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Opção A: Carregar Arquivo de E-Book (PDF, EPUB)</label>
                            
                            <div 
                              onClick={triggerEbookFileInput}
                              className="border border-dashed border-amber-500/20 hover:border-amber-500/50 rounded-lg p-3 text-center bg-black/40 hover:bg-[#120822]/20 transition-all hover:cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[96px]"
                            >
                              <input 
                                type="file" 
                                ref={ebookFileInputRef}
                                onChange={handleEbookFileUploadChange}
                                accept=".pdf,.epub,.mobi,.doc,.docx"
                                className="hidden"
                              />
                              <UploadCloud className="w-5 h-5 text-amber-400 animate-pulse" />
                              <div className="space-y-0.5">
                                <span className="block text-[11px] font-medium text-white">Upload de E-Book</span>
                                <span className="block text-[9px] text-gray-500 font-mono">PDF ou EPUB até 150MB</span>
                              </div>
                            </div>

                            {ebookUploadProgress !== null && (
                              <div className="bg-[#0b0816] p-2 rounded border border-amber-500/10 space-y-1 mt-2 font-mono">
                                <span className="block text-[9px] text-amber-300 line-clamp-1">Enviando: {uploadedEbookName}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-amber-950/40 h-1 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${ebookUploadProgress}%` }} />
                                  </div>
                                  <span className="text-[9px] text-cyan-400 font-bold leading-none">{ebookUploadProgress}%</span>
                                </div>
                              </div>
                            )}

                            {lessonEditEbookFileName && (
                              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/10 p-1.5 rounded border border-emerald-500/10 mt-1">
                                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">E-book ativo: {lessonEditEbookFileName}</span>
                              </div>
                            )}
                          </div>

                          {/* Option B: External Ebook Link */}
                          <div className="space-y-3 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Opção B: Link do Google Drive ou Externo</label>
                              <input 
                                type="text" 
                                value={lessonEditEbookUrl}
                                onChange={(e) => setLessonEditEbookUrl(e.target.value)}
                                placeholder="https://drive.google.com/file/d/..."
                                className="w-full bg-[#05030d] border border-amber-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/30 font-mono"
                              />
                            </div>

                            <div className="bg-[#0c091d]/20 border border-amber-950/25 p-2.5 rounded-lg text-[9px] text-gray-400 leading-normal font-mono">
                              O estudante poderá baixar o e-book ou lê-lo diretamente do visualizador integrado, seja com o drive configurado ou carregado via buffer local.
                            </div>
                          </div>
                        </div>

                        {/* Direct programming text */}
                        <div className="space-y-1.5 border-t border-amber-950/15 pt-3">
                          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Opção C: Texto Teórico da Aula (Formato Markdown / Editor Literário)</label>
                          <textarea 
                            value={lessonEditEbookContent}
                            onChange={(e) => setLessonEditEbookContent(e.target.value)}
                            placeholder="### O Guia Definitivo do Programador...\nEscreva o material teórico da aula em formato de tópicos ou livro interativo digital..."
                            className="w-full bg-[#05030d] border border-amber-900/30 rounded-lg p-3 text-xs text-white font-mono min-h-[140px] focus:outline-none focus:border-amber-500/40 leading-relaxed"
                          />
                          <p className="text-[9px] text-gray-500 font-mono">Formatador de Markdown integrado ativo. O estudante lerá com alto conforto e fontes profissionais.</p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 3. MATERIALS ATTACHMENTS AND LINKS DOWNLOADS TAB */}
                {activeLessonTab === 'materials' && (
                  <div className="space-y-5 py-1 animate-fadeIn">
                    
                    {/* Add attachment form */}
                    <div className="p-4 bg-[#05030d] border border-amber-900/30 rounded-xl space-y-3.5">
                      <legend className="text-[10px] font-mono font-bold text-[#C9A84C] uppercase tracking-wider block">Adicionar Material Adicional</legend>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        
                        <div className="sm:col-span-7 space-y-1">
                          <label className="text-[9px] font-mono text-gray-500 uppercase block">Nome identificador do material (e.g., Manual Geral)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Anexo de Infraestrutura e Cibersegurança"
                            value={newMatName}
                            onChange={(e) => setNewMatName(e.target.value)}
                            className="w-full bg-[#090615] border border-amber-900/20 rounded p-2 text-xs text-white focus:outline-none focus:border-amber-500/30 font-medium"
                          />
                        </div>

                        <div className="sm:col-span-5 space-y-1">
                          <label className="text-[9px] font-mono text-gray-500 uppercase block">Formato do Recurso</label>
                          <select
                            value={newMatType}
                            onChange={(e) => setNewMatType(e.target.value as any)}
                            className="w-full bg-[#090615] border border-amber-900/20 rounded p-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="pdf">📄 PDF Acadêmico</option>
                            <option value="zip">📦 ZIP (Código-Fonte / Repositório)</option>
                            <option value="doc">📝 DOC Word / Slide Teórico</option>
                            <option value="link">🔗 LINK Útil / Google Drive</option>
                          </select>
                        </div>

                      </div>

                      {/* Dropzone / Upload area option */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        
                        {/* Option A: Upload Local Attachment File */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block">Opção A: Carregar Arquivo de Apoio do Computador</label>
                          
                          <div 
                            onClick={triggerMaterialFileInput}
                            className="border border-dashed border-cyan-500/10 hover:border-cyan-500/40 rounded-lg p-2.5 text-center bg-black/40 hover:bg-[#0c1624]/20 transition-all hover:cursor-pointer flex items-center justify-center gap-2 min-h-[64px]"
                          >
                            <input 
                              type="file" 
                              ref={materialFileInputRef}
                              onChange={handleMaterialFileUploadChange}
                              className="hidden"
                            />
                            <UploadCloud className="w-5 h-5 text-cyan-400" />
                            <div className="text-left">
                              <span className="block text-[10px] font-medium text-white">Upload de Arquivo</span>
                              <span className="block text-[8px] text-gray-500 font-mono">Suporta PDF, ZIP, DOC, PPTX</span>
                            </div>
                          </div>

                          {materialUploadProgress !== null && (
                            <div className="bg-[#040911] p-2 rounded border border-cyan-500/10 space-y-1 font-mono">
                              <span className="block text-[8px] text-cyan-300 line-clamp-1">Enviando: {uploadedMaterialName}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-cyan-950/40 h-1 rounded-full overflow-hidden">
                                  <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${materialUploadProgress}%` }} />
                                </div>
                                <span className="text-[8px] text-cyan-400 font-bold leading-none">{materialUploadProgress}%</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Option B: Insert external download URL */}
                        <div className="space-y-1.5 flex flex-col justify-between">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 uppercase block">Opção B: URL Externa / Link de Baixar (Opcional)</label>
                            <input 
                              type="text" 
                              placeholder="https://drive.google.com/... (ou deixe em branco ao concluir o upload acima)"
                              value={newMatUrl}
                              onChange={(e) => setNewMatUrl(e.target.value)}
                              className="w-full bg-[#090615] border border-amber-900/20 rounded p-2 text-[10px] text-white focus:outline-none focus:border-amber-500/25 font-mono"
                            />
                          </div>

                          {newMatSize && (
                            <div className="text-[9px] font-mono text-cyan-300 bg-cyan-950/20 p-1 rounded border border-cyan-500/10 flex justify-between items-center px-1">
                              <span>Tamanho detectado:</span>
                              <span className="font-bold">{newMatSize}</span>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Attach triggers */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddNewMaterialRow}
                          disabled={!newMatName.trim()}
                          className={`px-6 py-2 rounded-lg font-mono text-xs font-bold transition-colors ${
                            newMatName.trim() 
                              ? 'bg-amber-600 hover:bg-amber-500 text-white hover:cursor-pointer'
                              : 'bg-gray-900 text-gray-500 cursor-not-allowed border border-gray-800'
                          }`}
                        >
                          Anexar Material de Apoio 📥
                        </button>
                      </div>

                    </div>

                    {/* Listing attachments */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-gray-400 block uppercase font-bold">RELAÇÃO DE ANEXOS ATIVOS NESTA DISCIPLINA:</span>
                      
                      {lessonEditMaterials && lessonEditMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {lessonEditMaterials.map((item) => (
                            <div key={item.id} className="bg-black/40 border border-amber-950/25 p-2 px-3 rounded-lg flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <Paperclip className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                <div className="min-w-0">
                                  <span className="block text-xs font-semibold text-white line-clamp-1">{item.name}</span>
                                  <span className="block text-[10px] text-gray-500 font-mono capitalize">{item.type} • {item.size}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteMaterialRow(item.id)}
                                className="text-gray-500 hover:text-red-400 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-500 italic font-mono p-1">Nenhum arquivo de download complementar associado à aula.</p>
                      )}
                    </div>

                  </div>
                )}

                {/* Confirm / modal cancel buttons block */}
                <div className="border-t border-amber-950/25 pt-4 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLesson(null);
                      setEditingLessonModIndex(null);
                      setEditingLessonIdx(null);
                    }}
                    className="px-4 py-2 bg-transparent hover:bg-white/5 border border-amber-500/10 text-gray-400 hover:text-white rounded-lg font-mono transition-colors"
                  >
                    Encerrar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-tr from-amber-600 to-amber-650 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-mono font-bold flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" /> Atualizar Aula Virtual
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD NEW COMPLETELY NOVO COURSE */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-card p-6 rounded-2xl relative border border-amber-500/20 bg-[#090615]"
            >
              <button 
                onClick={() => setIsAddOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-display font-medium text-white mb-4">Adicionar Nova Masterclass</h3>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-300 block">Título do Curso</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Mestrado em Compiladores"
                      className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-300 block">Categoria</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Tech">Tech (Processamento/IA)</option>
                      <option value="Dev">Dev (Arquitetura/Escalabilidade)</option>
                      <option value="Cyber">Cyber (Cibersegurança/Redes)</option>
                      <option value="Design">Design (Ergonomia/UX Cognitiva)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Slogan Curto / Tagline</label>
                  <input 
                    type="text" 
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Aborda compiladores, otimização de C e Rust de baixo nível."
                    className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Duração Estimada</label>
                  <input 
                    type="text" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="180 horas"
                    className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Valor do Curso (KZ)</label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 120000"
                    className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Identidade Visual (Capa do Curso)</label>
                  <div className="flex items-center gap-2.5 bg-[#0a0715] border border-amber-900/30 p-2 rounded-lg">
                    {newCourseImage ? (
                      <img 
                        src={newCourseImage} 
                        alt="Preview Capa" 
                        className="w-12 h-9 object-cover rounded border border-amber-500/10 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-9 rounded border border-dashed border-gray-800 bg-black/40 flex items-center justify-center text-[9px] text-gray-500 font-mono flex-shrink-0">
                        N/A
                      </div>
                    )}
                    <div className="flex-grow space-y-1 min-w-0">
                      <input 
                        type="text"
                        value={newCourseImage}
                        onChange={(e) => setNewCourseImage(e.target.value)}
                        placeholder="Link da imagem (ou use o upload abaixo)"
                        className="w-full bg-black/40 border border-amber-900/15 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-1.5 leading-none">
                        <input 
                          type="file" 
                          ref={coverFileInputRef}
                          onChange={handleCoverFileUploadChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={triggerCoverFileInput}
                          className="text-[9px] font-mono text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <UploadCloud className="w-2.5 h-2.5" /> Fazer Upload Local
                        </button>
                        {coverProgress !== null && (
                          <span className="text-[9px] font-mono text-cyan-400 font-bold">{coverProgress}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Grade de Aulas (Formatador IA)</label>
                  <textarea 
                    value={lessonsRaw}
                    onChange={(e) => setLessonsRaw(e.target.value)}
                    placeholder="Escreva como o exemplo acima..."
                    className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg p-2.5 text-xs text-white font-mono min-h-[110px] focus:outline-none focus:border-amber-500/40"
                    required
                  />
                  <span className="block text-[9px] text-gray-500 font-mono leading-relaxed">Formato recomendado: <br /> Módulo 1: Nome do Mód <br /> - Nome da Aula 1 <br /> - Nome da Aula 2</span>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all pt-1 hover:cursor-pointer"
                  id="courses-btn-submit"
                >
                  <Save className="w-4 h-4" /> Registrar Curso Acadêmico
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
