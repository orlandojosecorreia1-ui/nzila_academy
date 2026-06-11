'use client';

import React, { useState } from 'react';
import { useApp, Post } from '@/lib/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Pin, Send, Plus, Filter, AlertCircle, Share2, Award, ExternalLink, X, Landmark } from 'lucide-react';

export default function StudentFeed() {
  const { posts, currentUser, addNewPost, likePost, addComment, deletePost } = useApp();
  
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Tudo');
  const [postTags, setPostTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Custom states for interactive quick networking profile modals
  const [selectedProfile, setSelectedProfile] = useState<{ name: string; title: string; avatar: string; wa: string } | null>(null);

  // Comments toggler maps
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [tempCommentText, setTempCommentText] = useState<Record<string, string>>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    
    // Default fallback tag if none added by user
    const finalTags = postTags.length > 0 ? postTags : ['Fórum'];
    addNewPost(newPostContent, finalTags);
    
    setNewPostContent('');
    setPostTags([]);
    setTagInput('');
  };

  const addTagToNewPost = () => {
    if (tagInput.trim() && !postTags.includes(tagInput.trim())) {
      setPostTags([...postTags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const removeTagFromNewPost = (tagToRemove: string) => {
    setPostTags(postTags.filter(t => t !== tagToRemove));
  };

  const handlePostComment = (postId: string) => {
    const text = tempCommentText[postId] || '';
    if (!text.trim()) return;
    
    addComment(postId, text);
    setTempCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const handleKeyPressComment = (e: React.KeyboardEvent, postId: string) => {
    if (e.key === 'Enter') {
      handlePostComment(postId);
    }
  };

  // Filter posts based on tab
  const filteredPosts = posts.filter(post => {
    if (selectedTag === 'Tudo') return true;
    return post.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());
  });

  const categories = ['Tudo', 'Computação Quântica', 'QCNN', 'Tensores', 'Dúvida', 'Networking', 'Alta Performance'];

  const handleQuickProfileView = (post: Post) => {
    // Standard mock whatsapp for networking
    setSelectedProfile({
      name: post.authorName,
      title: post.authorTitle,
      avatar: post.authorAvatar,
      wa: post.authorName === 'Alex Rivera' ? '+5511988887777' : '+14155550192'
    });
  };

  return (
    <div className="space-y-6 py-2 relative">
      
      {/* Dynamic Grid Header */}
      <div>
        <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" /> Feed da Comunidade Privada
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Espaço fechado de alta aplicabilidade e networking profissional para alunos e doutores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Create Post & List of Posts (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Create Post Textarea */}
          <form onSubmit={handleCreatePost} className="glass-card p-4 rounded-xl border border-purple-500/10 space-y-3.5 bg-[#0e0a1a]/40">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-purple-500/20 bg-purple-950/20">
                <img 
                  src={currentUser?.role === 'admin' 
                    ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                  } 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-grow">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Compartilhe uma dúvida técnica, código ou insight quântico..."
                  className="w-full bg-black/20 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/10 min-h-[90px] resize-none"
                  id="feed-input-content"
                />
              </div>
            </div>

            {/* Custom tagging workspace */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-mono">
              <div className="flex flex-wrap gap-1 items-center">
                {postTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-purple-300 text-[10px]">
                    #{tag}
                    <button type="button" onClick={() => removeTagFromNewPost(tag)} className="hover:text-red-400 font-bold ml-1">×</button>
                  </span>
                ))}
                
                {postTags.length < 3 && (
                  <div className="flex items-center bg-black/20 border border-purple-900/20 rounded px-1.5 py-0.5">
                    <span className="text-gray-500 mr-1">#</span>
                    <input 
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagToNewPost(); } }}
                      placeholder="Add tag"
                      className="bg-transparent border-none outline-none text-[10px] text-purple-300 w-16"
                    />
                    <button type="button" onClick={addTagToNewPost} className="text-purple-400 hover:text-purple-300 ml-1">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="self-end sm:self-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium font-mono flex items-center gap-1.5 hover:cursor-pointer transition-colors"
                id="feed-btn-publish"
              >
                <Send className="w-3.5 h-3.5" /> Publicar Feed
              </button>
            </div>
          </form>

          {/* Post categories filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            <div className="text-xs font-mono text-gray-400 flex items-center gap-1 flex-shrink-0 mr-1 bg-purple-950/10 p-1.5 rounded-md border border-purple-500/5">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedTag(cat)}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all hover:cursor-pointer flex-shrink-0 ${selectedTag === cat ? 'bg-purple-600 border-purple-400 text-white' : 'bg-[#0f0b20] border-purple-900/30 text-gray-400 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts list container */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredPosts.length === 0 ? (
                <div className="p-8 text-center glass-card rounded-xl border border-purple-500/5 space-y-2">
                  <AlertCircle className="w-8 h-8 text-purple-500/50 mx-auto" />
                  <span className="block font-mono text-xs text-gray-500">Nenhuma postagem encontrada nesta categoria.</span>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    layoutId={`post-box-${post.id}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`glass-card p-5 rounded-xl border relative transition-all bg-[#0e0a1a]/30 ${post.isPinned ? 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)] bg-gradient-to-l from-purple-950/5 to-transparent' : 'border-purple-500/10'}`}
                  >
                    {/* Pin Status */}
                    {post.isPinned && (
                      <div className="absolute top-4 right-4 text-[10px] font-mono text-purple-400 flex items-center gap-1 font-bold">
                        <Pin className="w-3.5 h-3.5 fill-purple-400/20" /> COMENTÁRIO FIXADO
                      </div>
                    )}

                    {/* Metadata heading */}
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => handleQuickProfileView(post)}
                        className="w-10 h-10 rounded-full overflow-hidden border border-purple-950/30 flex-shrink-0 bg-purple-950/10 cursor-pointer hover:border-purple-400 transition-all"
                      >
                        <img 
                          src={post.authorAvatar} 
                          alt={post.authorName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div>
                        {/* Author quick profile button trigger */}
                        <div 
                          onClick={() => handleQuickProfileView(post)}
                          className="text-sm font-medium text-white hover:text-purple-300 cursor-pointer transition-colors font-display"
                        >
                          {post.authorName}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{post.authorTitle} • {post.createdAt}</div>
                      </div>
                    </div>

                    {/* Deep technical Content */}
                    <div className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-3 py-2 whitespace-pre-line selection:bg-purple-900/30">
                      {post.content}
                    </div>

                    {/* Post Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono bg-purple-950/20 border border-purple-500/10 px-2 py-0.5 rounded text-purple-400 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Interaction toolbar */}
                    <div className="flex items-center gap-5 text-xs text-gray-400 font-mono pt-4 mt-4 border-t border-purple-950/20">
                      <button 
                        onClick={() => likePost(post.id)}
                        className={`flex items-center gap-1.5 hover:text-purple-400 transition-colors hover:cursor-pointer ${post.likedByCurrentUser ? 'text-purple-400 font-semibold' : ''}`}
                        id={`feed-btn-like-${post.id}`}
                      >
                        <Heart className={`w-4 h-4 ${post.likedByCurrentUser ? 'fill-purple-400 text-purple-400' : ''}`} />
                        <span>{post.likes} Curtidas</span>
                      </button>

                      <button 
                        onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors hover:cursor-pointer"
                        id={`feed-btn-comment-toggle-${post.id}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length} Comentários</span>
                      </button>

                      <button className="flex items-center gap-1.5 hover:text-gray-200 ml-auto transition-colors">
                        <Share2 className="w-3.5 h-3.5" /> Compartilhar
                      </button>
                    </div>

                    {/* Comments section expands */}
                    <AnimatePresence>
                      {activeCommentsPostId === post.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden bg-[#07050d] rounded-lg mt-3.5 border border-purple-950/35 p-3.5 space-y-3"
                        >
                          {/* List existing comments */}
                          {post.comments.length > 0 && (
                            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                              {post.comments.map(c => (
                                <div key={c.id} className="text-xs p-2.5 rounded bg-[#0d0a1b]/80 border border-purple-950/10 space-y-1">
                                  <div className="flex justify-between items-center text-[10px] font-mono">
                                    <span className="text-purple-300 font-medium">{c.authorName}</span>
                                    <span className="text-gray-500">{c.createdAt}</span>
                                  </div>
                                  <p className="text-gray-400 leading-normal">{c.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Write comments input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={tempCommentText[post.id] || ''}
                              onChange={(e) => setTempCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => handleKeyPressComment(e, post.id)}
                              placeholder="Adicione um comentário técnico..."
                              className="bg-black/40 border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/10 flex-grow"
                              id={`input-post-comment-${post.id}`}
                            />
                            <button
                              onClick={() => handlePostComment(post.id)}
                              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-medium hover:cursor-pointer transition-colors"
                              id={`btn-post-comment-submit-${post.id}`}
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Column: Networking Spotlight Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="glass-card p-4 rounded-xl border border-purple-500/10 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-[#a78bfa] uppercase">DESTAQUE NETWORKING</h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              Membros ativos dispostos a partilhar e apoiar em integrações de barramentos quânticos e clusters distribuídos.
            </p>

            <div className="divide-y divide-purple-950/20">
              {/* Profile Spot 1 */}
              <div className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500/10 bg-purple-950/20 flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" 
                      alt="Sarah" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-medium text-white line-clamp-1 font-display">Sarah Chen</span>
                    <span className="block text-[10px] text-purple-400 font-mono">Expert em Sharding & IA</span>
                  </div>
                </div>
                
                <a 
                  href="https://wa.me/14155550192" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-cyan-950/15 border border-cyan-800/30 rounded text-[10px] font-mono text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 flex-shrink-0"
                >
                  Conectar <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Profile Spot 2 */}
              <div className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500/10 bg-purple-950/20 flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" 
                      alt="Alex" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-medium text-white line-clamp-1 font-display">Alex Rivera</span>
                    <span className="block text-[10px] text-purple-400 font-mono">Pesquisador Qiskit Pro</span>
                  </div>
                </div>
                
                <a 
                  href="https://wa.me/5511988887777" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-cyan-950/15 border border-cyan-800/30 rounded text-[10px] font-mono text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 flex-shrink-0"
                >
                  Conectar <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Profile quick-networking Modal Backdrop */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-card p-6 rounded-2xl relative border border-purple-500/20 text-center"
            >
              <button 
                onClick={() => setSelectedProfile(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/40 mx-auto mt-2">
                <img 
                  src={selectedProfile.avatar} 
                  alt={selectedProfile.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="mt-4 space-y-1">
                <h4 className="text-lg font-bold font-display text-white">{selectedProfile.name}</h4>
                <p className="text-xs text-purple-300 font-mono">{selectedProfile.title}</p>
                <p className="text-xs text-gray-400 font-sans px-4 pt-1 leading-normal">
                  &ldquo;Sempre à disposição para desenhar topologias de rede, scripts automatizados e depurar códigos de baixo nível.&rdquo;
                </p>
              </div>

              <div className="mt-6 border-t border-purple-950/30 pt-4">
                <a 
                  href={`https://wa.me/${selectedProfile.wa.replace('+', '').replace(' ', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all hover:cursor-pointer shadow-lg shadow-emerald-950/40"
                  id="modal-btn-whatsapp"
                >
                  <MessageSquare className="w-4 h-4 fill-white text-white" />
                  Iniciar Chat Direito via WhatsApp
                </a>
                <p className="text-[10px] text-gray-500 mt-2 font-mono">Número: {selectedProfile.wa}</p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
