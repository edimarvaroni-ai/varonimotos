import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, Users, Package, AlertTriangle, 
  Trash2, CheckCircle2, TrendingUp, Search, 
  ChevronRight, ArrowRight, Zap, Newspaper, Plus, X, Image as ImageIcon,
  Loader2, Bike
} from "lucide-react";
import { 
  db, collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, where,
  auth, storage, ref, uploadBytesResumable, getDownloadURL, addDoc, serverTimestamp,
  handleFirestoreError, OperationType
} from "../lib/firebase";
import { Listing, UserProfile, ListingStatus, Post, CatalogItem } from "../types";

export function AdminPortal({ user, profile }: { user: any, profile: UserProfile | null }) {
  const [stats, setStats] = useState({ users: 0, listings: 0, pending: 0, revenue: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "posts" | "catalog">("inventory");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const isAdminUser = user?.email === "edimar.varoni@gmail.com" || profile?.role === "admin";

  // Post Form State
  const [postForm, setPostForm] = useState({ title: "", content: "", images: [] as string[] });
  
  // Catalog Form State
  const [catalogForm, setCatalogForm] = useState({ type: "", model: "", year: new Date().getFullYear(), description: "", images: [] as string[] });
  
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isAdminUser) return;

    // Listen to Listings
    const qListings = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const unsubListings = onSnapshot(qListings, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Listing));
      setListings(data);
      setStats(prev => ({
        ...prev,
        listings: data.length,
        pending: data.filter(l => l.status !== ListingStatus.ACTIVE && l.status !== ListingStatus.SOLD).length,
        revenue: data.reduce((acc, l) => acc + l.price, 0) * 0.02
      }));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "listings");
    });

    // Listen to Posts
    const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map(d => ({ ...d.data(), id: d.id } as Post)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "posts");
      setLoading(false);
    });

    // Listen to Catalog
    const qCatalog = query(collection(db, "catalog"), orderBy("createdAt", "desc"));
    const unsubCatalog = onSnapshot(qCatalog, (snap) => {
      setCatalog(snap.docs.map(d => ({ ...d.data(), id: d.id } as CatalogItem)));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "catalog");
    });

    return () => {
      unsubListings();
      unsubPosts();
      unsubCatalog();
    };
  }, [isAdminUser]);

  const deleteListing = async (id: string) => {
    if (confirm("EXCLUIR ANÚNCIO DEFINITIVAMENTE? Esta ação não pode ser desfeita.")) {
      await deleteDoc(doc(db, "listings", id));
    }
  };

  const promoteListing = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "listings", id), { isPremium: !current });
  };

  const handlePostUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "post" | "catalog" = "post") => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;

    setIsUploading(true);
    for (const f of files) {
      const file = f as File;
      const storageRef = ref(storage, `${type}s/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          if (type === "post") {
            setPostForm(prev => ({ ...prev, images: [...prev.images, url] }));
          } else {
            setCatalogForm(prev => ({ ...prev, images: [...prev.images, url] }));
          }
          resolve(true);
        });
      });
    }
    setIsUploading(false);
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminUser) return;

    try {
      await addDoc(collection(db, "posts"), {
        ...postForm,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsPostModalOpen(false);
      setPostForm({ title: "", content: "", images: [] });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "posts");
    }
  };

  const deletePost = async (id: string) => {
    if (confirm("Excluir esta postagem?")) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  const submitCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminUser) return;

    try {
      await addDoc(collection(db, "catalog"), {
        ...catalogForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsCatalogModalOpen(false);
      setCatalogForm({ type: "", model: "", year: new Date().getFullYear(), description: "", images: [] });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "catalog");
    }
  };

  const deleteCatalogItem = async (id: string) => {
    if (confirm("Excluir este item do catálogo?")) {
      await deleteDoc(doc(db, "catalog", id));
    }
  };

  if (!isAdminUser) {
    return (
      <div className="h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-8 glass-card border border-yellow-400/30 p-12 rounded-[3.5rem] bg-yellow-400/5">
          <AlertTriangle className="w-20 h-20 text-yellow-400 mx-auto" />
          <div className="space-y-4">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">ACESSO BLOQUEADO</h2>
            <p className="text-xs text-yellow-500/50 uppercase font-bold tracking-widest leading-relaxed">
              Tentativa de acesso não autorizado registrada. Área restrita a administradores do Grupo Varoni.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full"
          />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Carregando Governança</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Admin Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-black" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-1">Painel Governança</p>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">CENTRAL <span className="text-white/20">ADMIN</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="#/vender" 
              className="px-8 py-4 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white transition-all shadow-lg active:scale-95 no-underline"
            >
              < Zap className="w-4 h-4" />
              Criar Postagem / Anúncio
            </a>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <img src={user?.photoURL} className="w-10 h-10 rounded-xl" alt="" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Admin Logado</p>
                <p className="text-xs font-bold uppercase truncate max-w-[100px]">{user?.displayName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: "Usuários Ativos", val: stats.users, icon: Users, color: "text-white" },
            { label: "Total Anúncios", val: stats.listings, icon: Package, color: "text-white" },
            { label: "Aguardando", val: stats.pending, icon: AlertTriangle, color: "text-yellow-400" },
            { label: "Receita Est.", val: `R$ ${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-500" }
          ].map((s, i) => (
            <div key={i} className="p-10 glass-card premium-border rounded-[2.5rem] bg-black/40 space-y-6">
              <div className="flex items-center justify-between">
                <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{s.label}</p>
                  <p className={`text-4xl font-black italic tracking-tighter ${s.color}`}>{s.val}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-3xl border border-white/10 w-fit">
          <button 
            onClick={() => setActiveTab("inventory")}
            className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-0 ${
              activeTab === "inventory" ? 'bg-yellow-400 text-black shadow-xl' : 'text-white/20 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              Estoque
            </div>
          </button>
          <button 
            onClick={() => setActiveTab("posts")}
            className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-0 ${
              activeTab === "posts" ? 'bg-yellow-400 text-black shadow-xl' : 'text-white/20 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Newspaper className="w-4 h-4" />
              Postagens / Blog
            </div>
          </button>
          <button 
            onClick={() => setActiveTab("catalog")}
            className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-0 ${
              activeTab === "catalog" ? 'bg-yellow-400 text-black shadow-xl' : 'text-white/20 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bike className="w-4 h-4" />
              Catálogo de Motos
            </div>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "inventory" ? (
          <section className="space-y-10">
            {/* ... inventory content ... */}
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">CONTROLE DE ESTOQUE</h3>
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-3 border border-white/10">
                <Search className="w-4 h-4 text-white/30" />
                <input className="bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none placeholder:text-white/10" placeholder="Buscar Anúncio..." />
              </div>
            </div>

            <div className="glass-card premium-border rounded-[3rem] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/40">Máquina</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/40">Vendedor</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/40">Preço</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listings.map(l => (
                    <tr key={l.id} className="hover:bg-white/2 transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                          <img src={l.images[0]} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" />
                          <div>
                            <p className="text-xs font-black uppercase tracking-tighter text-white">{l.brand} {l.model}</p>
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{l.year} • {l.items?.filter(Boolean).length || 0} Itens</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/60">{l.userId.slice(0, 8)}...</p>
                      </td>
                      <td className="p-8">
                        <p className="text-sm font-black italic tracking-tighter text-yellow-400">R$ {l.price.toLocaleString('pt-BR')}</p>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${l.status === 'active' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{l.status}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex justify-end gap-3 px-4">
                          <button 
                            onClick={() => promoteListing(l.id, !!l.isPremium)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-0 cursor-pointer ${
                              l.isPremium ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteListing(l.id)}
                            className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all border-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : activeTab === "posts" ? (
          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">POSTAGENS DO SITE</h3>
              <button 
                onClick={() => setIsPostModalOpen(true)}
                className="px-8 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-yellow-400 transition-all cursor-pointer border-0 shadow-2xl"
              >
                <Plus className="w-4 h-4" />
                Nova Postagem
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map(post => (
                <div key={post.id} className="glass-card premium-border rounded-[2.5rem] bg-black/40 overflow-hidden group">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={post.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt="" />
                    <button 
                      onClick={() => deletePost(post.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/20 transition-all border-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-10 space-y-4">
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-yellow-400">
                      <span>{post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "Publicando..."}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span>{post.images.length} Fotos</span>
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">{post.title}</h4>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-3">{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">CATÁLOGO DE MÁQUINAS</h3>
              <button 
                onClick={() => setIsCatalogModalOpen(true)}
                className="px-8 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-yellow-400 transition-all cursor-pointer border-0 shadow-2xl"
              >
                <Plus className="w-4 h-4" />
                Novo Modelo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {catalog.map(item => (
                <div key={item.id} className="glass-card premium-border rounded-[2.5rem] bg-black/40 overflow-hidden group">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt="" />
                    <button 
                      onClick={() => deleteCatalogItem(item.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/20 transition-all border-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-yellow-400">
                      <span>{item.type}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span>{item.year}</span>
                    </div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter">{item.model}</h4>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#080808] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <div className="p-12 space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-1">Editor de Conteúdo</p>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">CRIAR POSTAGEM</h3>
                  </div>
                  <button 
                    onClick={() => setIsPostModalOpen(false)}
                    className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={submitPost} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Título da Postagem</label>
                    <input 
                      required
                      value={postForm.title}
                      onChange={e => setPostForm({...postForm, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic outline-none focus:border-yellow-400 transition-all"
                      placeholder="Ex: Novo Lote de BMW Chegando..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Conteúdo / Texto</label>
                    <textarea 
                      required
                      rows={5}
                      value={postForm.content}
                      onChange={e => setPostForm({...postForm, content: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-xs font-medium leading-relaxed outline-none focus:border-yellow-400 transition-all resize-none"
                      placeholder="Descreva as novidades..."
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Imagens da Postagem</label>
                    <div className="grid grid-cols-4 gap-4">
                      {postForm.images.map((url, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <button 
                            type="button"
                            onClick={() => setPostForm({...postForm, images: postForm.images.filter((_, idx) => idx !== i)})}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-all border-0 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-yellow-400 transition-all cursor-pointer group">
                        <input type="file" multiple className="hidden" onChange={(e) => handlePostUpload(e, "post")} disabled={isUploading} />
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5 text-white/20 group-hover:text-yellow-400" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Add</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-2xl shadow-yellow-400/20 active:scale-[0.98] border-0 cursor-pointer"
                  >
                    Publicar Agora
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {isCatalogModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCatalogModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#080808] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <div className="p-12 space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-1">Catálogo de Modelos</p>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">CRIAR CATALOGO</h3>
                  </div>
                  <button 
                    onClick={() => setIsCatalogModalOpen(false)}
                    className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={submitCatalog} className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Tipo / Categoria</label>
                      <input 
                        required
                        value={catalogForm.type}
                        onChange={e => setCatalogForm({...catalogForm, type: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-yellow-400 transition-all"
                        placeholder="Ex: Trail, Naked, Custom"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Ano</label>
                      <input 
                        required
                        type="number"
                        value={catalogForm.year}
                        onChange={e => setCatalogForm({...catalogForm, year: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-yellow-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Modelo da Máquina</label>
                    <input 
                      required
                      value={catalogForm.model}
                      onChange={e => setCatalogForm({...catalogForm, model: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic outline-none focus:border-yellow-400 transition-all"
                      placeholder="Ex: BMW R1250 GS"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Descrição Curta</label>
                    <textarea 
                      required
                      rows={3}
                      value={catalogForm.description}
                      onChange={e => setCatalogForm({...catalogForm, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-xs font-medium leading-relaxed outline-none focus:border-yellow-400 transition-all resize-none"
                      placeholder="Breve resumo sobre o modelo..."
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Imagens do Modelo</label>
                    <div className="grid grid-cols-4 gap-4">
                      {catalogForm.images.map((url, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <button 
                            type="button"
                            onClick={() => setCatalogForm({...catalogForm, images: catalogForm.images.filter((_, idx) => idx !== i)})}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-all border-0 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-yellow-400 transition-all cursor-pointer group">
                        <input type="file" multiple className="hidden" onChange={(e) => handlePostUpload(e, "catalog")} disabled={isUploading} />
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5 text-white/20 group-hover:text-yellow-400" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Add</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-2xl shadow-yellow-400/20 active:scale-[0.98] border-0 cursor-pointer"
                  >
                    Adicionar ao Catálogo
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
