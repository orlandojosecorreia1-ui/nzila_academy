'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, MessageSquare, Trash2, Pin, AlertTriangle, Users, Heart } from 'lucide-react';

export default function AdminCommunity() {
  const { posts, deletePost, likePost } = useApp();

  const handleModerateDelete = (postId: string) => {
    if (confirm('Deseja realmente remover esta publicação do feed da comunidade por violação de termos de conduta técnica?')) {
      deletePost(postId);
    }
  };

  const communityStats = [
    { title: 'Publicações Ativas', count: posts.length, detail: 'Volume atual do fórum' },
    { title: 'Acessos nas últimas 24h', count: 182, detail: 'Estudantes logados' },
    { title: 'Taxa de Spam Coibida', count: '0%', detail: 'Segurança de rede' }
  ];

  return (
    <div className="space-y-6 py-2">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-purple-950/20 pb-4">
        <div>
          <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" /> Moderação & Gestão da Comunidade
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Gestão de conduta de publicações, relatórios de atividades de networking e manutenção do feed privado.
          </p>
        </div>
      </div>

      {/* 2. Highlight Cards Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {communityStats.map(s => (
          <div key={s.title} className="glass-card p-4 rounded-xl border border-purple-500/12 flex flex-col justify-between space-y-2">
            <span className="text-[10px] text-gray-400 font-mono block uppercase">{s.title}</span>
            <span className="text-2xl font-bold font-mono text-white block">{s.count}</span>
            <span className="text-[10px] text-purple-400 font-mono block">{s.detail}</span>
          </div>
        ))}
      </div>

      {/* 3. Moderate Panel Loop */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-display font-medium text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" /> Modulação de Tópicos Atuais
        </h3>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {posts.map(post => (
              <motion.div
                key={post.id}
                layoutId={`mod-post-${post.id}`}
                className="glass-card p-4 rounded-xl border border-purple-500/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-[#0a0715]/40"
              >
                <div className="space-y-3 min-w-0 flex-grow">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-500/20 bg-purple-950/30 flex-shrink-0">
                      <img src={post.authorAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-white font-display leading-tight">{post.authorName}</span>
                      <span className="block text-[9px] text-purple-400 font-mono mt-0.5">{post.authorTitle}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-sans line-clamp-2 pr-4">{post.content}</p>

                  <div className="flex gap-2 text-[10px] font-mono text-gray-500">
                    <span>{post.likes} Curtidas</span>
                    <span>• {post.comments.length} Comentários</span>
                    <span>• ID: {post.id}</span>
                  </div>
                </div>

                {/* Moderate Toolings */}
                <div className="flex sm:flex-col gap-2 items-center sm:items-end flex-shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleModerateDelete(post.id)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded text-[10px] font-mono text-red-400 flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Deletar Post
                  </button>

                  <button
                    onClick={() => alert('Post fixado com sucesso de forma permanente para todos os alunos.')}
                    className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 rounded text-[10px] font-mono text-purple-400 flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5" /> Fixar Destaque
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
