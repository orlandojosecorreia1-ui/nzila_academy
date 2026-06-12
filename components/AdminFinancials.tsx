'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion } from 'motion/react';
import { Landmark, DollarSign, Wallet, CreditCard, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function AdminFinancials() {
  const { transactions } = useApp();

  // Sum total transactions
  const totalAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Dynamic distribution simulation based on realistic parameters
  const distributions = [
    { method: 'Cartão de Crédito', pct: 65, count: 124, color: 'bg-amber-500', text: 'text-amber-400' },
    { method: 'Pix Bancário', pct: 28, count: 53, color: 'bg-cyan-500', text: 'text-cyan-400' },
    { method: 'Boleto Bancário', pct: 7, count: 14, color: 'bg-yellow-500', text: 'text-yellow-400' }
  ];

  return (
    <div className="space-y-6 py-2">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-amber-950/20 pb-4">
        <div>
          <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-400" /> Painel Geral Financeiro
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Revisão de faturamentos, métodos de liquidação de transação e estáticas em lote de vendas.
          </p>
        </div>
      </div>

      {/* 2. Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Faturamento */}
        <div className="glass-card p-5 rounded-xl border border-amber-500/15 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-400 font-mono block">FATURAMENTO EM LOTE (PROTÓTIPO)</span>
            <span className="text-2xl font-bold font-mono text-white">{totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} KZ</span>
            <span className="text-[10px] text-amber-400 font-mono block">Volume transicionado do sandbox</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Métodos preferidos */}
        <div className="glass-card p-5 rounded-xl border border-amber-500/15 flex items-center justify-between col-span-2 bg-[#100c25]/30">
          <div className="w-full space-y-3">
            <span className="text-[10px] text-amber-300 font-mono font-bold tracking-wider block">PREFERÊNCIA DE PAGAMENTOS (MÉDIAS DE MERCADO)</span>
            
            <div className="grid grid-cols-3 gap-4 text-xs">
              {distributions.map(d => (
                <div key={d.method} className="space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px] overflow-hidden text-ellipsis whitespace-nowrap">{d.method}</span>
                    <span className={`${d.text} font-bold`}>{d.pct}%</span>
                  </div>
                  <div className="w-full bg-amber-950/30 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Transaction Database Grid */}
      <div className="glass-card rounded-2xl overflow-hidden border border-amber-500/12">
        <div className="p-4 bg-amber-950/15 border-b border-amber-950/30">
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#C9A84C] uppercase">HISTÓRICO RECENTE DE TRANSAÇÕES</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 font-mono">
            <thead className="bg-[#0A0A0A] text-gray-400 text-[10px] font-bold border-b border-amber-950/30 uppercase">
              <tr>
                <th className="px-6 py-4">ID Transação</th>
                <th className="px-6 py-4">Estudante</th>
                <th className="px-6 py-4">Curso Matrícula</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4 text-right">Liquidação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/15">
              {transactions.map((t, i) => (
                <tr key={t.id} className="hover:bg-amber-950/5 transition-all">
                  <td className="px-6 py-4 font-bold text-gray-550 text-gray-400">#NZ-{t.id.substring(4, 9).toUpperCase()}</td>
                  <td className="px-6 py-4 text-white font-bold font-sans">{t.studentName}</td>
                  <td className="px-6 py-4 text-gray-400 text-[11px] max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{t.courseTitle}</td>
                  <td className="px-6 py-4 font-bold text-white">{t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} KZ</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" /> {t.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wide">
                      Aprovado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
