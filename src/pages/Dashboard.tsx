import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Settings, Package, Heart, 
  TrendingUp, ArrowRight, Trash2, Edit3, 
  MapPin, Shield, Zap, Info, Bike, ChevronRight
} from "lucide-react";
import { 
  db, auth, collection, onSnapshot, query, where, doc, deleteDoc, updateDoc,
  handleFirestoreError, OperationType
} from "../lib/firebase";
import { Listing, ListingStatus } from "../types";

export function Dashboard({ user }: { user: any }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ads" | "favs">("ads");

  useEffect(() => {
    if (!user) return;

    // Load user's listings
    const qAds = query(
      collection(db, "listings"),
      where("userId", "==", user.uid),
      where("status", "in", ["active", "sold"])
    );

    const unsubAds = onSnapshot(qAds, (snap) => {
      setListings(snap.docs.map(d => ({ ...d.data(), id: d.id } as Listing)));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "listings");
    });

    setLoading(false);
    return () => {
      unsubAds();
    };
  }, [user]);

  const deleteListing = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este anúncio?")) {
      await updateDoc(doc(db, "listings", id), { status: "deleted" });
    }
  };

  const markAsSold = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "sold" ? "active" : "sold";
    await updateDoc(doc(db, "listings", id), { status: newStatus });
  };

  if (!user) return <div className="h-screen flex items-center justify-center p-8 text-white/20 uppercase font-black tracking-widest">Acesso Negado</div>;

  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Profile Card */}
        <section className="p-12 glass-card premium-border rounded-[3.5rem] relative overflow-hidden bg-black/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[160px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-10">
              <div className="relative">
                <img 
                  src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
                  className="w-32 h-32 rounded-[2.5rem] border-2 border-yellow-400"
                  alt=""
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center border-4 border-[#0A0A0A]">
                  <Settings className="w-5 h-5 text-black" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-yellow-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500 leading-none">Perfil Verificado</p>
                </div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter">{user.displayName}</h2>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-black italic tracking-tighter text-white">{listings.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Anúncios Ativos</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black italic tracking-tighter text-yellow-400">12k+</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Visualizações</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Selection */}
        <div className="flex gap-6 border-b border-white/5">
          <button 
            onClick={() => setActiveTab("ads")}
            className={`pb-6 px-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative border-0 bg-transparent cursor-pointer ${
              activeTab === 'ads' ? 'text-yellow-400' : 'text-white/20 hover:text-white/50'
            }`}
          >
            Meus Anúncios
            {activeTab === 'ads' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("favs")}
            className={`pb-6 px-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative border-0 bg-transparent cursor-pointer ${
              activeTab === 'favs' ? 'text-yellow-400' : 'text-white/20 hover:text-white/50'
            }`}
          >
            Favoritos
            {activeTab === 'favs' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-full" />}
          </button>
        </div>

        {/* Listings Content */}
        <div className="grid grid-cols-1 gap-8">
          {activeTab === "ads" ? (
            listings.length > 0 ? (
              listings.map(listing => (
                <div key={listing.id} className="p-8 glass-card border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-12 group hover:border-yellow-400/30 transition-all">
                  <div className="relative w-full md:w-64 h-40 rounded-3xl overflow-hidden shrink-0">
                    <img src={listing.images?.[0] || "https://images.unsplash.com/photo-1599819811279-d1921f3f7a6c?q=80&w=2070&auto=format&fit=crop"} className="w-full h-full object-cover" alt="" />
                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                      listing.status === 'sold' ? 'bg-yellow-400 text-black' : 'bg-black/80 text-white/70'
                    }`}>
                      {listing.status === 'sold' ? 'Vendido' : 'Ativo'}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{listing.brand}</p>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">{listing.model}</h3>
                    </div>
                    <div className="flex gap-8 items-center">
                      <div className="flex items-center gap-2 text-xs font-bold text-white/40 italic">
                        <TrendingUp className="w-4 h-4 text-yellow-400" />
                        R$ {listing.price.toLocaleString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-white/40 italic">
                        <MapPin className="w-4 h-4 text-yellow-400" />
                        {listing.location.city}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 shrink-0">
                    <button 
                      onClick={() => markAsSold(listing.id, listing.status)}
                      className="px-8 py-3 bg-yellow-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all border-0 cursor-pointer"
                    >
                      {listing.status === 'sold' ? 'Marcar como Ativo' : 'Marcar como Vendido'}
                    </button>
                    <Link to={`/listing/${listing.id}`} className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border-0 text-white cursor-pointer"><ChevronRight className="w-5 h-5" /></Link>
                    <button 
                      onClick={() => deleteListing(listing.id)}
                      className="w-12 h-12 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-xl flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all border-0 cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-40 text-center space-y-8 bg-white/2 border border-dashed border-white/5 rounded-[3.5rem] opacity-30">
                <Bike className="w-20 h-20 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Nenhum anúncio criado</p>
                <Link to="/vender" className="inline-block px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-yellow-400 transition-all">Começar a Vender</Link>
              </div>
            )
          ) : (
            <div className="py-40 text-center bg-white/2 border border-dashed border-white/5 rounded-[3.5rem] opacity-30">
              <Heart className="w-20 h-20 mx-auto mb-8" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Sua garagem de sonhos está vazia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
