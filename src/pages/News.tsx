import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { db, collection, query, orderBy, onSnapshot, handleFirestoreError, OperationType } from "../lib/firebase";
import { Post } from "../types";
import { Newspaper, ChevronRight, Calendar, ArrowRight } from "lucide-react";

export function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ ...d.data(), id: d.id } as Post)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "posts");
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full"
          />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Acelerando Conteúdo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-black">
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.08),transparent_70%)]" />
        <div className="max-w-[1600px] mx-auto px-8 relative">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center border border-yellow-400/20">
                <Newspaper className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">Inside Varoni</span>
            </div>
            <h2 className="title-massive text-[8vw] md:text-8xl leading-none italic mb-8">NOVIDADES<br /><span className="text-yellow-400 italic font-black">& RELATOS</span></h2>
            <p className="text-xl md:text-2xl text-white/40 uppercase tracking-widest font-black italic max-w-xl">
              Fique por dentro das últimas máquinas, expedições e eventos do ecossistema Varoni.
            </p>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-[1600px] mx-auto px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map((post, idx) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 relative premium-border">
                <img 
                  src={post.images[0]} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-yellow-400">
                  <Calendar className="w-3 h-3" />
                  <span>{post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "CARREGANDO"}</span>
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none group-hover:text-yellow-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed line-clamp-3 uppercase tracking-widest font-medium">
                  {post.content}
                </p>
                <div className="flex items-center gap-3 pt-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-10 group-hover:translate-x-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Ler Relato Completo</span>
                  <ArrowRight className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="py-40 text-center space-y-8">
            <Newspaper className="w-20 h-20 text-white/5 mx-auto" />
            <div className="space-y-4">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter opacity-20">Silêncio no Horizonte</h3>
              <p className="text-xs text-white/10 uppercase tracking-[0.4em] font-bold italic">Nenhum relato publicado no momento</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
