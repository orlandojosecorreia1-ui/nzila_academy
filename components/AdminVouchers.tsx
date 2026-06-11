'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Plus, Trash2, Search, X, CheckCircle, Clock, ShieldAlert, FileOutput, Copy, CopyCheck } from 'lucide-react';

export default function AdminVouchers() {
  const { accessCodes, generateBatchCodes, deleteCode, courses } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [targetCourse, setTargetCourse] = useState(courses[0]?.id || 'course-1');
  const [ticketCount, setTicketCount] = useState(5);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketCount < 1 || ticketCount > 50) return;
    
    generateBatchCodes(targetCourse, ticketCount);
    setIsGenerateOpen(false);
    setTicketCount(5);
  };

  const handleDeleteCode = (code: string) => {
    if (confirm(`Tem certeza de que deseja revogar o código ${code} do banco de dados?`)) {
      deleteCode(code);
    }
  };

  // Filter access codes based on search term
  const filteredCodes = accessCodes.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.resgatadoPor && c.resgatadoPor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 py-2 relative">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-purple-950/20 pb-4">
        <div>
          <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-400" /> Códigos de Acesso & Vouchers
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Geração segura criptográfica off-line de tokens, resgastes por alunos e auditoria de ingressos.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código ou utilizador..."
              className="pl-8 pr-3 py-1.5 w-44 sm:w-64 bg-black/35 border border-purple-900/20 text-xs text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <button 
            onClick={() => setIsGenerateOpen(true)}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 hover:cursor-pointer transition-colors"
            id="vouchers-btn-generate-batch"
          >
            <Plus className="w-3.5 h-3.5" /> Gerar Lote
          </button>
        </div>
      </div>

      {/* 2. List in High-Contrast Table Grid */}
      <div className="glass-card rounded-2xl overflow-hidden border border-purple-500/12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 font-mono">
            <thead className="bg-purple-950/15 text-purple-400 uppercase tracking-widest text-[10px] font-bold border-b border-purple-950/30">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Código Token</th>
                <th className="px-6 py-4">Curso Vinculado</th>
                <th className="px-6 py-4">Resgatado Por</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/20">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-mono text-[11px]">
                    Nenhum código de acesso localizado no repositório.
                  </td>
                </tr>
              ) : (
                filteredCodes.map(c => (
                  <tr key={c.code} className="hover:bg-purple-950/5 transition-colors">
                    <td className="px-6 py-4">
                      {c.status === 'disponivel' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Disponível
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-500/10 border border-gray-500/15 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Ativado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-white tracking-wider text-sm">{c.code}</td>
                    <td className="px-6 py-4 max-w-sm overflow-hidden text-ellipsis whitespace-nowrap text-gray-400">{c.courseTitle}</td>
                    <td className="px-6 py-4">
                      {c.status === 'resgatado' ? (
                        <div className="space-y-0.5">
                          <span className="block text-gray-300 font-bold font-sans">{c.resgatadoPor}</span>
                          <span className="block text-[9px] text-gray-500">Em: {c.resgatadoEm}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600 font-medium">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopyCode(c.code)}
                          className={`p-2 rounded-lg border transition-all hover:cursor-pointer ${
                            copiedCode === c.code
                              ? 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30'
                              : 'text-gray-400 hover:text-cyan-400 bg-purple-950/20 hover:bg-cyan-500/10 border-purple-500/10 hover:border-cyan-500/20'
                          }`}
                          title="Copiar código"
                        >
                          {copiedCode === c.code ? <CopyCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCode(c.code)}
                          className="p-2 text-gray-500 hover:text-red-400 bg-purple-950/20 hover:bg-purple-500/10 rounded-lg border border-purple-500/10 hover:border-purple-500/20 transition-all hover:cursor-pointer"
                          title="Deletar código de voucher"
                          id={`vouchers-btn-delete-${c.code}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: GENERATE CRYPTON BATCH */}
      <AnimatePresence>
        {isGenerateOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card p-6 rounded-2xl relative border border-purple-500/20"
            >
              <button 
                onClick={() => setIsGenerateOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Ticket className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-base font-display font-medium text-white pt-0.5">Gerar Lote de Chaves Criptográficas</h3>
              </div>

              <form onSubmit={handleGenerateBatch} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Ementa de Alocação do Curso</label>
                  <select
                    value={targetCourse}
                    onChange={(e) => setTargetCourse(e.target.value)}
                    className="w-full bg-[#0a0715] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        [{c.category}] {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 block">Quantidade de Tokens (Lote Máx: 50)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Number(e.target.value))}
                    className="w-full bg-[#0a0715] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none"
                    required
                  />
                  <span className="block text-[10px] text-gray-500 mt-1">Os códigos serão expostos instantaneamente na tela de cadastro para facilitação de testes.</span>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all pt-1 hover:cursor-pointer"
                  id="vouchers-btn-submit-generate"
                >
                  <FileOutput className="w-4 h-4" /> Gerar Vouchers e Publicar Lote
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
