'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, dbService } from '@/lib/supabase';

// Definitions matching the high-tech system specifications

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  locked?: boolean;
  description?: string;
  contentType?: 'video' | 'ebook';
  videoUrl?: string;
  ebookContent?: string;
  ebookUrl?: string;
  ebookFileName?: string;
  materials?: {
    id: string;
    name: string;
    type: 'pdf' | 'zip' | 'link' | 'doc';
    url: string;
    size?: string;
  }[];
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  duration: string;
  modulesCount: number;
  lessonsList: {
    moduleName: string;
    lessons: Lesson[];
  }[];
  category: 'Tech' | 'Cyber' | 'Dev' | 'Design';
  image: string;
  studentsCount: number;
  price?: number;
}

export interface AccessCode {
  code: string;
  courseId: string;
  courseTitle: string;
  status: 'disponivel' | 'resgatado';
  resgatadoPor?: string;
  resgatadoEm?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  courseId: string;
  courseTitle: string;
  progress: number; // percentage
  status: 'Novos' | 'Em Andamento' | 'Concluídos' | 'Inativos';
  registeredAt: string;
  codeUsed: string;
  enrolledCourses?: { courseId: string; courseTitle: string }[];
  isHighlightedNetworking?: boolean;
}

export interface Post {
  id: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  likedByCurrentUser?: boolean;
  comments: {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
    isPinned?: boolean;
  }[];
  tags: string[];
  isPinned?: boolean;
}

export interface Transaction {
  id: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  paymentMethod: 'Cartão de Crédito' | 'Pix' | 'Boleto Bancário' | 'Voucher';
  date: string;
  status: 'completado' | 'pendente';
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'info' | 'alert' | 'success';
  read: boolean;
  targetCourseId?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'auth' | 'system' | 'courses' | 'search' | 'notification' | 'profile';
}

