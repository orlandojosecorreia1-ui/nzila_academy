'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, MessageSquare, Trash2, Pin, Users, Star, StarOff, Send, Heart, MessageCircle, Plus } from 'lucide-react';

export default function AdminCommunity() {
  const { posts, deletePost, likePost, addComment, pinComment, addNewPost, students, toggleStudentNetworkingStatus, currentUser } = useApp();

  const [newPostContent, setNewPostContent] = useState('');
  const [postTags, setPostTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [newCommentInputs, setNewCommentInputs] = useState<Record<string, string>>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    addNewPost(newPostContent, postTags);
    setNewPostContent('');
    setPostTags([]);
  };

  const addTagToNewPost = () => {
    if (tagInput.trim() && !postTags.includes(tagInput.trim()) && postTags.length < 3) {
      setPostTags([...postTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTagFromNewPost = (tagToRemove: string) => {
    setPostTags(postTags.filter(t => t !== tagToRemove));
  };

  const handleModerateDelete = (postId: string) => {
    if (confirm('Deseja realmente remover esta publicação do feed da comunidade por violação de termos de conduta técnica?')) {
      deletePost(postId);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

  const handleAddComment = (postId: string) => {
    const text = newCommentInputs[postId];
    if (text && text.trim()) {
      addComment(postId, text.trim());
      setNewCommentInputs({ ...newCommentInputs, [postId]: '' });
      if (!expandedComments.includes(postId)) {
        setExpandedComments([...expandedComments, postId]);
      }
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
      <div className="space-y-4">
        <h3 className="text-sm font-display font-medium text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" /> Modulação de Tópicos Atuais
        </h3>

        {/* Create Post Textarea */}
        <form onSubmit={handleCreatePost} className="glass-card p-3 sm:p-4 rounded-xl border border-amber-500/10 space-y-3 sm:space-y-3.5 bg-[#0e0a1a]/40">
          <div className="flex gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 border border-amber-500/20 bg-amber-950/20">
              <img 
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'} 
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Fazer uma postagem administrativa..."
                className="w-full bg-black/20 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 min-h-[70px] sm:min-h-[90px] resize-none"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pt-1 sm:pt-2 text-xs font-mono">
            <div className="flex flex-wrap gap-1 items-center">
              {postTags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-300 text-[10px]">
                  #{tag}
                  <button type="button" onClick={() => removeTagFromNewPost(tag)} className="hover:text-red-400 font-bold ml-1">×</button>
                </span>
              ))}
              {postTags.length < 3 && (
                <div className="flex items-center bg-black/20 border border-amber-900/20 rounded px-1.5 py-0.5">
                  <span className="text-gray-500 mr-1">#</span>
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagToNewPost(); } }}
                    placeholder="Add tag"
                    className="bg-transparent border-none outline-none text-[10px] text-amber-300 w-16"
                  />
                  <button type="button" onClick={addTagToNewPost} className="text-amber-400 hover:text-amber-300 ml-1">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="self-end sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium font-mono flex items-center gap-1.5 hover:cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Publicar Oficialmente
            </button>
          </div>
        </form>

        {posts.length === 0 ? (
          <div className="p-6 text-center glass-card rounded-xl border border-amber-500/5">
            <MessageSquare className="w-6 h-6 text-amber-500/50 mx-auto mb-2" />
            <span className="block font-mono text-xs text-gray-500">Nenhuma publicação no fórum ainda.</span>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  layoutId={`post-box-${post.id}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card p-3.5 sm:p-5 rounded-xl border relative transition-all bg-[#0e0a1a]/30 ${post.isPinned ? 'border-amber-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)] bg-gradient-to-l from-amber-950/5 to-transparent' : 'border-amber-500/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-amber-950/30 flex-shrink-0 bg-amber-950/10">
                        <img 
                          src={post.authorAvatar} 
                          alt={post.authorName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-white font-display truncate">
                          {post.authorName}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-gray-500 font-mono mt-0.5 truncate">{post.authorTitle} • {post.createdAt}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleModerateDelete(post.id)}
                      className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded text-[10px] font-mono text-red-400 flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                      title="Deletar publicação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-2 sm:pt-3 py-2 whitespace-pre-line selection:bg-amber-900/30">
                    {post.content}
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1 sm:pt-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[9px] sm:text-[10px] font-mono bg-amber-950/20 border border-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded text-amber-400 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 text-[10px] sm:text-xs text-gray-400 font-mono pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-amber-950/20">
                    <button 
                      onClick={() => likePost(post.id)}
                      className={`flex items-center gap-1 sm:gap-1.5 hover:text-amber-400 transition-colors hover:cursor-pointer ${post.likedByCurrentUser ? 'text-amber-400 font-semibold' : ''}`}
                    >
                      <Heart className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${post.likedByCurrentUser ? 'fill-amber-400' : ''}`} /> 
                      <span>{post.likes} Curtidas</span>
                    </button>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1 sm:gap-1.5 hover:text-gray-200 transition-colors hover:cursor-pointer"
                    >
                      <MessageCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> 
                      <span>{post.comments.length} Comentários</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedComments.includes(post.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 sm:pt-4 space-y-3">
                          {post.comments.length > 0 && (
                            <div className="space-y-2 sm:space-y-2.5 max-h-60 overflow-y-auto pr-1">
                              {[...post.comments].sort((a: any, b: any) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(c => (
                                <div key={c.id} className={`text-xs p-2 sm:p-2.5 rounded border space-y-1 ${c.isPinned ? 'bg-amber-950/20 border-amber-500/30' : 'bg-[#0d0a1b]/80 border-amber-950/10'}`}>
                                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono">
                                    <div className="flex items-center gap-1">
                                      {c.isPinned && <Pin className="w-2.5 h-2.5 text-amber-400" />}
                                      <span className="text-amber-300 font-medium truncate">{c.authorName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => pinComment(post.id, c.id)}
                                        className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-500/20 transition-all cursor-pointer"
                                      >
                                        <Pin className="w-2.5 h-2.5" /> {c.isPinned ? 'Desafixar' : 'Afixar'}
                                      </button>
                                      <span className="text-gray-500 flex-shrink-0 ml-1">{c.createdAt}</span>
                                    </div>
                                  </div>
                                  <p className="text-gray-400 leading-normal text-[11px] sm:text-xs">{c.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newCommentInputs[post.id] || ''}
                              onChange={(e) => setNewCommentInputs({ ...newCommentInputs, [post.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                              placeholder="Adicionar um comentário oficial..."
                              className="flex-grow bg-black/30 border border-amber-900/30 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center justify-center hover:cursor-pointer transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
