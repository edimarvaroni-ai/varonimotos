import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Listing, ListingStatus } from "../types";
import { ListingCard } from "../components/ListingCard";
import { Search, SlidersHorizontal, MapPin, Zap, ChevronRight, ArrowRight } from "lucide-react";
import { db, collection, onSnapshot, query, where, orderBy, handleFirestoreError, OperationType } from "../lib/firebase";

export function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [brand, setBrand] = useState("Todas");

  useEffect(() => {
    // Listen to Catalog for suggestions
    const qCatalog = query(collection(db, "catalog"), orderBy("model", "asc"));
    const unsubCatalog = onSnapshot(qCatalog, (snap) => {
      setCatalogItems(snap.docs.map(d => d.data()));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "catalog");
    });

    const q = query(
      collection(db, "listings"), 
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );
    
    const unsubListings = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Listing[];
      setListings(data);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "listings");
      setLoading(false);
    });

    return () => {
      unsubCatalog();
      unsubListings();
    };
  }, []);

  const filtered = listings.filter(l => {
    const matchesSearch = (l.brand + " " + l.model).toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "Todas" || l.category === category;
    const matchesBrand = brand === "Todas" || l.brand.toLowerCase() === brand.toLowerCase();
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const categories = ["Todas", "Street", "Naked", "Esportiva", "Custom", "Trail", "Adventure"];
  const brands = ["Todas", "Honda", "Yamaha", "BMW", "Kawasaki", "Ducati", "Triumph", "Harley-Davidson", "Suzuki"];

  return (
    <div className="min-h-screen">
      {/* Hero Search */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 px-8 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.1),transparent_70%)] pointer-events-none" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-yellow-400/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/5 blur-[120px] rounded-full" />
        
        <div className="max-w-[1400px] mx-auto relative z-10 w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-4 px-8 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/50">OFFICIAL DEALER | BIRIGUI, SP</span>
              </motion.div>
            </div>
            
            <div className="relative inline-block">
              <h1 className="title-massive text-[12vw] md:text-[10vw] leading-none text-white italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] uppercase">
                MÁQUINA DE <span className="text-yellow-400">VENDAS</span>
              </h1>
            </div>

            <div className="max-w-4xl mx-auto pt-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-yellow-400/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex flex-col md:flex-row items-center p-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] focus-within:border-yellow-400 transition-all duration-500">
                  <div className="flex-1 flex items-center px-8 w-full">
                    <Search className="w-8 h-8 text-white/20 mr-6" />
                    <input 
                      type="text"
                      placeholder="Busque sua próxima conquista..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent py-8 text-2xl font-black italic uppercase tracking-tighter outline-none text-white placeholder:text-white/5"
                    />
                  </div>
                  <button className="w-full md:w-auto bg-yellow-400 text-black px-16 py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-6 hover:bg-white hover:scale-105 transition-all active:scale-95 border-0 cursor-pointer shadow-2xl shadow-yellow-400/20">
                    Encontrar Moto
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mr-2">Exemplos:</span>
                {(catalogItems.length > 0 ? catalogItems.slice(0, 5) : [{model: "CB 500F"}, {model: "R1250 GS"}, {model: "MT-07"}, {model: "Ninja 400"}]).map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => setSearch(item.model)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    {item.model}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-10 mt-12 opacity-30">
                {["Honda", "Yamaha", "BMW", "Kawasaki", "Ducati", "Triumph"].map((b) => (
                  <button 
                    key={b} 
                    onClick={() => {
                      setBrand(b);
                      const element = document.getElementById('inventory');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-black uppercase tracking-[0.8em] hover:text-yellow-400 hover:opacity-100 transition-all bg-transparent border-0 cursor-pointer p-0"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="bg-yellow-400 py-6 overflow-hidden border-y border-black whitespace-nowrap">
        <div className="flex animate-marquee">
          {Array(10).fill("").map((_, i) => (
            <div key={i} className="flex items-center gap-10 mx-10">
              <span className="text-black text-2xl font-black italic uppercase tracking-tighter">OFFICIAL DEALER BIRIGUI, SP</span>
              <div className="w-4 h-4 bg-black rounded-full" />
              <span className="text-black text-2xl font-black italic uppercase tracking-tighter">ESTOQUE ATUALIZADO DIARIAMENTE</span>
              <div className="w-4 h-4 bg-black rounded-full" />
              <span className="text-black text-2xl font-black italic uppercase tracking-tighter">MELHOR AVALIAÇÃO DO BRASIL</span>
              <div className="w-4 h-4 bg-black rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Grid */}
      <section id="inventory" className="pb-40 px-8 max-w-[1600px] mx-auto">
        <div className="space-y-8 mb-24">
          {/* Category Filter */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 bg-white/[0.02] p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl">
            <div className="flex items-center gap-2 p-1.5 bg-black rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border-0 cursor-pointer whitespace-nowrap ${
                    category === cat ? 'bg-yellow-400 text-black shadow-[0_0_30px_rgba(250,204,21,0.2)]' : 'text-white/20 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-10">
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 leading-none mb-1">Stock Availability</p>
                <p className="text-xl font-black italic tracking-tighter uppercase leading-none">
                  <span className="text-yellow-400">{filtered.length}</span> Machines Found
                </p>
              </div>
              <button className="flex items-center gap-4 px-10 py-5 bg-white text-black rounded-2xl hover:bg-yellow-400 transition-all text-[10px] font-black uppercase tracking-[0.4em] cursor-pointer shadow-2xl">
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Filters
              </button>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="flex flex-wrap items-center gap-3 p-6 bg-white/[0.01] rounded-[2rem] border border-white/5">
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border cursor-pointer ${
                  brand === b 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                }`}
              >
                {b}
              </button>
            ))}
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
