import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Listing, ListingStatus } from "../types";
import { ListingCard } from "../components/ListingCard";
import { Search, SlidersHorizontal, MapPin, Zap, ChevronRight, ArrowRight } from "lucide-react";
import { db, collection, onSnapshot, query, where, orderBy } from "../lib/firebase";

export function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");

  useEffect(() => {
    const q = query(
      collection(db, "listings"), 
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Listing[];
      setListings(data);
      setLoading(false);
    });
  }, []);

  const filtered = listings.filter(l => {
    const matchesSearch = (l.brand + " " + l.model).toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "Todas" || l.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Todas", "Street", "Naked", "Esportiva", "Custom", "Trail", "Adventure"];

  return (
    <div className="min-h-screen">
      {/* Hero Search */}
      <section className="relative py-40 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-yellow-400/5 blur-[160px] rounded-full translate-y-[-50%] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-10"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 backdrop-blur-xl">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">Varoni Motos Birigui</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white/40">Marketplace Premium</h2>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] yellow-glow">
              SUA PRÓXIMA<br />
              <span className="text-transparent stroke-text text-white/5">MÁQUINA ESTÁ</span><br />
              NA VARONI
            </h1>

            <div className="max-w-3xl mx-auto relative group">
              <div className="absolute inset-0 bg-yellow-400/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex items-center p-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] focus-within:border-yellow-400/50 transition-all">
                <div className="flex-1 flex items-center px-8">
                  <Search className="w-6 h-6 text-white/20 mr-4" />
                  <input 
                    type="text"
                    placeholder="Busque por marca, modelo ou cilindrada..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent p-6 text-xl font-bold italic uppercase tracking-tighter outline-none text-white placeholder:text-white/10"
                  />
                </div>
                <button className="bg-yellow-400 text-black px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white hover:text-black transition-all border-0 cursor-pointer">
                  Buscar
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="pb-40 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8">
          <div className="flex items-center gap-4 p-2 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-0 cursor-pointer whitespace-nowrap ${
                  category === cat ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
              <span className="text-yellow-400 mr-2">{filtered.length}</span>
              Resultados encontrados
            </p>
            <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest cursor-pointer">
              <SlidersHorizontal className="w-4 h-4 text-yellow-400" />
              Filtros
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-[500px] bg-white/2 rounded-[2rem] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout">
              {filtered.map(listing => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <ListingCard 
                    listing={listing} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-40 text-center space-y-8 bg-white/2 border border-dashed border-white/5 rounded-[3rem]">
            <Search className="w-20 h-20 text-white/5 mx-auto" />
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Nenhuma moto encontrada</h3>
              <p className="text-white/30 text-sm uppercase font-bold tracking-widest max-w-sm mx-auto leading-relaxed">
                Tente ajustar seus filtros ou buscar por termos mais genéricos. Novas máquinas entram todo dia!
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
