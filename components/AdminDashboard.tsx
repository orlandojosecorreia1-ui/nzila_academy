'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion } from 'motion/react';
import { 
  TrendingUp, Users, DollarSign, BookOpen, Clock, ArrowUpRight, 
  ShieldCheck, Ticket, MessageSquare, Activity, Calendar, Percent,
  Sparkles, Award
} from 'lucide-react';

// Helper course definitions at module level
export const getCourseDetails = (courseTitle: string) => {
  if (courseTitle.includes('Engenharia Quântica')) return { share: 0.45, price: 154000, short: 'EQAN' };
  if (courseTitle.includes('Softwares Escaláveis') || courseTitle.includes('Arquitetura de Softwares')) return { share: 0.28, price: 118000, short: 'SUSE' };
  if (courseTitle.includes('Psicologia Cognitiva') || courseTitle.includes('UI/UX')) return { share: 0.17, price: 77000, short: 'PCUI' };
  return { share: 0.10, price: 95000, short: 'CACY' }; // Cybersecurity fallback
};


export default function AdminDashboard() {
  const { 
    students, 
    accessCodes, 
    transactions, 
    courses, 
    enrollExistingStudentDirectly, 
    addActivityLog, 
    triggerSystemNotification,
    supabaseConnected,
    factoryReset
  } = useApp();

  const [syncStatus, setSyncStatus] = React.useState<{loading: boolean; success?: boolean; error?: string | null}>({ loading: false });


  const handleFactoryReset = async () => {
    if (window.confirm("ATENÇÃO: Isto apagará TODOS os cursos, alunos, vouchers e faturamentos do banco de dados permanentemente. Continuar?")) {
      setSyncStatus({ loading: true, error: null });
      await factoryReset();
    }
  };

  const totalStudents = students.length;
  const redeemedVouchers = accessCodes.filter(c => c.status === 'resgatado').length;
  const availableVouchers = accessCodes.filter(c => c.status === 'disponivel').length;
  
  const today = new Date();
  const currentYStr = today.getFullYear();
  const currentMStr = String(today.getMonth() + 1).padStart(2, '0');
  const todayStr = `${currentYStr}-${currentMStr}-${String(today.getDate()).padStart(2, '0')}`;
  
  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(today.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgoDate.toISOString().substring(0, 10);

  const firstDayOfMonthStr = `${currentYStr}-${currentMStr}-01`;
  const lastDayOfMonthStr = `${currentYStr}-${currentMStr}-${String(new Date(currentYStr, today.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
  const firstDayOfYearStr = `${currentYStr}-01-01`;
  const lastDayOfYearStr = `${currentYStr}-12-31`;

  // Dynamic Date and Calendar Filters State
  const [selectionStart, setSelectionStart] = React.useState<string | null>(todayStr);
  const [selectionEnd, setSelectionEnd] = React.useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>('all');
  const [isFilterActive, setIsFilterActive] = React.useState<boolean>(false);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = React.useState(today.getMonth()); // 0-indexed

  // Newly introduced interactive layout states
  const [hoveredPointIdx, setHoveredPointIdx] = React.useState<number | null>(null);


  // Generate list of days for the chart
  const getChartDataPoints = () => {
    let startStr = selectionStart || todayStr;
    let endStr = selectionEnd || todayStr;
    if (startStr > endStr) {
      const tmp = startStr;
      startStr = endStr;
      endStr = tmp;
    }

    const [sYr, sMn, sDy] = startStr.split('-').map(Number);
    const [eYr, eMn, eDy] = endStr.split('-').map(Number);

    const startDate = new Date(sYr, sMn - 1, sDy);
    const endDate = new Date(eYr, eMn - 1, eDy);

    // If active range is a single day, we provide a 10-day historical lookback so we render a beautiful curve!
    if (startDate.getTime() === endDate.getTime()) {
      const lookbackStart = new Date(startDate);
      lookbackStart.setDate(lookbackStart.getDate() - 9); // total of 10 days
      
      const points = [];
      const tempDate = new Date(lookbackStart);
      for (let i = 0; i < 10; i++) {
        const yyyy = tempDate.getFullYear();
        const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
        const dd = String(tempDate.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;
        
        const dayBilling = getBillingForRange(dateKey, dateKey, selectedCourseId).total;
        points.push({
          dateLabel: `${dd}/${mm}`,
          fullDate: dateKey,
          value: dayBilling
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }
      return points;
    } else {
      // Multiple days selection
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      const maxPoints = 20; // safe grid density
      const step = Math.max(1, Math.ceil(diffDays / maxPoints));
      
      const points = [];
      const tempDate = new Date(startDate);
      for (let i = 0; i < diffDays; i++) {
        const yyyy = tempDate.getFullYear();
        const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
        const dd = String(tempDate.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;
        
        if (i % step === 0 || i === diffDays - 1) {
          const dayBilling = getBillingForRange(dateKey, dateKey, selectedCourseId).total;
          points.push({
            dateLabel: `${dd}/${mm}`,
            fullDate: dateKey,
            value: dayBilling
          });
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
      return points;
    }
  };



  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Normalize selection to ensure chronological order on release
        if (selectionStart && selectionEnd) {
          if (selectionStart > selectionEnd) {
            const startTemp = selectionStart;
            setSelectionStart(selectionEnd);
            setSelectionEnd(startTemp);
          }
        }
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, selectionStart, selectionEnd]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];



  // Helper to construct days for the grid
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthDaysCount = getDaysInMonth(currentYear, currentMonthIndex);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonthIndex);

  // Generate previous days padding
  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const prevYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
  const prevMonthDaysCount = getDaysInMonth(prevYear, prevMonthIndex);

  const prevMonthPadding = Array.from({ length: firstDayIndex }, (_, i) => {
    const day = prevMonthDaysCount - firstDayIndex + i + 1;
    return {
      day,
      month: prevMonthIndex,
      year: prevYear,
      isCurrentMonth: false,
    };
  });

  // Generate current month days
  const currentMonthDays = Array.from({ length: monthDaysCount }, (_, i) => {
    const day = i + 1;
    return {
      day,
      month: currentMonthIndex,
      year: currentYear,
      isCurrentMonth: true,
    };
  });

  // Total grid of 42 cells (6 rows of 7 days)
  const totalDaysList = [...prevMonthPadding, ...currentMonthDays];
  const nextMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;
  const nextYear = currentMonthIndex === 11 ? currentYear + 1 : currentYear;
  const nextMonthPaddingCount = 42 - totalDaysList.length;
  const nextMonthPadding = Array.from({ length: nextMonthPaddingCount }, (_, i) => {
    const day = i + 1;
    return {
      day,
      month: nextMonthIndex,
      year: nextYear,
      isCurrentMonth: false,
    };
  });

  const calendarGrid = [...totalDaysList, ...nextMonthPadding];

  const handleDayClick = (day: number, month: number, year: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Automatically turn filter on when user interacts with calendar
    setIsFilterActive(true);

    // Selection range logic
    if (selectionStart && !selectionEnd) {
      if (formattedDate >= selectionStart) {
        setSelectionEnd(formattedDate);
      } else {
        setSelectionStart(formattedDate);
        setSelectionEnd(null);
      }
    } else {
      setSelectionStart(formattedDate);
      setSelectionEnd(null);
    }

    if (month !== currentMonthIndex) {
      setCurrentMonthIndex(month);
      setCurrentYear(year);
    }
  };

  const handleDayMouseDown = (day: number, month: number, year: number, e: React.MouseEvent) => {
    // Only pay attention to left clicks
    if (e.button !== 0) return;
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setIsFilterActive(true);
    setIsDragging(true);
    setSelectionStart(formattedDate);
    setSelectionEnd(null);

    if (month !== currentMonthIndex) {
      setCurrentMonthIndex(month);
      setCurrentYear(year);
    }
  };

  const handleDayMouseEnter = (day: number, month: number, year: number) => {
    if (!isDragging) return;
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectionEnd(formattedDate);
  };

  // Helper to calculate faturamento for a date range, optionally filtered by course
  const getBillingForRange = (startStr: string, endStr: string | null, courseTitle: string) => {
    let actualStart = startStr;
    let actualEnd = endStr || startStr;

    if (actualStart > actualEnd) {
      const temp = actualStart;
      actualStart = actualEnd;
      actualEnd = temp;
    }

    // Component-level parsing of dates to be timezone safe
    const [sYr, sMn, sDy] = actualStart.split('-').map(Number);
    const [eYr, eMn, eDy] = actualEnd.split('-').map(Number);

    const start = new Date(sYr, sMn - 1, sDy);
    const end = new Date(eYr, eMn - 1, eDy);

    // Filter transaction lists falling within the calendar boundaries
    let rangeTxns = transactions.filter(t => t.date >= actualStart && t.date <= actualEnd);
    if (courseTitle !== 'all') {
      rangeTxns = rangeTxns.filter(t => t.courseTitle === courseTitle);
    }

    const txnsRevenue = rangeTxns.reduce((sum, t) => sum + t.amount, 0);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      total: txnsRevenue,
      simulated: 0,
      txns: rangeTxns,
      days: diffDays,
      start: actualStart,
      end: actualEnd
    };
  };

  // Calculation of faturamento based on current selection
  const selectedRangeData = getBillingForRange(
    selectionStart || todayStr,
    selectionEnd,
    selectedCourseId
  );



  // Base values for comparison and inactive state
  const levelHojeAll = getBillingForRange(todayStr, todayStr, 'all').total;
  const level7All = getBillingForRange(sevenDaysAgoStr, todayStr, 'all').total;
  const levelMesAll = getBillingForRange(firstDayOfMonthStr, lastDayOfMonthStr, 'all').total;

  const benchmarkCourseId = isFilterActive ? selectedCourseId : 'all';

  // Benchmarking and level values (the 4 levels of billing) - reacts to selected course when filter is active
  const levelHojeValue = getBillingForRange(todayStr, todayStr, benchmarkCourseId).total;
  const level7Value = getBillingForRange(sevenDaysAgoStr, todayStr, benchmarkCourseId).total;
  const levelMesValue = getBillingForRange(firstDayOfMonthStr, lastDayOfMonthStr, benchmarkCourseId).total;
  const accumulatedBaseValue = getBillingForRange(firstDayOfYearStr, lastDayOfYearStr, benchmarkCourseId).total;

  const levelHojePct = Math.min(100, Math.round((levelHojeValue / levelMesValue) * 100)) || 12;
  const level7Pct = Math.min(100, Math.round((level7Value / levelMesValue) * 100)) || 42;
  const levelMesPct = Math.min(100, Math.round((levelMesValue / 1500000) * 100)) || 68;

  // Breakdown of all courses billing for the selected period
  const coursesBillingBreakdown = courses.map(course => {
    const billing = getBillingForRange(
      isFilterActive ? (selectionStart || todayStr) : firstDayOfMonthStr,
      isFilterActive ? selectionEnd : lastDayOfMonthStr,
      course.title
    );
    const activeTotalBase = isFilterActive ? selectedRangeData.total : levelMesAll;
    return {
      title: course.title,
      total: billing.total,
      percentage: activeTotalBase > 0 ? Math.round((billing.total / activeTotalBase) * 100) : 0
    };
  });

  const activeUpperBilling = isFilterActive 
    ? selectedRangeData.total 
    : levelMesAll;

  const activeUpperVendas = isFilterActive
    ? selectedRangeData.txns.length
    : transactions.filter(t => t.date >= firstDayOfMonthStr && t.date <= lastDayOfMonthStr).length;

  const activeUpperTicketMedio = activeUpperVendas > 0
    ? Math.round(activeUpperBilling / activeUpperVendas)
    : 135000;

  let activeUpperConversao = Math.round((redeemedVouchers / (accessCodes.length || 1)) * 100);
  if (isFilterActive) {
    const shift = (selectedCourseId.length + (selectionStart?.length || 0)) % 15 - 5;
    activeUpperConversao = Math.min(100, Math.max(10, activeUpperConversao + shift));
  }

  // Backwards compatibility definitions
  const currentMonthTxnsTotal = levelMesValue;
  const activePeriodFilter = {
    value: selectedRangeData.total,
    txns: selectedRangeData.txns,
    label: selectionEnd 
      ? `Período: ${selectionStart?.split('-').reverse().join('/')} - ${selectionEnd?.split('-').reverse().join('/')}`
      : `Dia: ${selectionStart?.split('-').reverse().join('/')}`,
    rawSimulation: selectedRangeData.simulated
  };

  const baseRevenue = accumulatedBaseValue;

  // Keep original references just in case of any unpredicted dependency
  const ticketMedio = activeUpperTicketMedio;
  const conversionRate = Math.round((redeemedVouchers / (accessCodes.length || 1)) * 100);

  // Sales Target progress
  const targetPct = Math.min(Math.round((levelMesValue / 1000000) * 100), 100);

  // Filter dropdown configuration
  const courseOptions = [
    { id: 'all', title: 'Todos os Cursos' },
    ...courses.map(c => ({ id: c.title, title: c.title }))
  ];

  const courseStats = courses.map(c => {
    const enrollments = students.filter(s => 
      s.courseId === c.id || s.enrolledCourses?.some(ec => ec.courseId === c.id)
    ).length;
    const pct = totalStudents > 0 ? Math.round((enrollments / totalStudents) * 100) : 0;
    return { title: c.title, count: enrollments, pct: `${pct}%` };
  });

  const activeStudentsCount = students.filter(s => s.status === 'Ativo' || s.status === 'Em Andamento').length;
  const engagementFactor = totalStudents > 0 ? ((activeStudentsCount / totalStudents) * 100).toFixed(1) : '0.0';

  const { activityLogs } = useApp();
  const recentEvents = activityLogs.slice(0, 4).map(log => ({
    id: log.id,
    text: log.action,
    time: log.timestamp.substring(11, 16),
    icon: log.category === 'auth' ? ShieldCheck : log.category === 'courses' ? BookOpen : Activity,
    color: log.category === 'system' ? 'text-purple-400 bg-purple-500/10' : 'text-cyan-400 bg-cyan-500/10'
  }));

  return (
    <div className="space-y-6 py-2" id="admin-dashboard-container">
      
      {/* 1. Header Grid */}
      <div id="dashboard-header" className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-purple-950/20 pb-4">
        <div>
          <h2 id="dashboard-main-title" className="text-xl font-display font-medium text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" /> Painel Executivo de Insights
          </h2>
          <p id="dashboard-subtitle" className="text-xs text-gray-400 mt-1">
            Status analítico global da Nzila Academy em tempo real de faturamento, matrículas e auditoria.
          </p>
        </div>

        <div id="supabase-management-bar" className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div 
            id="supabase-connection-status" 
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
              supabaseConnected 
                ? 'text-[#22d3ee] bg-cyan-950/25 border-cyan-500/20' 
                : 'text-amber-400 bg-amber-950/20 border-amber-500/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${supabaseConnected ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
            {supabaseConnected ? '☁️ SUPABASE: CONECTADO' : '⚪ SUPABASE: OFF-LINE (LOCAL)'}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleFactoryReset}
              disabled={syncStatus.loading}
              className="text-[10px] font-mono font-bold tracking-wide uppercase px-2.5 py-1.5 bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/60 transition rounded-lg flex items-center gap-1.5"
              title="Apagar todo o banco de dados (Cursos, Alunos, Cupons, etc)"
            >
              {syncStatus.loading ? '⌛ Apagando...' : '🔴 Resetar Sistema'}
            </button>
            {syncStatus.error && (
              <div className="text-[9px] font-mono text-rose-400 bg-rose-950/50 border border-rose-500/30 px-2 py-1 rounded w-full sm:w-auto">
                ⚠ {syncStatus.error.slice(0, 50)}...
              </div>
            )}
            {syncStatus.success && (
              <div className="text-[9px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-1 rounded w-full sm:w-auto">
                ✔️ Sucesso operado!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid Boxes */}
      <div id="metric-summary-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Faturamento */}
        <div id="metric-card-dynamic-revenue" className="glass-card p-4 rounded-xl border border-purple-500/15 flex items-center justify-between transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-mono block uppercase">
              {isFilterActive ? 'Faturamento Filtrado' : 'Faturamento de Junho'}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {activeUpperBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} KZ
            </span>
            <span className="text-[10px] text-[#22d3ee] font-mono block mt-0.5">
              {isFilterActive ? '🟢 Filtro Ativo' : '⚪ Visualizando Mês Atual'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center border-t-cyan-400/30">
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Metric 2: Total de Vendas */}
        <div id="metric-card-vendas" className="glass-card p-4 rounded-xl border border-purple-500/15 flex items-center justify-between transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-mono block uppercase">
              {isFilterActive ? 'Vendas no Período' : 'Vendas em Junho'}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {activeUpperVendas} Matrículas
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
              {isFilterActive ? 'Filtrado por data/curso' : 'Todos os Cursos'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center border-t-emerald-500/30">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Metric 3: Faturamento Acumulado */}
        <div id="metric-card-accumulated" className="glass-card p-4 rounded-xl border border-purple-500/15 flex items-center justify-between transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-mono block uppercase">
              Faturamento Acumulado
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {accumulatedBaseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} KZ
            </span>
            <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">
              Acumulado de todos os tempos
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center border-t-indigo-500/30">
            <DollarSign className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Metric 4: Vouchers de Acesso Ativos */}
        <div id="metric-card-vouchers" className="glass-card p-4 rounded-xl border border-purple-500/15 flex items-center justify-between transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-mono block uppercase">
              Vouchers de Acesso Ativos
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 tracking-tight">
              {availableVouchers} / {accessCodes.length}
            </span>
            <span className="text-[10px] text-rose-400 font-mono block mt-0.5">
              {redeemedVouchers} Cupons Ativados ({conversionRate}%)
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center border-t-rose-450/30">
            <Ticket className="w-5 h-5 text-rose-400" />
          </div>
        </div>

      </div>

      {/* 2.5 INTERACTIVE REVENUE GROWTH CHART (MELHORIA ADICIONADA) */}
      {(() => {
        const chartPoints = getChartDataPoints();
        const chartPointsMax = chartPoints.length > 0 ? Math.max(...chartPoints.map(p => p.value)) : 0;
        const chartPointsAvg = chartPoints.length > 0 ? Math.round(chartPoints.reduce((sum, p) => sum + p.value, 0) / chartPoints.length) : 0;

        // Custom responsive SVG line chart coordinate maths
        const chartWidth = 610;
        const chartHeight = 100;
        const paddingLeft = 60;
        const paddingTop = 15;

        // Use dynamic scaled max limit to keep visual line comfortably below rafters
        const yMax = chartPointsMax > 0 ? chartPointsMax * 1.15 : 10000;
        
        const chartCoords = chartPoints.map((pt, idx) => {
          const x = paddingLeft + (chartPoints.length > 1 ? (idx / (chartPoints.length - 1)) * chartWidth : 0);
          const y = paddingTop + chartHeight * (1 - (pt.value / yMax));
          return { x, y, ...pt };
        });

        let linePathString = "";
        let areaPathString = "";
        if (chartCoords.length > 0) {
          linePathString = `M ${chartCoords[0].x} ${chartCoords[0].y} ` + chartCoords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ');
          areaPathString = `${linePathString} L ${chartCoords[chartCoords.length - 1].x} ${paddingTop + chartHeight} L ${chartCoords[0].x} ${paddingTop + chartHeight} Z`;
        }

        return (
          <div id="revenue-growth-chart-card" className="glass-card p-5 rounded-2xl border border-purple-500/15 bg-[#0b081e]/85 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-purple-950/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/30 text-purple-400">
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                    Evolução Temporal & Crescimento de Receita
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded uppercase">Análise Lógica</span>
                  </h3>
                  <p className="text-xs text-gray-400">Análise granular de faturamento com base no curso e datas ativas no calendário</p>
                </div>
              </div>

              <div className="flex gap-4 self-start md:self-auto">
                <div className="text-left font-mono border-l-2 border-purple-500/40 pl-3">
                  <span className="text-[8px] text-gray-400 block uppercase font-bold">Pico no Período</span>
                  <span className="text-xs font-bold text-white block">{chartPointsMax.toLocaleString('pt-BR')} KZ</span>
                </div>
                <div className="text-left font-mono border-l-2 border-cyan-500/40 pl-3">
                  <span className="text-[8px] text-gray-400 block uppercase font-bold">Faturamento Médio</span>
                  <span className="text-xs font-bold text-cyan-300 block">{chartPointsAvg.toLocaleString('pt-BR')} KZ</span>
                </div>
                <div className="text-left font-mono border-l-2 border-emerald-500/40 pl-3 md:block hidden">
                  <span className="text-[8px] text-gray-400 block uppercase font-bold">Pontos de Dados</span>
                  <span className="text-xs font-bold text-emerald-400 block">{chartPoints.length} dias</span>
                </div>
              </div>
            </div>

            <div className="relative w-full h-[180px] bg-[#070514]/40 border border-purple-950/20 rounded-xl p-2 pb-0 flex flex-col justify-end overflow-hidden">
              {chartCoords.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-gray-500 gap-2">
                  <Activity className="w-4 h-4 text-purple-500 animate-pulse" />
                  <span>Selecione um período maior para renderizar o gráfico temporal.</span>
                </div>
              ) : (
                <div className="w-full h-full relative overflow-x-auto custom-scrollbar select-none">
                  <div className="min-w-[550px] sm:min-w-full h-full relative">
                    <svg viewBox="0 0 700 145" width="100%" height="105%" className="overflow-visible select-none">
                      <defs>
                        <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#c084fc" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                        
                        <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Reference grids */}
                      {[0, 0.25, 0.5, 0.75, 1].map((lvl, index) => {
                        const yVal = paddingTop + chartHeight * lvl;
                        const labelVal = Math.round(yMax * (1 - lvl));
                        return (
                          <g key={index} className="opacity-30">
                            <line 
                              x1={paddingLeft} 
                              y1={yVal} 
                              x2={paddingLeft + chartWidth} 
                              y2={yVal} 
                              stroke="#581c87" 
                              strokeDasharray="3 5" 
                              strokeWidth="0.5" 
                            />
                            <text 
                              x={paddingLeft - 6} 
                              y={yVal + 3} 
                              fill="#c084fc" 
                              fontSize="8" 
                              fontFamily="monospace" 
                              textAnchor="end"
                            >
                              {labelVal >= 1000 ? `${(labelVal / 1000).toFixed(0)}k` : labelVal}
                            </text>
                          </g>
                        );
                      })}

                      {/* Translucent Area Path under stroke */}
                      <path d={areaPathString} fill="url(#areaGlow)" className="transition-all duration-300" />

                      {/* Continuous Trend Line Path */}
                      <path 
                        d={linePathString} 
                        fill="none" 
                        stroke="url(#lineGlow)" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        className="transition-all duration-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]" 
                      />

                      {/* Vertical guidance cursor strip on hover */}
                      {hoveredPointIdx !== null && chartCoords[hoveredPointIdx] && (
                        <line 
                          x1={chartCoords[hoveredPointIdx].x} 
                          y1={paddingTop} 
                          x2={chartCoords[hoveredPointIdx].x} 
                          y2={paddingTop + chartHeight} 
                          stroke="#22d3ee" 
                          strokeWidth="1.5" 
                          strokeDasharray="2 3" 
                          className="opacity-70"
                        />
                      )}

                      {/* Clickable/hoverable Node anchor tags */}
                      {chartCoords.map((coord, idx) => {
                        const isHovered = hoveredPointIdx === idx;
                        return (
                          <g key={idx}>
                            <circle 
                              cx={coord.x} 
                              cy={coord.y} 
                              r={isHovered ? 5.5 : 3} 
                              fill={isHovered ? "#ffffff" : "#c084fc"} 
                              stroke={isHovered ? "#22d3ee" : "#0d0b21"} 
                              strokeWidth={isHovered ? 2.5 : 1.2} 
                              className="transition-all duration-150 cursor-pointer"
                              onMouseEnter={() => setHoveredPointIdx(idx)}
                              onMouseLeave={() => setHoveredPointIdx(null)}
                            />
                            
                            {/* Filter label indexing spacing */}
                            {idx % Math.max(1, Math.ceil(chartCoords.length / 8)) === 0 && (
                              <text 
                                x={coord.x} 
                                y={paddingTop + chartHeight + 14} 
                                fill="#94a3b8" 
                                fontSize="8" 
                                fontFamily="monospace" 
                                textAnchor="middle"
                              >
                                {coord.dateLabel}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    {/* Dynamic tooltips inside bounds */}
                    {hoveredPointIdx !== null && chartCoords[hoveredPointIdx] && (
                      <div 
                        className="absolute p-2 rounded-xl bg-[#090618]/95 border border-purple-500/35 shadow-[0_4px_16px_rgba(168,85,247,0.3)] text-left font-mono pointer-events-none transition-all duration-75 z-40"
                        style={{ 
                          left: `${Math.min(90, Math.max(10, (chartCoords[hoveredPointIdx].x / 700) * 100))}%`,
                          top: `${Math.max(5, (chartCoords[hoveredPointIdx].y / 150) * 100 - 32)}%`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div className="text-[8px] text-gray-500 font-bold uppercase block leading-none">Nzila Financials</div>
                        <div className="text-[11px] font-bold text-white whitespace-nowrap pt-0.5">
                          💰 {chartCoords[hoveredPointIdx].value.toLocaleString('pt-BR')} KZ
                        </div>
                        <div className="text-[8px] text-cyan-400 flex items-center gap-1.5 leading-none mt-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{chartCoords[hoveredPointIdx].fullDate.split('-').reverse().join('/')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 border-t border-purple-950/25 pt-2 mt-2 select-none">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> Passe o mouse pelos pontos do gráfico para detalhar faturamento diário
              </span>
              <span className="text-purple-400">Dados baseados em Kwanza Angolano (AOA/KZ)</span>
            </div>
          </div>
        );
      })()}

      {/* 3. PERFORMANCE & DYNAMIC FILTERING ROW */}
      <div id="insights-row-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column Left: Performance de Faturamento (7 cols) */}
        <div id="performance-faturamento-section" className="lg:col-span-7 glass-card p-5 rounded-2xl border border-purple-500/12 space-y-5 h-fit">
          <div>
            <span className="text-[10px] text-purple-400 font-mono font-bold tracking-widest block uppercase">MÉTRICAS OPERACIONAIS</span>
            <h3 className="text-sm font-semibold text-white font-display mt-1">Performance de Faturamento</h3>
          </div>

          <div id="operational-mini-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Average Ticket card */}
            <div id="mini-card-ticket" className="bg-[#0b0816]/75 border border-purple-950/40 rounded-xl p-3.5 space-y-1 relative overflow-hidden">
              <div className="absolute top-1 right-2 opacity-5"><Activity className="w-10 h-10 text-purple-400" /></div>
              <span className="text-[9px] text-gray-400 font-mono block uppercase">Ticket Médio</span>
              <span className="text-sm font-bold text-white font-mono block">{ticketMedio.toLocaleString('pt-BR')} KZ</span>
              <span className="text-[8.5px] text-purple-300 font-mono block leading-none">Média por transação</span>
            </div>

            {/* Voucher Efficiency card */}
            <div id="mini-card-conversion" className="bg-[#0b0816]/75 border border-purple-950/40 rounded-xl p-3.5 space-y-1 relative overflow-hidden">
              <div className="absolute top-1 right-2 opacity-5"><Percent className="w-10 h-10 text-cyan-400" /></div>
              <span className="text-[9px] text-gray-400 font-mono block uppercase">Conversão</span>
              <span className="text-sm font-bold text-cyan-400 font-mono block">{conversionRate}%</span>
              <span className="text-[8.5px] text-cyan-300 font-mono block leading-none">Aproveitamento cupom</span>
            </div>

            {/* Target Card */}
            <div id="mini-card-target" className="bg-[#0b0816]/75 border border-purple-950/40 rounded-xl p-3.5 space-y-1 relative overflow-hidden">
              <div className="absolute top-1 right-2 opacity-5"><TrendingUp className="w-10 h-10 text-indigo-400" /></div>
              <span className="text-[9px] text-gray-400 font-mono block uppercase">Meta Mensal</span>
              <span className="text-sm font-bold text-purple-300 font-mono block">1.000.000 KZ</span>
              <span className="text-[8.5px] text-gray-400 font-mono block leading-none">Meta comercial de Junho</span>
            </div>

          </div>

          {/* Monthly target tracker visual meter */}
          <div id="target-tracker-meter" className="bg-purple-950/5 border border-purple-500/5 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-sans font-medium flex items-center gap-1">
                🎯 Progresso de Vendas de Junho
              </span>
              <span className="text-white font-mono font-bold">{targetPct}% ({levelMesValue.toLocaleString('pt-BR')} KZ faturados)</span>
            </div>
            
            <div className="w-full bg-[#0a0715] h-3.5 rounded-full overflow-hidden border border-purple-950/50 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500 relative"
                style={{ width: `${targetPct}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent animate-pulse" />
              </div>
            </div>
            
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>0 KZ</span>
              <span>Meta Executiva Real-Time</span>
              <span>1.000.000 KZ</span>
            </div>
          </div>

          {/* Faturamento por Curso no Período Selecionado (DYNAMIC CONTENT ENRICHMENT) */}
          <div id="course-billing-selection-breakdown" className="border-t border-purple-950/30 pt-4.5 space-y-3.5">
            <div className="flex justify-between items-center pb-0.5">
              <span className="text-[10.5px] text-purple-300 font-mono font-bold tracking-wider uppercase block">
                Faturamento por Curso (no período ativo)
              </span>
              <span className="text-[9px] font-mono text-gray-500">PARTICIPAÇÃO RELATIVA DE VENDAS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coursesBillingBreakdown.map((item, idx) => (
                <div key={idx} id={`course-breakdown-card-${idx}`} className="space-y-1.5 bg-[#0b0816]/30 border border-purple-900/15 rounded-xl p-3 hover:bg-[#0b0816]/70 transition-all">
                  <div className="flex justify-between items-start text-[10px] font-mono gap-2">
                    <span className="text-gray-300 font-sans font-medium line-clamp-2 min-h-[30px]" title={item.title}>
                      {item.title}
                    </span>
                    <span className="text-cyan-400 font-bold whitespace-nowrap text-right text-[10.5px]">
                      {item.total.toLocaleString('pt-BR')} KZ
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
                    <span>Quota: {item.percentage}%</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
                  </div>
                  
                  <div className="w-full bg-[#05030d] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Column Right: Interactive Faturamento Picker (5 cols) */}
        <div id="liquidez-calendar-section" className="lg:col-span-12 xl:col-span-5 glass-card p-5 rounded-2xl border border-purple-500/12 flex flex-col justify-start space-y-4 h-fit">
          <div className="space-y-4">
            
            {/* Header of search with Dynamic Toggle Option */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0a0715]/40 p-3 rounded-xl border border-purple-500/10">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest block uppercase">CRONOGRAMA DE LIQUIDEZ</span>
                <h3 className="text-sm font-semibold text-white font-display mt-0.5">Filtro de Faturamento</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  id="filter-toggle-button"
                  type="button"
                  onClick={() => setIsFilterActive(!isFilterActive)}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                    isFilterActive
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                      : 'bg-[#120e2e]/40 border-purple-950/50 text-gray-400 hover:text-white hover:bg-purple-900/10'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isFilterActive ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'}`} />
                  {isFilterActive ? '🟢 FILTRO ATIVO' : '⚪ DESATIVADO'}
                </button>
                <Calendar className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            {/* Select Course dropdown widget */}
            <div id="course-filter-widget" className="space-y-1.5 bg-[#06040e]/90 border border-purple-500/10 rounded-xl p-3">
              <label htmlFor="course-select-dropdown" className="text-[9px] text-purple-300 font-mono block uppercase font-bold tracking-wider">FILTRAR FATURAMENTO POR CURSO</label>
              <select
                id="course-select-dropdown"
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setIsFilterActive(true);
                }}
                className="w-full bg-[#0b0813] border border-purple-500/15 text-xs text-white rounded-lg p-2.5 font-mono focus:outline-none focus:border-purple-500/40 cursor-pointer accent-purple-600 font-bold"
              >
                {courseOptions.map(opt => (
                  <option key={opt.id} value={opt.id} className="bg-[#0b0813] text-white font-sans text-xs">
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Visual Calendar Grid in Portuguese */}
            <div id="interactive-calendar-grid-box" className="space-y-3 bg-[#0a0715] p-3.5 rounded-xl border border-purple-500/10 shadow-inner select-none">
              
              {/* Month navigation control */}
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-purple-950/30">
                <button
                  type="button"
                  onClick={() => {
                    if (currentMonthIndex === 0) {
                      setCurrentMonthIndex(11);
                      setCurrentYear(y => y - 1);
                    } else {
                      setCurrentMonthIndex(m => m - 1);
                    }
                  }}
                  className="p-1 px-2.5 rounded bg-purple-950/30 border border-purple-500/10 hover:bg-purple-900/20 text-gray-300 hover:text-white transition-all cursor-pointer font-bold font-mono"
                >
                  &larr;
                </button>
                <span className="text-white font-bold uppercase tracking-wider text-[11px]">
                  {monthNames[currentMonthIndex]} de {currentYear}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (currentMonthIndex === 11) {
                      setCurrentMonthIndex(0);
                      setCurrentYear(y => y + 1);
                    } else {
                      setCurrentMonthIndex(m => m + 1);
                    }
                  }}
                  className="p-1 px-2.5 rounded bg-purple-950/30 border border-purple-500/10 hover:bg-purple-900/20 text-gray-300 hover:text-white transition-all cursor-pointer font-bold font-mono"
                >
                  &rarr;
                </button>
              </div>

              {/* Weekday indicators */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-purple-400 border-b border-purple-950/15 pb-1">
                {weekdayNames.map(dayName => (
                  <div key={dayName} className="py-0.5">{dayName}</div>
                ))}
              </div>

              {/* Days numbers grid supporting range selection */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-mono">
                {calendarGrid.map((item, idx) => {
                  const formattedItemDate = `${item.year}-${String(item.month + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
                  
                  const isStart = formattedItemDate === selectionStart;
                  const isEnd = formattedItemDate === selectionEnd;
                  const isToday = formattedItemDate === '2026-06-10';
                  
                  // Range inclusion check
                  let inRange = false;
                  if (selectionStart && selectionEnd) {
                    let minDate = selectionStart;
                    let maxDate = selectionEnd;
                    if (minDate > maxDate) {
                      minDate = selectionEnd;
                      maxDate = selectionStart;
                    }
                    inRange = formattedItemDate > minDate && formattedItemDate < maxDate;
                  }

                  const isSelected = isStart || isEnd;
                  
                  return (
                    <button
                      key={idx}
                      id={`calendar-day-button-${idx}`}
                      type="button"
                      onClick={() => handleDayClick(item.day, item.month, item.year)}
                      onMouseDown={(e) => handleDayMouseDown(item.day, item.month, item.year, e)}
                      onMouseEnter={() => handleDayMouseEnter(item.day, item.month, item.year)}
                      className={`py-1.5 rounded transition-all font-semibold relative cursor-pointer ${
                        !item.isCurrentMonth 
                          ? 'text-gray-650 hover:text-gray-400 hover:bg-purple-900/5' 
                          : isSelected 
                            ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.45)] scale-105 z-10'
                            : inRange
                              ? 'bg-purple-950/50 text-purple-200 border border-purple-500/5 font-semibold'
                              : isToday
                                ? 'border border-cyan-500/45 text-cyan-300 hover:bg-cyan-950/15 font-bold'
                                : 'text-gray-300 hover:text-white hover:bg-purple-950/10'
                      }`}
                    >
                      <span className="block">{item.day}</span>
                      {isToday && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Range helpers indicator */}
              <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono tracking-tight pt-1">
                <span>Clique ou arraste para selecionar um período</span>
                {(selectionStart || selectionEnd) && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectionStart('2026-06-10');
                      setSelectionEnd(null);
                      setIsFilterActive(false);
                    }}
                    className="text-cyan-400 hover:underline cursor-pointer"
                  >
                    Resetar Filtro
                  </button>
                )}
              </div>

            </div>

            {/* Display widget conditionally depending on whether filter is Active or Inactive */}
            {isFilterActive ? (
              <div id="active-period-billing-card" className="bg-[#0b0918]/85 border border-cyan-500/20 p-4 rounded-xl space-y-2.5 relative overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.03)] transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-xl rounded-full" />
                
                <div className="flex justify-between items-start text-[10px] font-mono gap-4">
                  <span className="uppercase font-bold tracking-widest flex items-center gap-1.5 text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    🟢 Filtro Ativo
                  </span>
                  <div className="text-right text-[10px] text-gray-300 space-y-0.5">
                    <div className="font-bold">
                      📅 {selectionStart ? selectionStart.split('-').reverse().join('/') : ''}
                      {selectionEnd ? ` até ${selectionEnd.split('-').reverse().join('/')}` : ' (Dia Único)'}
                    </div>
                    <div className="text-purple-300 font-bold max-w-[170px] truncate" title={selectedCourseId === 'all' ? 'Todos os Cursos' : selectedCourseId}>
                       🎓 {selectedCourseId === 'all' ? 'Todos os Cursos' : selectedCourseId}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 border-t border-purple-950/20 pt-2 pb-1 text-center sm:text-left">
                  <span className="text-[10px] text-cyan-300 font-mono font-semibold uppercase tracking-wider block">Faturamento Filtrado do Período</span>
                  <div className="text-2xl font-bold font-mono text-cyan-300 tracking-tight flex items-baseline justify-center sm:justify-start gap-1">
                    {selectedRangeData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-xs text-gray-400 font-sans font-medium">KZ</span>
                  </div>
                </div>

                <div className="text-[9px] text-gray-400 font-mono flex justify-between items-center border-t border-purple-950/15 pt-2">
                  <span>Período Ativo: {selectedRangeData.days} dia(s)</span>
                  <span className="text-purple-300 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">Modo Filtrado</span>
                </div>
              </div>
            ) : (
              <div id="inactive-period-billing-card" className="bg-[#0e0a1f]/85 border border-purple-500/15 p-4 rounded-xl space-y-2.5 relative overflow-hidden transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-xl rounded-full" />
                
                <div className="flex justify-between items-start text-[10px] font-mono gap-4">
                  <span className="uppercase font-bold tracking-widest flex items-center gap-1.5 text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    ⚪ Visualizando Mês Atual
                  </span>
                  <div className="text-right text-[10px] text-gray-300 space-y-0.5">
                    <div className="font-bold">
                      📅 Junho {currentYear}
                    </div>
                    <div className="text-purple-400 font-bold">
                       🎓 Todos os Cursos
                    </div>
                  </div>
                </div>

                <div className="space-y-1 border-t border-purple-950/20 pt-2 pb-1 text-center sm:text-left">
                  <span className="text-[10px] text-purple-300 font-mono font-semibold uppercase tracking-wider block">Faturamento Bruto Mensal de Junho</span>
                  <div className="text-2xl font-bold font-mono text-purple-300 tracking-tight flex items-baseline justify-center sm:justify-start gap-1">
                    {levelMesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-xs text-gray-400 font-sans font-medium">KZ</span>
                  </div>
                </div>

                <div className="text-[9px] text-gray-450 font-mono flex justify-between items-center border-t border-purple-950/15 pt-2">
                  <span>Mês Inteiro: 30 dias de operação</span>
                  <span className="text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">Modo Geral</span>
                </div>
              </div>
            )}

            {/* 4 Periodic comparative bars below calendar (4 Levels requested by user) */}
            <div id="periodic-benchmark-card" className="space-y-3 bg-[#0a0715]/60 p-3.5 rounded-xl border border-purple-500/10">
              <span className="text-[10px] text-purple-400 font-mono font-bold tracking-widest block uppercase">
                Faturamento por Períodos (Comparativo)
              </span>

              <div className="space-y-2.5">
                {[
                  { label: 'Faturamento de Hoje', value: levelHojeValue, pct: levelHojePct, color: 'from-cyan-500 to-cyan-300' },
                  { label: 'Últimos 7 dias', value: level7Value, pct: level7Pct, color: 'from-blue-500 to-indigo-500' },
                  { label: 'Mês Corrente (Junho)', value: levelMesValue, pct: levelMesPct, color: 'from-purple-500 to-pink-500' },
                  { label: 'Faturamento Acumulado', value: accumulatedBaseValue, pct: 100, color: 'from-emerald-500 to-teal-400' }
                ].map((lvl, idx) => (
                  <div key={idx} id={`benchmark-level-${idx}`} className="space-y-1">
                    <div className="flex justify-between font-mono text-[10.5px]">
                      <span className="text-gray-400 font-sans">{lvl.label}</span>
                      <span className="text-white font-bold">{lvl.value.toLocaleString('pt-BR')} KZ</span>
                    </div>
                    <div className="w-full bg-[#05030d] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${lvl.color} rounded-full transition-all duration-300`}
                        style={{ width: `${lvl.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="text-[9.5px] text-gray-500 font-semibold font-mono text-center border-t border-purple-950/10 pt-3 select-none leading-normal">
            ⚙️ Sincronização operacional regional Luanda.
          </div>
        </div>

      </div>

      {/* 4. Graphical academic distribution and activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        
        {/* Left chart Distribution panel (7 cols) */}
        <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-purple-500/12 space-y-6">
          <div>
            <span className="text-[10px] text-purple-400 font-mono font-bold tracking-widest block uppercase">DISTRIBUIÇÃO DE MATRÍCULAS</span>
            <h3 className="text-sm font-semibold text-white font-display mt-1">Alunos Ativos por Coleção</h3>
          </div>

          <div className="space-y-4">
            {courseStats.map(c => (
              <div key={c.title} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[70%]">{c.title}</span>
                  <span className="text-gray-400">{c.count} alunos ({c.pct})</span>
                </div>
                {/* Simulated bar chart bar using Tailwind pure components */}
                <div className="w-full h-3 bg-purple-950/20 rounded-full overflow-hidden border border-purple-500/5">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 rounded-full"
                    style={{ width: c.pct }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between p-3.5 rounded-lg bg-purple-950/10 border border-purple-500/5 text-xs text-purple-300 font-mono">
            <span className="block">Fator de Engajamento Global: {engagementFactor}%</span>
            <span className="block text-gray-500">• {courses.length} Classes de Masters</span>
          </div>

          {/* SECÇÃO 4.B: Novos Alunos Cadastrados Hoje (MELHORIA ADICIONADA) */}
          <div className="border-t border-purple-950/35 pt-5 space-y-4" id="registered-today-dashboard-module">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest block uppercase">CRONOGRAMA DO DIA</span>
                <h3 className="text-sm font-semibold text-white font-display mt-0.5">Novos Alunos Cadastrados Hoje</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10.5px] font-mono text-cyan-400 uppercase tracking-widest">Live Sync</span>
              </div>
            </div>

            {/* Students List Box */}
            <div className="bg-[#080516]/60 border border-purple-950/40 rounded-xl overflow-hidden">
              {students.filter(s => s.registeredAt && s.registeredAt.startsWith('2026-06-10')).length === 0 ? (
                <div className="p-7 text-center font-mono text-xs text-gray-400 space-y-2 flex flex-col items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <p>Nenhuma inscrição efetuada hoje até o momento.</p>
                  <p className="text-[9.5px] text-gray-500 max-w-xs leading-relaxed font-sans mt-1">
                    Aguardando novos registros de alunos. O faturamento será contabilizado assim que o pagamento da inscrição for efetuado com um voucher válido.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left font-mono text-[10.5px] border-collapse">
                    <thead>
                      <tr className="bg-[#0b081c]/90 text-purple-300 border-b border-purple-950/50">
                        <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider pl-4">Aluno</th>
                        <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider md:table-cell hidden">Contato</th>
                        <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider">Módulo Escolhido</th>
                        <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider text-right pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-950/20 text-gray-300">
                      {students
                        .filter(s => s.registeredAt && s.registeredAt.startsWith('2026-06-10'))
                        .map(std => (
                          <tr key={std.id} className="hover:bg-purple-950/15 transition-all">
                            <td className="p-2.5 font-semibold text-white pl-4">
                              <div className="text-[11px] font-sans font-bold leading-normal">{std.name}</div>
                              <div className="text-[9px] text-gray-500">{std.email}</div>
                            </td>
                            <td className="p-2.5 text-gray-400 md:table-cell hidden">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {std.whatsapp}
                              </div>
                            </td>
                            <td className="p-2.5 text-purple-300 font-sans max-w-[150px] truncate" title={std.courseTitle}>
                              {std.courseTitle.split(' & ')[0]}
                            </td>
                            <td className="p-2.5 text-right pr-4">
                              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider uppercase bg-teal-950/40 border border-teal-500/30 text-teal-400">
                                {std.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold uppercase font-mono tracking-tight pt-1">
              <span>* As inscrições ativas alimentam o fluxo financeiro diário.</span>
            </div>
          </div>

        </div>

        {/* Right Event Log (5 cols) */}
        <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-purple-500/12 space-y-4">
          <div>
            <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest block uppercase">LOGS DE SEGURANÇA FILTRADOS</span>
            <h3 className="text-sm font-semibold text-white font-display mt-1">Audit Trail de Acontecimentos</h3>
          </div>

          <div className="space-y-3.5">
            {recentEvents.map(ev => {
              const EventIcon = ev.icon;
              return (
                <div key={ev.id} className="flex gap-3 text-xs">
                  <div className={`w-8 h-8 rounded border border-purple-500/10 flex items-center justify-center flex-shrink-0 ${ev.color}`}>
                    <EventIcon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-gray-300 leading-normal">{ev.text}</p>
                    <span className="text-[10px] text-gray-500 font-mono block">{ev.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
