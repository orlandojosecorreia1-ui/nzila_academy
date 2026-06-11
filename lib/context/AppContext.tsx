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
  addCourseToStudent: (studentId: string, courseId: string) => void;
  enrollExistingStudentDirectly: (student: Omit<Student, 'id' | 'registeredAt'>) => void;
  addNewCourse: (course: Course) => void;
  updateCourse: (courseId: string, updatedFields: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addNewPost: (content: string, tags: string[]) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  deletePost: (postId: string) => void;
  updateProfile: (name: string, email: string, whatsapp: string, avatar?: string) => void;
  addActivityLog: (action: string, category: ActivityLog['category'], user?: string) => void;
  triggerSystemNotification: (title: string, message: string, category: SystemNotification['category'], targetCourseId?: string) => void;
  markNotificationsAsRead: () => void;
  supabaseConnected: boolean;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  pullAllFromSupabase: () => Promise<{ success: boolean; message: string }>;
  factoryReset: () => Promise<void>;
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

        if (dbCourses !== null) {
          setCourses(dbCourses);
          localStorage.setItem('nz_courses', JSON.stringify(dbCourses));
        }
        if (dbCodes !== null) {
          setAccessCodes(dbCodes);
          localStorage.setItem('nz_access_codes', JSON.stringify(dbCodes));
        }
        if (dbStudents !== null) {
          setStudents(dbStudents);
          localStorage.setItem('nz_students', JSON.stringify(dbStudents));
        }
        if (dbPosts !== null) {
          setPosts(dbPosts);
          localStorage.setItem('nz_posts', JSON.stringify(dbPosts));
        }
        if (dbTxns !== null) {
          setTransactions(dbTxns);
          localStorage.setItem('nz_transactions', JSON.stringify(dbTxns));
        }
        if (dbNotifications !== null) {
          setNotifications(dbNotifications);
          localStorage.setItem('nz_notifications', JSON.stringify(dbNotifications));
        }
        if (dbLogs !== null) {
          setActivityLogs(dbLogs);
          localStorage.setItem('nz_logs', JSON.stringify(dbLogs));
        }
      }
    };

    // Load from localStorage as initial instant display
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('nz_current_user');
      const storedIsAdmin = localStorage.getItem('nz_is_admin');
      const storedCodes = localStorage.getItem('nz_access_codes');
      const storedStudents = localStorage.getItem('nz_students');
      const storedPosts = localStorage.getItem('nz_posts');
      const storedTxns = localStorage.getItem('nz_transactions');
      const storedCourses = localStorage.getItem('nz_courses');
      const storedNotifications = localStorage.getItem('nz_notifications');
      const storedLogs = localStorage.getItem('nz_logs');

      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedIsAdmin) setIsAdmin(JSON.parse(storedIsAdmin));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedCodes) setAccessCodes(JSON.parse(storedCodes));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedStudents) setStudents(JSON.parse(storedStudents));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedPosts) setPosts(JSON.parse(storedPosts));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedTxns) setTransactions(JSON.parse(storedTxns));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedCourses) setCourses(JSON.parse(storedCourses));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedLogs) setActivityLogs(JSON.parse(storedLogs));
    }

    loadSupabaseData();
  }, []);

  // Sync state to local storage and push incrementally to Supabase
  const sync = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
      
      // Async Syncing to Supabase Database
      if (supabase) {
        let tableName = '';
        if (key === 'nz_students') tableName = 'students';
        else if (key === 'nz_access_codes') tableName = 'access_codes';
        else if (key === 'nz_transactions') tableName = 'transactions';
        else if (key === 'nz_courses') tableName = 'courses';
        else if (key === 'nz_posts') tableName = 'posts';
        else if (key === 'nz_logs') tableName = 'activity_logs';
        else if (key === 'nz_notifications') tableName = 'notifications';

        if (tableName && Array.isArray(data)) {
          dbService.upsertRows(tableName, data).then(success => {
            if (success) {
              console.log(`☁️ Supabase: Sincronia de tabela "${tableName}" completada.`);
            }
          }).catch(err => {
            console.warn(`Supabase array sync exception on "${tableName}":`, err);
          });
        }
      }
    }
  };

  const syncAllToSupabase = async () => {
    try {
      const isConnected = await dbService.testConnection();
      setSupabaseConnected(isConnected);
      if (!isConnected) {
        return { 
          success: false, 
          message: 'Conexão falhou. Por favor configure as tabelas do Supabase utilizando o arquivo "supabase_schema.sql".' 
        };
      }
      
      // Upsert entire series
      const r1 = await dbService.upsertRows('courses', courses);
      const r2 = await dbService.upsertRows('access_codes', accessCodes);
      const r3 = await dbService.upsertRows('students', students);
      const r4 = await dbService.upsertRows('posts', posts);
      const r5 = await dbService.upsertRows('transactions', transactions);
      const r6 = await dbService.upsertRows('notifications', notifications);
      const r7 = await dbService.upsertRows('activity_logs', activityLogs);

      if (r1 && r2 && r3 && r4 && r5 && r6 && r7) {
        return { success: true, message: 'Todos os dados locais foram exportados e salvos no Supabase com sucesso!' };
      }
      return { success: false, message: 'Algumas tabelas falharam na exportação. Verifique se o schema foi executado.' };
    } catch (e: any) {
      return { success: false, message: `Erro ao exportar dados: ${e.message || e}` };
    }
  };

  const pullAllFromSupabase = async () => {
    try {
      const isConnected = await dbService.testConnection();
      setSupabaseConnected(isConnected);
      if (!isConnected) {
        return { 
          success: false, 
          message: 'Não foi possível conectar ao banco de dados para importar. Certifique-se de que a tabela "courses" existe no Supabase.' 
        };
      }

      const dbCourses = await dbService.fetchTable('courses');
      const dbCodes = await dbService.fetchTable('access_codes');
      const dbStudents = await dbService.fetchTable('students');
      const dbPosts = await dbService.fetchTable('posts');
      const dbTxns = await dbService.fetchTable('transactions');
      const dbNotifications = await dbService.fetchTable('notifications');
      const dbLogs = await dbService.fetchTable('activity_logs');

      if (dbCourses !== null) {
        setCourses(dbCourses);
        localStorage.setItem('nz_courses', JSON.stringify(dbCourses));
      }
      if (dbCodes !== null) {
        setAccessCodes(dbCodes);
        localStorage.setItem('nz_access_codes', JSON.stringify(dbCodes));
      }
      if (dbStudents !== null) {
        setStudents(dbStudents);
        localStorage.setItem('nz_students', JSON.stringify(dbStudents));
      }
      if (dbPosts !== null) {
        setPosts(dbPosts);
        localStorage.setItem('nz_posts', JSON.stringify(dbPosts));
      }
      if (dbTxns !== null) {
        setTransactions(dbTxns);
        localStorage.setItem('nz_transactions', JSON.stringify(dbTxns));
      }
      if (dbNotifications !== null) {
        setNotifications(dbNotifications);
        localStorage.setItem('nz_notifications', JSON.stringify(dbNotifications));
      }
      if (dbLogs !== null) {
        setActivityLogs(dbLogs);
        localStorage.setItem('nz_logs', JSON.stringify(dbLogs));
      }

      return { success: true, message: 'Todos os dados do Supabase foram baixados e carregados no estado do aplicativo!' };
    } catch (e: any) {
      return { success: false, message: `Erro ao importar dados: ${e.message || e}` };
    }
  };

  const factoryReset = async () => {
    // Limpar estados locais
    setCourses([]);
    setAccessCodes([]);
    setStudents([]);
    setPosts([]);
    setTransactions([]);
    setNotifications([]);
    setActivityLogs([]);

    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    // Limpar do Supabase
    if (supabase) {
      const isConnected = await dbService.testConnection();
      if (isConnected) {
        await Promise.all([
          supabase.from('courses').delete().neq('id', 'mock_impossible_id'),
          supabase.from('access_codes').delete().neq('code', 'mock_impossible_id'),
          supabase.from('students').delete().neq('id', 'mock_impossible_id'),
          supabase.from('posts').delete().neq('id', 'mock_impossible_id'),
          supabase.from('transactions').delete().neq('id', 'mock_impossible_id'),
          supabase.from('notifications').delete().neq('id', 'mock_impossible_id'),
          supabase.from('activity_logs').delete().neq('id', 'mock_impossible_id')
        ]);
        console.log('☁️ Supabase: Todos os dados foram resetados.');
      }
    }
    
    // Recarregar a página para aplicar
    if (typeof window !== 'undefined') {
      window.location.reload();
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
      return { success: false, message: 'Código de acesso inexistente ou inválido no banco de dados.' };
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
      return { success: false, message: `Erro ao criar conta: ${authErr.message}` };
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

    // 7. Login Student
    const studentUser = { name, email, whatsapp, courseId: resolvedCourseId, role: 'aluno' as const };
    setCurrentUser(studentUser);
    sync('nz_current_user', studentUser);
    setIsAdmin(false);
    sync('nz_is_admin', false);

    return { success: true, message: 'Cadastro bem-sucedido! Código validado no servidor.' };
  };

  const login = async (email: string, passwordString: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passwordString,
      });

      if (error) {
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
            return { success: false, message: 'Acesso negado. Aluno não encontrado na base de dados, mas autenticado no Supabase.' };
          }
        }
      }
      return { success: false, message: 'Erro desconhecido.' };
    } catch (e: any) {
      return { success: false, message: 'Falha de comunicação: ' + (e.message || String(e)) };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nz_current_user');
      localStorage.setItem('nz_is_admin', 'false');
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

  const generateBatchCodes = (courseId: string, count: number) => {
    const selectedCourse = courses.find(c => c.id === courseId);
    const courseTitle = selectedCourse ? selectedCourse.title : 'Curso Selecionado';
    
    const newCodes: AccessCode[] = [];
    const hex = '0123456789ABCDEF';
    
    for (let i = 0; i < count; i++) {
      // NZ-XXXX-X
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

    const updatedCodes = [...newCodes, ...accessCodes];
    setAccessCodes(updatedCodes);
    sync('nz_access_codes', updatedCodes);
  };

  const deleteCode = (codeToDelete: string) => {
    const updatedCodes = accessCodes.filter(c => c.code !== codeToDelete);
    setAccessCodes(updatedCodes);
    sync('nz_access_codes', updatedCodes);
  };

  const updateStudentStatus = (studentId: string, newStatus: Student['status']) => {
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        return { ...s, status: newStatus };
      }
      return s;
    });
    setStudents(updatedStudents);
    sync('nz_students', updatedStudents);
  };

  const updateStudent = (studentId: string, updatedFields: Partial<Student>) => {
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        return { ...s, ...updatedFields };
      }
      return s;
    });
    setStudents(updatedStudents);
    sync('nz_students', updatedStudents);
  };

  const addCourseToStudent = (studentId: string, courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Find student
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const currentEC = student.enrolledCourses || [{ courseId: student.courseId, courseTitle: student.courseTitle }];
    // Check if duplicate
    if (currentEC.some(ec => ec.courseId === courseId)) return;

    const updatedEC = [...currentEC, { courseId: course.id, courseTitle: course.title }];

    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        return { 
          ...s, 
          enrolledCourses: updatedEC
        };
      }
      return s;
    });
    setStudents(updatedStudents);
    sync('nz_students', updatedStudents);

    // Create a new transaction representing the purchase of this course
    const newTxn: Transaction = {
      id: `txn-add-${Date.now()}`,
      studentName: student.name,
      courseTitle: course.title,
      amount: course.price || 120000,
      paymentMethod: 'Pix',
      date: new Date().toISOString().substring(0, 10),
      status: 'completado'
    };
    const updatedTxns = [...transactions, newTxn];
    setTransactions(updatedTxns);
    sync('nz_transactions', updatedTxns);
  };

  const enrollExistingStudentDirectly = (studentData: Omit<Student, 'id' | 'registeredAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      enrolledCourses: studentData.enrolledCourses || [
        { courseId: studentData.courseId, courseTitle: studentData.courseTitle }
      ]
    };
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    sync('nz_students', updatedStudents);
  };

  const addNewCourse = (course: Course) => {
    const updatedCourses = [...courses, course];
    setCourses(updatedCourses);
    sync('nz_courses', updatedCourses);
    addActivityLog(`Curso criado: "${course.title}"`, 'courses');
  };

  const updateCourse = (courseId: string, updatedFields: Partial<Course>) => {
    const courseTitle = courses.find(c => c.id === courseId)?.title || courseId;
    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        const merged = { ...c, ...updatedFields };
        if (updatedFields.lessonsList) {
          merged.modulesCount = updatedFields.lessonsList.length;
        }
        return merged;
      }
      return c;
    });
    setCourses(updatedCourses);
    sync('nz_courses', updatedCourses);
    addActivityLog(`Curso atualizado: "${courseTitle}"`, 'courses');
  };

  const deleteCourse = (courseId: string) => {
    const courseTitle = courses.find(c => c.id === courseId)?.title || courseId;
    const updatedCourses = courses.filter(c => c.id !== courseId);
    setCourses(updatedCourses);
    sync('nz_courses', updatedCourses);
    if (supabase) {
      dbService.testConnection().then(isConnected => {
        if (isConnected) {
          supabase.from('courses').delete().eq('id', courseId).then(({ error }: { error: any }) => {
            if (error) console.warn("Supabase course delete error:", error);
            else console.log(`☁️ Supabase: Curso ${courseId} deletado com sucesso.`);
          });
        }
      });
    }
    addActivityLog(`Curso apagado: "${courseTitle}"`, 'courses');
  };

  const deleteStudent = (studentId: string) => {
    const studentName = students.find(s => s.id === studentId)?.name || studentId;
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    sync('nz_students', updatedStudents);
    if (supabase) {
      dbService.testConnection().then(isConnected => {
        if (isConnected) {
          supabase.from('students').delete().eq('id', studentId).then(({ error }: { error: any }) => {
            if (error) console.warn("Supabase student delete error:", error);
            else console.log(`☁️ Supabase: Aluno ${studentId} deletado com sucesso.`);
          });
        }
      });
    }
    addActivityLog(`Aluno removido do sistema: "${studentName}"`, 'system');
  };

  const addNewPost = (content: string, tags: string[]) => {
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

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    sync('nz_posts', updatedPosts);
  };

  const likePost = (postId: string) => {
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const liked = !p.likedByCurrentUser;
        return {
          ...p,
          likedByCurrentUser: liked,
          likes: liked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    });
    setPosts(updatedPosts);
    sync('nz_posts', updatedPosts);
  };

  const addComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    const authorName = currentUser?.name || 'Anônimo';
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `c-${Date.now()}`,
              authorName,
              content: text,
              createdAt: 'Agora mesmo'
            }
          ]
        };
      }
      return p;
    });
    setPosts(updatedPosts);
    sync('nz_posts', updatedPosts);
  };

  const deletePost = (postId: string) => {
    const updatedPosts = posts.filter(p => p.id !== postId);
    setPosts(updatedPosts);
    sync('nz_posts', updatedPosts);
  };

  const updateProfile = (name: string, email: string, whatsapp: string, avatar?: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name, email, whatsapp, ...(avatar ? { avatar } : {}) };
    setCurrentUser(updatedUser);
    sync('nz_current_user', updatedUser);

    addActivityLog(`Perfil de utilizador atualizado: ${name}`, 'profile', name);

    // If student role, keep student list in sync
    if (currentUser.role === 'aluno') {
      const isStudentInList = students.some(s => s.email === currentUser.email);
      if (isStudentInList) {
        const updatedStudents = students.map(s => {
          if (s.email === currentUser.email) {
            return { ...s, name, email, whatsapp };
          }
          return s;
        });
        setStudents(updatedStudents);
        sync('nz_students', updatedStudents);
      }
    }
  };

  const addActivityLog = (action: string, category: ActivityLog['category'], user?: string) => {
    const activeUserName = user || currentUser?.name || 'Sistema Nzila';
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: activeUserName,
      action,
      category
    };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 150);
    setActivityLogs(updatedLogs);
    sync('nz_logs', updatedLogs);
  };

  const triggerSystemNotification = (title: string, message: string, category: SystemNotification['category'], targetCourseId?: string) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      category,
      read: false,
      targetCourseId
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    sync('nz_notifications', updatedNotifs);

    let logMessage = `Notificação enviada: "${title}"`;
    if (targetCourseId) {
      const courseName = courses.find(c => c.id === targetCourseId)?.title || targetCourseId;
      logMessage = `Notificação direcionada enviada: "${title}" para alunos do curso "${courseName}"`;
    }
    addActivityLog(logMessage, 'notification');
  };

  const markNotificationsAsRead = () => {
    const updatedNotifs = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifs);
    sync('nz_notifications', updatedNotifs);
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
      addNewPost,
      likePost,
      addComment,
      deletePost,
      updateProfile,
      addActivityLog,
      triggerSystemNotification,
      markNotificationsAsRead,
      supabaseConnected,
      syncAllToSupabase,
      pullAllFromSupabase,
      factoryReset
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
