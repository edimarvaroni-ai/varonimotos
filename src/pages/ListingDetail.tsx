import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, ChevronRight, Share2, Heart, 
  MessageCircle, MapPin, Calendar, TrendingUp, 
  Shield, Zap, ArrowRight, CheckCircle2, User, Phone,
  Calculator, Info
} from "lucide-react";
import { db, doc, onSnapshot, auth, collection, addDoc, serverTimestamp, query, where, getDocs } from "../lib/firebase";
import { Listing, UserProfile } from "../types";

export function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "listings", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = { ...docSnap.data(), id: docSnap.id } as Listing;
        setListing(data);
        
        // Fetch seller
        onSnapshot(doc(db, "users", data.userId), (userSnap) => {
          if (userSnap.exists()) {
            setSeller(userSnap.data() as UserProfile);
          }
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleStartChat = async () => {
    if (!auth.currentUser) {
      alert("Faça login para conversar com o vendedor.");
      return;
    }
    if (!listing) return;

    // Check if chat already exists
    const q = query(
      collection(db, "chats"),
      where("listingId", "==", listing.id),
      where("participants", "array-contains", auth.currentUser.uid)
    );
    const snap = await getDocs(q);
    
    let chatId;
    if (snap.empty) {
      const newChat = await addDoc(collection(db, "chats"), {
        listingId: listing.id,
        participants: [auth.currentUser.uid, listing.userId],
        updatedAt: serverTimestamp(),
        lastMessage: ""
      });
      chatId = newChat.id;
    } else {
      chatId = snap.docs[0].id;
    }
    
    navigate(`/chat/${chatId}`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-t-2 border-yellow-400 rounded-full animate-spin" /></div>;
  if (!listing) return <div className="h-screen flex items-center justify-center text-white/50 uppercase font-black tracking-widest">Anúncio não encontrado</div>;

  return (
    <div className="min-h-screen pb-40">
      <div className="max-w-7xl mx-auto px-8 pt-12">
        {/* Back and Actions */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer border-0 text-white"
          >
            <ChevronLeft className="w-5 h-5 text-red-500" />
            Voltar
          </button>
          <div className="flex gap-4">
            <button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer border-0 text-white"><Share2 className="w-5 h-5" /></button>
            <button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer border-0 text-white"><Heart className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Images */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-8">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden relative group">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                src={listing.images[activeImage]} 
                className="w-full aspect-video object-cover"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-32 aspect-video shrink-0 rounded-2xl overflow-hidden border-2 transition-all p-0 cursor-pointer ${
                    activeImage === idx ? 'border-yellow-400 scale-105' : 'border-white/5 opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>

            {/* Description Card */}
            <div className="p-12 glass-card premium-border rounded-[3rem] space-y-10">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-yellow-400" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Sobre a Máquina</h3>
              </div>
              <p className="text-white/60 leading-relaxed font-medium text-lg uppercase tracking-wide">
                {listing.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Ano</p>
                  <p className="text-xl font-black italic tracking-tighter text-white">{listing.year}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Quilometragem</p>
                  <p className="text-xl font-black italic tracking-tighter text-white">{listing.kilometers.toLocaleString()} KM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Condição</p>
                  <p className="text-xl font-black italic tracking-tighter text-white uppercase">{listing.condition}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Estilo</p>
                  <p className="text-xl font-black italic tracking-tighter text-yellow-400 uppercase">{listing.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <div className="sticky top-32 space-y-8">
              {/* Main Info Card */}
              <div className="p-12 glass-card premium-border rounded-[3rem] relative overflow-hidden bg-black/40">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] rounded-full" />
                
                <div className="relative z-10 space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 bg-yellow-400 animate-pulse rounded-full" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{listing.brand}</p>
                    </div>
                    <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">{listing.model}</h2>
                    <p className="text-sm font-bold text-white/30 tracking-widest uppercase">{listing.specs}</p>
                  </div>

                  <div className="space-y-2 py-8 border-y border-white/5">
                    <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Preço Sugerido</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-xl font-black text-white/20 italic tracking-tighter leading-none">R$</span>
                       <span className="text-7xl font-black italic tracking-tighter text-white leading-none">
                         {listing.price.toLocaleString('pt-BR')}
                       </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <a 
                      href="https://wa.me/5518996770986"
                      target="_blank"
                      className="w-full bg-[#25D366] text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-[#25D366]/20 transition-all border-0 cursor-pointer no-underline"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Atendimento Vendas 01
                    </a>
                    <a 
                      href="https://wa.me/5518997572769"
                      target="_blank"
                      className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-yellow-400 transition-all shadow-4xl shadow-white/5 border-0 cursor-pointer no-underline"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Atendimento Vendas 02
                    </a>
                  </div>
                </div>
              </div>

              {/* Seller Card */}
              <div className="p-8 glass-card border border-white/5 rounded-[2.5rem] bg-white/2 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img 
                      src={seller?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=seller"} 
                      className="w-16 h-16 rounded-2xl border-2 border-white/10"
                      alt=""
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#25D366] rounded-full border-4 border-[#0A0A0A] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Anunciado por</p>
                    <p className="text-lg font-black uppercase tracking-tighter italic text-white">{seller?.displayName || "Vendedor Varoni"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-yellow-400" />
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{listing.location.city}, {listing.location.state}</p>
                    </div>
                  </div>
                </div>
                <Link to="/perfil" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </Link>
              </div>

              {/* Financing Preview Card */}
              <div className="p-10 bg-yellow-400 rounded-[2.5rem] relative overflow-hidden group cursor-pointer" onClick={() => navigate('/')}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 flex justify-between items-center text-black">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Calculator className="w-5 h-5" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 leading-none">Financiamento</p>
                    </div>
                    <h4 className="text-3xl font-black uppercase italic tracking-tighter">48x R$ 1.890</h4>
                    <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Simule com sua entrada preferencial</p>
                  </div>
                  <ChevronRight className="w-8 h-8 opacity-50 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
