'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, MessageSquare, Trash2, Pin, Users, Heart, Star, StarOff, ExternalLink } from 'lucide-react';

export default function AdminCommunity() {
  const { posts, deletePost, likePost, students, toggleStudentNetworkingStatus } = useApp();

  const handleModerateDelete = (postId: string) => {
    if (confirm('Deseja realmente remover esta publicação do feed da comunidade por violação de termos de conduta técnica?')) {
      deletePost(postId);
    }
  };

  const highlightedStudents = students.filter(s => s.isHighlightedNetworking);

  const communityStats = [
    { title: 'Publicações Ativas', count: posts.length, detail: 'Volume atual do fórum' },
    { title: 'Alunos Cadastrados', count: students.length, detail: 'Total de estudantes' },
    { title: 'Destaques Networking', count: highlightedStudents.length, detail: 'Alunos em destaque' }
  ];

  return (
    <div className="space-y-6 py-2">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-amber-950/20 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-display font-medium text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" /> Moderação & Gestão da Comunidade
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Gestão de conduta de publicações, relatórios de atividades de networking e manutenção do feed privado.
          </p>
        </div>
      </div>

      {/* 2. Highlight Cards Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {communityStats.map(s => (
          <div key={s.title} className="glass-card p-3 sm:p-4 rounded-xl border border-amber-500/12 flex flex-col justify-between space-y-2">
            <span className="text-[10px] text-gray-400 font-mono block uppercase">{s.title}</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white block">{s.count}</span>
            <span className="text-[10px] text-amber-400 font-mono block">{s.detail}</span>
          </div>
        ))}
      </div>

      {/* 3. Gestão de Destaques de Networking */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-display font-medium text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" /> Gestão de Destaques de Networking
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Selecione quais alunos devem aparecer em destaque na barra lateral do Feed da Comunidade.
            </p>
          </div>
          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg self-start">
            {highlightedStudents.length} aluno(s) em destaque
          </span>
        </div>

        {students.length === 0 ? (
          <div className="p-6 text-center glass-card rounded-xl border border-amber-500/5">
            <Users className="w-6 h-6 text-amber-500/50 mx-auto mb-2" />
            <span className="block font-mono text-xs text-gray-500">Nenhum aluno cadastrado no sistema ainda.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {students.map(student => {
              const isHighlighted = student.isHighlightedNetworking;
              return (
                <div 
                  key={student.id} 
                  className={`glass-card p-3 sm:p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isHighlighted 
                      ? 'border-yellow-500/30 bg-yellow-950/10 shadow-[0_0_10px_rgba(234,179,8,0.05)]' 
                      : 'border-amber-500/10 bg-[#0a0715]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full overflow-hidden border flex-shrink-0 ${
                      isHighlighted ? 'border-yellow-500/40 ring-2 ring-yellow-500/20' : 'border-amber-500/20'
                    } bg-amber-950/30`}>
                      {student.isHighlightedNetworking && (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 to-purple-500/20 flex items-center justify-center text-white font-bold text-xs">
                          {student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {!student.isHighlightedNetworking && (
                        <div className="w-full h-full bg-amber-950/40 flex items-center justify-center text-gray-400 font-bold text-xs">
                          {student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-white font-display leading-tight truncate">{student.name}</span>
                      <span className="block text-[10px] text-gray-400 font-mono mt-0.5 truncate">{student.courseTitle}</span>
                      <span className="block text-[9px] text-gray-500 font-mono truncate">{student.whatsapp}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStudentNetworkingStatus(student.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
                      isHighlighted 
                        ? 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25' 
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    {isHighlighted ? (
                      <><StarOff className="w-3.5 h-3.5" /> Remover</>
                    ) : (
                      <><Star className="w-3.5 h-3.5" /> Destacar</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Moderate Panel Loop */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-display font-medium text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" /> Modulação de Tópicos Atuais
        </h3>

        {posts.length === 0 ? (
          <div className="p-6 text-center glass-card rounded-xl border border-amber-500/5">
            <MessageSquare className="w-6 h-6 text-amber-500/50 mx-auto mb-2" />
            <span className="block font-mono text-xs text-gray-500">Nenhuma publicação no fórum ainda.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {posts.map(post => (
                <motion.div
                  key={post.id}
                  layoutId={`mod-post-${post.id}`}
                  className="glass-card p-3 sm:p-4 rounded-xl border border-amber-500/10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 bg-[#0a0715]/40"
                >
                  <div className="space-y-2 sm:space-y-3 min-w-0 flex-grow">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-500/20 bg-amber-950/30 flex-shrink-0">
                        <img src={post.authorAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold text-white font-display leading-tight truncate">{post.authorName}</span>
                        <span className="block text-[9px] text-amber-400 font-mono mt-0.5">{post.authorTitle}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed font-sans line-clamp-2 pr-0 sm:pr-4">{post.content}</p>

                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-gray-500">
                      <span>{post.likes} Curtidas</span>
                      <span>• {post.comments.length} Comentários</span>
                      <span className="hidden sm:inline">• ID: {post.id}</span>
                    </div>
                  </div>

                  {/* Moderate Toolings */}
                  <div className="flex sm:flex-col gap-2 items-center sm:items-end flex-shrink-0">
                    <button
                      onClick={() => handleModerateDelete(post.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded text-[10px] font-mono text-red-400 flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Deletar
                    </button>

                    <button
                      onClick={() => alert('Post fixado com sucesso de forma permanente para todos os alunos.')}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded text-[10px] font-mono text-amber-400 flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                    >
                      <Pin className="w-3.5 h-3.5" /> Fixar
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
