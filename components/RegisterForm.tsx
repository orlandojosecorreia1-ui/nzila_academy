'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion } from 'motion/react';
import { ShieldCheck, User, Mail, MessageSquare, Ticket, Lock, ArrowRight, UserCheck, Settings, ExternalLink } from 'lucide-react';

export default function RegisterForm() {
  const { registerStudent, login, accessCodes, courses } = useApp();
  
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [accessCode, setAccessCode] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);



  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalCourseId = courseId || (courses.length > 0 ? courses[0].id : '');

    if (!name || !email || !whatsapp || !finalCourseId || !accessCode || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerStudent(name, email, whatsapp, finalCourseId, accessCode, password);
      setLoading(false);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setError(`Erro no registro: ${err.message || 'Falha de conexão com o banco de dados'}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Por favor, digite seu e-mail e senha de acesso legítimo.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setError(`Erro no login: ${err.message || 'Falha de conexão com o banco de dados'}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#07040d]">
      
      {/* Dynamic Ambient Mesh Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[550px] h-[450px] sm:h-[550px] rounded-full bg-amber-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-cyan-950/20 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 my-4 sm:my-8">
        
        {/* Left Hand: App branding detail */}
        <div className="lg:col-span-5 text-left flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs font-mono font-medium tracking-wide w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            NZILA DIGITAL
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-[1.1] neon-text-purple">
            Próxima Geração de Engenheiros de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400">Software & IA</span>
          </h1>
          
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Uma plataforma imposta com arquiteturas neurais, segurança post-quantum e sharding global de infraestrutura. Acesse masters ministradas pelos arquitetos de sistemas líderes do setor.
          </p>

          <div className="hidden lg:flex flex-col gap-4 border-t border-amber-950/40 pt-5 mt-4">
            <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Validador de Tokens off-line criptografados</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>CRM Integrado e Kanban de Alunos</span>
            </div>
          </div>
        </div>

        {/* Right Hand: Interactive Form */}
        <div className="lg:col-span-7">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="w-full glass-card p-6 sm:p-8 rounded-2xl relative border border-amber-500/10"
          >
            {/* Action Top bar toggle */}
            <div className="flex border-b border-amber-950/40 pb-5 mb-6 justify-between items-center text-sm">
              <div className="flex gap-4">
                <button 
                  onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                  className={`pb-2 relative font-medium transition-colors ${!isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Registo Seguro
                  {!isLogin && (
                    <motion.div layoutId="form-tab-border" className="absolute bottom-[-21px] left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-cyan-400" />
                  )}
                </button>
                <button 
                  onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                  className={`pb-2 relative font-medium transition-colors ${isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Entrar na Conta
                  {isLogin && (
                    <motion.div layoutId="form-tab-border" className="absolute bottom-[-21px] left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-cyan-400" />
                  )}
                </button>
              </div>


            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 text-xs font-mono flex gap-2">
                <span className="font-bold flex-shrink-0">⚠️ ERRO:</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-950/40 border border-green-500/20 text-green-200 text-xs font-mono flex gap-2">
                <span className="font-bold flex-shrink-0">✅ SUCESSO:</span>
                <span>{success}</span>
              </div>
            )}

            {/* FORM */}
            {!isLogin ? (
              // REGISTRATION FORM
              <form onSubmit={handleRegister} className="space-y-4">
                <p className="text-xs text-gray-400 mb-2">
                  Preencha os dados e valide seu código de acesso Nzila (`NZ-XXXX-X`) para receber matrícula imediata no curso desejado.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" /> Nome Completo
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                      required
                      id="register-input-name"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" /> E-mail Profissional
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@empresa.com"
                      className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                      required
                      id="register-input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Número WhatsApp
                    </label>
                    <input 
                      type="tel" 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+55 11 99999-9999"
                      className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                      required
                      id="register-input-whatsapp"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" /> Senha de Segurança
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                      required
                      id="register-input-password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  {/* Course Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                      Curso de Ingresso
                    </label>
                    <select 
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                      id="register-select-course"
                      disabled={courses.length === 0}
                    >
                      {courses.length === 0 ? (
                        <option value="" disabled className="bg-[#0e0722] text-rose-300">
                          Nenhum curso disponível. Crie um curso primeiro.
                        </option>
                      ) : (
                        courses.map(course => (
                          <option key={course.id} value={course.id} className="bg-[#0e0722] text-white">
                            [{course.category.toUpperCase()}] {course.title}
                          </option>
                        ))
                      )}
                    </select>
                    {courses.length === 0 && (
                      <p className="text-[10px] text-rose-400 mt-1">
                        ⚠️ Você apagou todos os cursos! Volte para o painel de administrador e crie pelo menos um curso e gere códigos de acesso para permitir novos cadastros.
                      </p>
                    )}
                  </div>

                  {/* Access Token Code */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-cyan-400" /> Código de Acesso Voucher
                    </label>
                    <input 
                      type="text" 
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      placeholder="Formato NZ-XXXX-X"
                      className="w-full font-mono bg-[#0a0715] border border-cyan-900/30 rounded-lg px-3.5 py-2 text-sm text-cyan-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                      required
                      id="register-input-access-code"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white text-sm font-medium rounded-lg font-display flex items-center justify-center gap-2 transition-all mt-3 border border-amber-500/20 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-submit-register"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Ativar Ingresso e Matricular-se <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // LOGIN FORM
              <form onSubmit={handleLogin} className="space-y-5">
                <p className="text-xs text-gray-400 mb-2">
                  Se você já realizou seu registro prévio, digite seu e-mail de acesso. O sistema verificará suas credenciais e fará o login automático.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-400" /> E-mail de Matrícula
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@exemplo.com"
                    className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                    required
                    id="login-input-email"
                  />

                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" /> Senha de Segurança
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0715] border border-amber-900/30 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                    id="login-input-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white text-sm font-medium rounded-lg font-display flex items-center justify-center gap-2 transition-all hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-submit-login"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Entrar na Nzila Digital <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}


          </motion.div>
        </div>

      </div>
    </div>
  );
}