interface AppContextType {
  currentUser: { name: string; email: string; whatsapp: string; courseId: string; role: 'aluno' | 'admin'; avatar?: string } | null;
  isAdmin: boolean;
  courses: Course[];
  accessCodes: AccessCode[];
  students: Student[];
  posts: Post[];
  transactions: Transaction[];
  notifications: SystemNotification[];
  activityLogs: ActivityLog[];
  registerStudent: (name: string, email: string, whatsapp: string, courseId: string, accessCode: string, passwordString: string) => Promise<{ success: boolean; message: string }>;
  login: (email: string, passwordString: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  setAdminOverride: (val: boolean) => void;
  generateBatchCodes: (courseId: string, count: number) => void;
  deleteCode: (code: string) => void;
  updateStudentStatus: (studentId: string, newStatus: Student['status']) => void;
  updateStudent: (studentId: string, updatedFields: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  toggleStudentNetworkingStatus: (studentId: string) => void;
  addCourseToStudent: (studentId: string, courseId: string) => void;
  enrollExistingStudentDirectly: (student: Omit<Student, 'id' | 'registeredAt'>) => void;
  addNewCourse: (course: Course) => void;
  updateCourse: (courseId: string, updatedFields: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addNewPost: (content: string, tags: string[]) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  pinComment: (postId: string, commentId: string) => void;
  deletePost: (postId: string) => void;
  updateProfile: (name: string, email: string, whatsapp: string, avatar?: string) => void;
  addActivityLog: (action: string, category: ActivityLog['category'], user?: string) => void;
  triggerSystemNotification: (title: string, message: string, category: SystemNotification['category'], targetCourseId?: string) => void;
  markNotificationsAsRead: () => void;
  supabaseConnected: boolean;
  supabaseConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Cources Data
const INITIAL_COURSES: Course[] = [];

const INITIAL_ACCESS_CODES: AccessCode[] = [];

const INITIAL_STUDENTS: Student[] = [];

const INITIAL_POSTS: Post[] = [];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

const INITIAL_LOGS: ActivityLog[] = [];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppContextType['currentUser']>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Load from Supabase on mount (falls back gracefully to localStorage)
  useEffect(() => {
    const loadSupabaseData = async () => {
      const isConnected = await dbService.testConnection();
      setSupabaseConnected(isConnected);
      
      if (isConnected) {
        console.log('✅ Conectado com sucesso ao Supabase!');
        const dbCourses = await dbService.fetchTable('courses');
        const dbCodes = await dbService.fetchTable('access_codes');
        const dbStudents = await dbService.fetchTable('students');
        const dbPosts = await dbService.fetchTable('posts');
        const dbTxns = await dbService.fetchTable('transactions');
        const dbNotifications = await dbService.fetchTable('notifications');
        const dbLogs = await dbService.fetchTable('activity_logs');

        if (dbCourses !== null) setCourses(dbCourses);
        if (dbCodes !== null) setAccessCodes(dbCodes);
        
        if (dbStudents !== null) {
          setStudents(dbStudents);
          
          // VERIFICAÇÃO DE SEGURANÇA: Se o aluno atual foi apagado do banco de dados, expulsar da sessão.
          if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('nz_current_user');
            if (storedUser) {
              try {
                const userObj = JSON.parse(storedUser);
                if (userObj && userObj.role !== 'admin') {
                  const stillExists = dbStudents.some((s: Student) => s.email.trim().toLowerCase() === userObj.email.trim().toLowerCase());
                  if (!stillExists) {
                    console.warn("Segurança: Estudante não encontrado na base de dados. Sessão invalidada.");
                    localStorage.removeItem('nz_current_user');
                    setCurrentUser(null);
                    if (supabase) supabase.auth.signOut();
                  }
                }
              } catch(e) {}
            }
          }
        }
        
        if (dbPosts !== null) setPosts(dbPosts);
        if (dbTxns !== null) setTransactions(dbTxns);
        if (dbNotifications !== null) setNotifications(dbNotifications);
        if (dbLogs !== null) setActivityLogs(dbLogs);
      }
    };

    // Apenas carrega as credenciais da sessão. 
    // Os DADOS (cursos, etc) virão apenas do Supabase, sem "dados fantasmas".
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('nz_current_user');
      const storedIsAdmin = localStorage.getItem('nz_is_admin');

      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedIsAdmin) setIsAdmin(JSON.parse(storedIsAdmin));
    }

    loadSupabaseData();

    // Setup Supabase Realtime synchronization
    let channel: any;
    if (supabase) {
      channel = supabase.channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload: any) => {
          console.log('🔄 Sincronização Realtime ativada:', payload);
          loadSupabaseData();
        })
        .subscribe();
    }

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const sync = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      // Somente armazena dados de sessão no localStorage (nz_current_user, nz_is_admin)
      if (key === 'nz_current_user' || key === 'nz_is_admin') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    }
  };

  const registerStudent = async (name: string, email: string, whatsapp: string, courseId: string, accessCode: string, passwordString: string) => {
    // 1. Fetch exact Access Code directly from Supabase
    const { data: codeData, error: codeErr } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', accessCode.trim().toUpperCase())
      .single();
      
    if (codeErr || !codeData) {
      return { success: false, message: 'Código de acesso inexistente ou inválido. Verifique e tente novamente.' };
    }
    if (codeData.status === 'resgatado') {
      return { success: false, message: `O código de acesso já foi resgatado por ${codeData.resgatadoPor || 'outro utilizador'}.` };
    }
    
    // Use the courseId from the code itself (ignore the selected course - code dictates the course)
    // Directly fetched from Supabase, so it might be snake_case (course_id)
    const resolvedCourseId = codeData.course_id || codeData.courseId || courseId;

    // 2. Register Student in Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: passwordString,
      options: {
        data: {
          name,
          whatsapp,
          role: 'aluno'
        }
      }
    });

    if (authErr) {
      return { success: false, message: 'Não foi possível criar a sua conta. O e-mail pode já estar em uso ou a senha é muito curta.' };
    }

    // 3. Get Course Title (fetch from DB to be sure)
    const { data: courseData } = await supabase
      .from('courses')
      .select('title, price')
      .eq('id', resolvedCourseId)
      .single();

    const courseTitle = courseData ? courseData.title : 'Curso Registrado';
    const coursePrice = courseData ? courseData.price : 0;

    // 4. Save Student Record in DB
    const newStudent: Student = {
      id: authData.user?.id || `std-${Date.now()}`,
      name,
      email,
      whatsapp,
      courseId: resolvedCourseId,
      courseTitle,
      progress: 0,
      status: 'Novos',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      codeUsed: accessCode.toUpperCase(),
      enrolledCourses: [
        { courseId: resolvedCourseId, courseTitle }
      ]
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    await dbService.upsertRows('students', [newStudent]);

    // 5. Mark Code as Redeemed
    const updatedCode = {
      ...codeData,
      status: 'resgatado' as const,
      resgatadoPor: name,
      resgatadoEm: new Date().toISOString().substring(0, 10),
    };
    
    setAccessCodes(accessCodes.map(c => c.code === accessCode ? updatedCode : c));
    await dbService.upsertRows('access_codes', [updatedCode]);

    // 6. Create Transaction Record
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      studentName: name,
      courseTitle,
      amount: coursePrice,
      paymentMethod: 'Voucher',
      date: new Date().toISOString().substring(0, 10),
      status: 'completado'
    };
    
    const updatedTxns = [...transactions, newTxn];
    setTransactions(updatedTxns);
    await dbService.upsertRows('transactions', [newTxn]);

    // 7. Success message - DO NOT auto login, wait for email confirmation.
    return { success: true, message: 'Cadastro bem-sucedido! Verifique a sua caixa de e-mail (e a pasta de spam) e clique no link de confirmação para ativar a sua conta antes de entrar no sistema.' };
  };

  const login = async (email: string, passwordString: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passwordString,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return { success: false, message: 'Precisa de confirmar o seu e-mail antes de iniciar sessão. Verifique a sua caixa de entrada.' };
        }
        return { success: false, message: 'Autenticação falhou: ' + error.message };
      }

      if (data.user) {
        const role = data.user.user_metadata?.role || 'aluno';
        
        if (role === 'admin') {
          const adminUser = { name: data.user.user_metadata?.name || 'Admin', email, whatsapp: '', courseId: 'all', role: 'admin' as const };
          setCurrentUser(adminUser);
          setIsAdmin(true);
          sync('nz_current_user', adminUser);
          sync('nz_is_admin', true);
          addActivityLog('Login efetuado: Administrador', 'auth', adminUser.name);
          return { success: true, message: 'Bem-vindo, Administrador! Portal Executivo ativado.' };
        } else {
          const userStudent = students.find(s => s.email.trim().toLowerCase() === email.trim().toLowerCase());
          if (userStudent) {
            const studentUser = { 
              name: userStudent.name, 
              email: userStudent.email, 
              whatsapp: userStudent.whatsapp, 
              courseId: userStudent.courseId, 
              role: 'aluno' as const 
            };
            setCurrentUser(studentUser);
            setIsAdmin(false);
            sync('nz_current_user', studentUser);
            sync('nz_is_admin', false);
            addActivityLog(`Login efetuado: Aluno "${userStudent.name}"`, 'auth', userStudent.name);
            return { success: true, message: `Boas-vindas de volta, ${userStudent.name}!` };
          } else {
            return { success: false, message: 'A sua conta não foi encontrada. Contacte o suporte ou registe-se novamente.' };
          }
        }
      }
      return { success: false, message: 'Não foi possível iniciar sessão. Tente novamente.' };
    } catch (e: any) {
      return { success: false, message: 'Não foi possível conectar ao servidor. Verifique a sua ligação à internet.' };
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nz_current_user');
      localStorage.setItem('nz_is_admin', 'false');
    }
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Erro ao fazer signout no Supabase:", err);
      }
    }
  };

  const setAdminOverride = (val: boolean) => {
    setIsAdmin(val);
    sync('nz_is_admin', val);
    if (val && !currentUser) {
      const adminUser = { name: 'Admin Nzila', email: 'contato@nzila.co', whatsapp: '+55 11 90000-0000', courseId: 'all', role: 'admin' as const };
      setCurrentUser(adminUser);
      sync('nz_current_user', adminUser);
    } else if (!val && currentUser?.role === 'admin') {
      // Switch back to Aluno
      const studentUser = { name: 'Alex Rivera', email: 'alex.rivera@quantum.academy', whatsapp: '+55 11 98888-7777', courseId: 'course-1', role: 'aluno' as const };
      setCurrentUser(studentUser);
      sync('nz_current_user', studentUser);
    }
  };

  const generateBatchCodes = async (courseId: string, count: number) => {
    const selectedCourse = courses.find(c => c.id === courseId);
    const courseTitle = selectedCourse ? selectedCourse.title : 'Curso Selecionado';
    
    const newCodes: AccessCode[] = [];
    const hex = '0123456789ABCDEF';
    
    for (let i = 0; i < count; i++) {
      let randomPart1 = '';
      for (let j = 0; j < 4; j++) randomPart1 += hex[Math.floor(Math.random() * 16)];
      let randomPart2 = hex[Math.floor(Math.random() * 16)];
      const code = `NZ-${randomPart1}-${randomPart2}`;
      
      newCodes.push({
        code,
        courseId,
        courseTitle,
        status: 'disponivel'
      });
    }

    const success = await dbService.upsertRows('access_codes', newCodes);
    if (success) {
      setAccessCodes([...newCodes, ...accessCodes]);
      if (typeof window !== 'undefined') alert(`${count} código(s) gerado(s) com sucesso no banco de dados!`);
    } else {
      if (typeof window !== 'undefined') alert('Falha ao criar códigos no banco de dados. Tente novamente.');
    }
  };

  const deleteCode = async (codeToDelete: string) => {
    let success = true;
    if (supabase) {
      const { error } = await supabase.from('access_codes').delete().eq('code', codeToDelete);
      if (error) success = false;
    }
    if (success) {
      setAccessCodes(accessCodes.filter(c => c.code !== codeToDelete));
      if (typeof window !== 'undefined') alert(`Código de acesso "${codeToDelete}" excluído do banco de dados com sucesso!`);
    } else {
      if (typeof window !== 'undefined') alert('Falha ao excluir código de acesso do banco de dados.');
    }
  };

  const updateStudentStatus = async (studentId: string, newStatus: Student['status']) => {
    const studentName = students.find(s => s.id === studentId)?.name || studentId;
    let success = true;
    if (supabase) {
      success = await dbService.upsertRows('students', [{ id: studentId, status: newStatus }]);
    }
    if (success) {
      setStudents(students.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
      if (typeof window !== 'undefined') alert(`Status do aluno "${studentName}" atualizado no banco de dados com sucesso!`);
    } else {
      if (typeof window !== 'undefined') alert('Falha ao atualizar status do aluno no banco de dados.');
    }
  };

  const updateStudent = async (studentId: string, updatedFields: Partial<Student>) => {
    const studentName = students.find(s => s.id === studentId)?.name || studentId;
    let success = true;
    if (supabase) {
      success = await dbService.upsertRows('students', [{ id: studentId, ...updatedFields }]);
    }
    if (success) {
      setStudents(students.map(s => s.id === studentId ? { ...s, ...updatedFields } : s));
      if (typeof window !== 'undefined') alert(`Dados do aluno "${studentName}" atualizados no banco de dados com sucesso!`);
    } else {
      if (typeof window !== 'undefined') alert('Falha ao atualizar dados do aluno no banco de dados.');
    }
  };

  const addCourseToStudent = async (studentId: string, courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const currentEC = student.enrolledCourses || [{ courseId: student.courseId, courseTitle: student.courseTitle }];
    if (currentEC.some(ec => ec.courseId === courseId)) return;

    const updatedEC = [...currentEC, { courseId: course.id, courseTitle: course.title }];

    let success = true;
    if (supabase) {
      success = await dbService.upsertRows('students', [{ id: studentId, enrolledCourses: updatedEC }]);
    }
    
    if (success) {
      setStudents(students.map(s => s.id === studentId ? { ...s, enrolledCourses: updatedEC } : s));

      const newTxn: Transaction = {
        id: `txn-add-${Date.now()}`,
        studentName: student.name,
        courseTitle: course.title,
        amount: course.price || 120000,
        paymentMethod: 'Pix',
        date: new Date().toISOString().substring(0, 10),
        status: 'completado'
      };
      if (supabase) {
        await dbService.upsertRows('transactions', [newTxn]);
      }
      setTransactions([...transactions, newTxn]);
      if (typeof window !== 'undefined') alert(`Curso "${course.title}" anexado ao aluno "${student.name}" e salvo no banco de dados!`);
    } else {
      if (typeof window !== 'undefined') alert('Falha ao anexar curso ao aluno no banco de dados.');
    }
  };

  const enrollExistingStudentDirectly = async (studentData: Omit<Student, 'id' | 'registeredAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      enrolledCourses: studentData.enrolledCourses || [
        { courseId: studentData.courseId, courseTitle: studentData.courseTitle }
      ]
    };
    let success = true;
    if (supabase) {
      success = await dbService.upsertRows('students', [newStudent]);
    }
    if (success) {
      setStudents([...students, newStudent]);
      if (typeof window !== 'undefined') alert(`Aluno "${newStudent.name}" cadastrado e salvo no banco de dados com sucesso!`);
    } else {
      if (typeof window !== 'undefined') alert('Falha ao cadastrar aluno no banco de dados.');
    }
  };

  const addNewCourse = async (course: Course) => {
    const success = await dbService.upsertRows('courses', [course]);
    if (success) {
      setCourses([...courses, course]);
      addActivityLog(`Curso criado: "${course.title}"`, 'courses');
      if (typeof window !== 'undefined') alert(`Curso "${course.title}" criado e salvo no banco de dados com sucesso!`);
    } else {
      if (typeof window !== 'undefined') alert('Falha ao salvar curso no banco de dados. Tente novamente.');
    }
  };

  const updateCourse = async (courseId: string, updatedFields: Partial<Course>) => {
    const courseTitle = courses.find(c => c.id === courseId)?.title || courseId;
    const updateData: any = { id: courseId, ...updatedFields };
    if (updatedFields.lessonsList) {
      updateData.modulesCount = updatedFields.lessonsList.length;
    }
    const isLessonUpdate = !!updatedFields.lessonsList;
    let success = true;
    if (supabase) {
      success = await dbService.upsertRows('courses', [updateData]);
    }
    
    if (success) {
      setCourses(courses.map(c => {
        if (c.id === courseId) {
          return { ...c, ...updateData };
        }
        return c;
      }));
      addActivityLog(`Curso atualizado: "${courseTitle}"`, 'courses');
      if (typeof window !== 'undefined') {
        if (isLessonUpdate) {
          alert(`Aulas/Módulos do curso "${courseTitle}" salvos no banco de dados com sucesso!`);
        } else {
          alert(`Curso "${courseTitle}" atualizado e salvo no banco de dados com sucesso!`);
        }
      }
    } else {
      if (typeof window !== 'undefined') {
        if (isLessonUpdate) {
          alert('Falha ao salvar aulas/módulos no banco de dados. Tente novamente.');
        } else {
          alert('Falha ao atualizar curso no banco de dados. Tente novamente.');
        }
      }
    }
  };

  const deleteCourse = async (courseId: string) => {
    const courseTitle = courses.find(c => c.id === courseId)?.title || courseId;
    let success = true;
    if (supabase) {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) success = false;
    }
    if (success) {
      setCourses(courses.filter(c => c.id !== courseId));
      addActivityLog(`Curso apagado: "${courseTitle}"`, 'courses');
      if (typeof window !== 'undefined') alert(`Curso "${courseTitle}" removido do banco de dados com sucesso!`);
    } else {
      if (typeof window !== 'undefined') alert('Falha ao apagar curso do banco de dados.');
    }
  };

  const deleteStudent = async (studentId: string) => {
    const studentName = students.find(s => s.id === studentId)?.name || studentId;
    let success = true;
    if (supabase) {
      const { error } = await supabase.from('students').delete().eq('id', studentId);
      if (error) success = false;
    }
    if (success) {
      setStudents(students.filter(s => s.id !== studentId));
      addActivityLog(`Aluno removido do sistema: "${studentName}"`, 'system');
      if (typeof window !== 'undefined') alert(`Aluno "${studentName}" removido do banco de dados com sucesso!`);
    } else {
      if (typeof window !== 'undefined') alert('Falha ao remover aluno do banco de dados.');
    }
  };

  const toggleStudentNetworkingStatus = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const newStatus = !student.isHighlightedNetworking;
    let success = true;
    if (supabase) {
      success = await dbService.upsertRows('students', [{ id: studentId, isHighlightedNetworking: newStatus }]);
    }
    if (success) {
      setStudents(students.map(s => s.id === studentId ? { ...s, isHighlightedNetworking: newStatus } : s));
      addActivityLog(
        newStatus
          ? `Aluno "${student.name}" adicionado aos Destaques de Networking`
          : `Aluno "${student.name}" removido dos Destaques de Networking`,
        'system'
      );
      if (typeof window !== 'undefined') {
        alert(newStatus 
          ? `Aluno "${student.name}" destacado no networking e salvo no banco de dados!` 
          : `Aluno "${student.name}" removido dos destaques e salvo no banco de dados!`
        );
      }
    } else {
      if (typeof window !== 'undefined') alert('Falha ao atualizar destaque de networking no banco de dados.');
    }
  };

  const addNewPost = async (content: string, tags: string[]) => {
    const authorName = currentUser?.name || 'Fulano de Tal';
    const authorTitle = currentUser?.role === 'admin' ? 'Administrador Co-Founder' : 'Aluno Pro';
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorName,
      authorTitle,
      authorAvatar: currentUser?.role === 'admin' 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      content,
      createdAt: 'Agora mesmo',
      likes: 0,
      likedByCurrentUser: false,
      tags: tags.length > 0 ? tags : ['Networking'],
      comments: []
    };

    let success = true;
    if (supabase) {
      success = await dbService.upsertRows('posts', [newPost]);
    }
    if (success) {
      setPosts([newPost, ...posts]);
      if (typeof window !== 'undefined') alert('Publicação oficial guardada com sucesso no banco de dados!');
    } else {
      if (typeof window !== 'undefined') alert('Falha ao salvar publicação no banco de dados. Tente novamente.');
    }
  };

  const likePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const liked = !post.likedByCurrentUser;
    const newLikes = liked ? post.likes + 1 : post.likes - 1;
    if (supabase) {
      await dbService.upsertRows('posts', [{ id: postId, likedByCurrentUser: liked, likes: newLikes }]);
    }
    setPosts(posts.map(p => p.id === postId ? { ...p, likedByCurrentUser: liked, likes: newLikes } : p));
  };

  const addComment = async (postId: string, text: string) => {
    if (!text.trim()) return;
    const authorName = currentUser?.name || 'Anônimo';
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const newComment = { id: `c-${Date.now()}`, authorName, content: text, createdAt: 'Agora mesmo' };
    const updatedComments = [...post.comments, newComment];
    if (supabase) {
      await dbService.upsertRows('posts', [{ id: postId, comments: updatedComments }]);
    }
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
  };

  const pinComment = async (postId: string, commentId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const updatedComments = post.comments.map(c => c.id === commentId ? { ...c, isPinned: !c.isPinned } : c);
    if (supabase) {
      await dbService.upsertRows('posts', [{ id: postId, comments: updatedComments }]);
    }
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
  };

  const deletePost = async (postId: string) => {
    let success = true;
    if (supabase) {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) success = false;
    }
    if (success) {
      setPosts(posts.filter(p => p.id !== postId));
      if (typeof window !== 'undefined') alert('Publicação excluída do banco de dados com sucesso!');
    } else {
      if (typeof window !== 'undefined') alert('Falha ao excluir publicação do banco de dados.');
    }
  };

  const updateProfile = async (name: string, email: string, whatsapp: string, avatar?: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name, email, whatsapp, ...(avatar ? { avatar } : {}) };

    let success = true;
    if (currentUser.role === 'aluno') {
      const isStudentInList = students.some(s => s.email === currentUser.email);
      if (isStudentInList) {
        if (supabase) {
          const studentIdsToUpdate = students.filter(s => s.email === currentUser.email).map(s => s.id);
          for (const id of studentIdsToUpdate) {
            const ok = await dbService.upsertRows('students', [{ id, name, email, whatsapp, ...(avatar ? { avatar } : {}) }]);
            if (!ok) success = false;
          }
        }
      }
    }

    if (success) {
      setCurrentUser(updatedUser);
      sync('nz_current_user', updatedUser);
      addActivityLog(`Perfil de utilizador atualizado: ${name}`, 'profile', name);
      if (currentUser.role === 'aluno') {
        setStudents(students.map(s => s.email === currentUser.email ? { ...s, name, email, whatsapp, ...(avatar ? { avatar } : {}) } : s));
      }
      if (typeof window !== 'undefined') alert('Perfil atualizado e salvo no banco de dados com sucesso!');
    } else {
      if (typeof window !== 'undefined') alert('Falha ao atualizar dados do perfil no banco de dados.');
    }
  };

  const addActivityLog = async (action: string, category: ActivityLog['category'], user?: string) => {
    const activeUserName = user || currentUser?.name || 'Sistema Nzila';
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: activeUserName,
      action,
      category
    };
    if (supabase) {
      await dbService.upsertRows('activity_logs', [newLog]);
    }
    setActivityLogs([newLog, ...activityLogs].slice(0, 150));
  };

  const triggerSystemNotification = async (title: string, message: string, category: SystemNotification['category'], targetCourseId?: string) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      category,
      read: false,
      targetCourseId
    };
    if (supabase) {
      await dbService.upsertRows('notifications', [newNotif]);
    }
    setNotifications([newNotif, ...notifications]);

    let logMessage = `Notificação enviada: "${title}"`;
    if (targetCourseId) {
      const courseName = courses.find(c => c.id === targetCourseId)?.title || targetCourseId;
      logMessage = `Notificação direcionada enviada: "${title}" para alunos do curso "${courseName}"`;
    }
    addActivityLog(logMessage, 'notification');
  };

  const markNotificationsAsRead = async () => {
    if (supabase) {
      const updates = notifications.map(n => ({ id: n.id, read: true }));
      await dbService.upsertRows('notifications', updates);
    }
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      isAdmin,
      courses,
      accessCodes,
      students,
      posts,
      transactions,
      notifications,
      activityLogs,
      registerStudent,
      login,
      logout,
      setAdminOverride,
      generateBatchCodes,
      deleteCode,
      updateStudentStatus,
      updateStudent,
      addCourseToStudent,
      enrollExistingStudentDirectly,
      addNewCourse,
      updateCourse,
      deleteCourse,
      deleteStudent,
      toggleStudentNetworkingStatus,
      addNewPost,
      likePost,
      addComment,
      deletePost,
      updateProfile,
      addActivityLog,
      triggerSystemNotification,
      markNotificationsAsRead,
      supabaseConnected
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
