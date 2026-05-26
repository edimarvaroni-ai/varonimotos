import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, ChevronRight, Share2, Heart, 
  MessageCircle, MapPin, Calendar, TrendingUp, 
  Shield, Zap, ArrowRight, CheckCircle2, User, Phone,
  Calculator, Info, Maximize2
} from "lucide-react";
import { 
  db, doc, onSnapshot, auth, collection, addDoc, serverTimestamp, query, where, getDocs,
  updateDoc,
  handleFirestoreError, OperationType
} from "../lib/firebase";
import { Listing, UserProfile } from "../types";

export function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "listings", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = { ...docSnap.data(), id: docSnap.id } as Listing;
        setListing(data);
        setIsOwner(auth.currentUser?.uid === data.userId);
        
        // Fetch seller
        onSnapshot(doc(db, "users", data.userId), (userSnap) => {
          if (userSnap.exists()) {
            setSeller(userSnap.data() as UserProfile);
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${data.userId}`);
        });
      } else {
        navigate('/marketplace');
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `listings/${id}`);
      setLoading(false);
    });
  }, [id, navigate]);

  useEffect(() => {
    if (!listing?.images || listing.images.length <= 1) return;

    const timer = setTimeout(() => {
      setActiveImage((prev) => (prev + 1) % listing.images.length);
    }, 3000);

    return () => clearTimeout(timer);
  }, [activeImage, listing?.images]);

  const handleToggleSold = async () => {
    if (!listing) return;
    try {
      const newStatus = listing.status === "sold" ? "active" : "sold";
      await updateDoc(doc(db, "listings", listing.id), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `listings/${listing.id}`);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    if (confirm("Deseja realmente remover este anúncio permanentemente?")) {
      try {
        await updateDoc(doc(db, "listings", listing.id), { 
          status: "deleted",
          updatedAt: serverTimestamp()
        });
        navigate('/dashboard');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `listings/${listing.id}`);
      }
    }
  };

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

  const handleShare = async () => {
    if (!listing) return;
    const shareData = {
      title: `Confira esta ${listing.brand} ${listing.model} na Varoni Motos`,
      text: listing.description,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copiado para a área de transferência!");
      }
    } catch (err) {
      console.error("Error sharing", err);
    }
  };

  if (loading || !listing) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full"
          />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Sincronizando Máquina</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 bg-black">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-yellow-400/5 blur-[160px] rounded-full opacity-50" />
      </div>

      <div className="max-w-[1600px] mx-auto px-8 pt-12 relative z-10">
            {/* Back and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-4 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-[0.3em] cursor-pointer text-white no-outline shadow-2xl"
          >
            <ChevronLeft className="w-5 h-5 text-yellow-400" />
            Voltar ao Estoque
          </button>
          
          <div className="flex flex-wrap items-center gap-4">
            {isOwner && (
              <div className="flex items-center gap-2 pr-4 border-r border-white/5">
                <button 
                  onClick={handleToggleSold}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    listing.status === 'sold' 
                    ? 'bg-yellow-400 text-black shadow-[0_0_30px_rgba(250,204,21,0.2)]' 
                    : 'bg-white/5 text-white/50 border border-white/10 hover:border-yellow-400/50'
                  }`}
                >
                  {listing.status === 'sold' ? 'Vendido' : 'Marcar Vendido'}
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            )}
            <button 
              onClick={handleShare}
              className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:border-yellow-400/50 transition-all cursor-pointer text-white shadow-2xl"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:border-yellow-400/50 transition-all cursor-pointer text-white shadow-2xl"><Heart className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-20">
          {/* Left: Content */}
          <div className="xl:col-span-7 space-y-12">
            <div className="relative group cursor-pointer">
              <a 
                href={listing.images?.[activeImage]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-black border-4 border-white/5 rounded-[4rem] overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.8)] group-hover:border-yellow-400/20 transition-all duration-500"
              >
                <div className="absolute top-10 right-10 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-yellow-400">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                </div>
                
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  src={listing.images?.[activeImage] || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop"} 
                  className="w-full aspect-[16/10] object-cover"
                  alt=""
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </a>
              
              {/* Image Indicators */}
              <div className="absolute -bottom-6 left-12 right-12 z-20 flex gap-4 overflow-x-auto no-scrollbar py-4 px-2">
                {listing.images?.length > 0 && listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-40 aspect-[16/10] shrink-0 rounded-2xl overflow-hidden border-2 transition-all p-0 cursor-pointer shadow-2xl bg-white/5 ${
                      activeImage === idx ? 'border-yellow-400 scale-110' : 'border-white/10 opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img 
                      src={img} 
                      className="w-full h-full object-cover" 
                      alt="" 
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&auto=format&fit=crop";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-20 space-y-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                {[
                  { label: "Ano Fabricação", value: listing.year, icon: Calendar },
                  { label: "Kilometragem", value: `${listing.kilometers.toLocaleString()} KM`, icon: TrendingUp },
                  { label: "Categoria", value: listing.category, icon: Zap },
                  { label: "Condição", value: listing.condition, icon: Shield },
                ].map((item, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex items-center gap-3 text-white/20 uppercase font-black tracking-[0.2em] text-[10px]">
                      <item.icon className="w-4 h-4 text-yellow-400" />
                      {item.label}
                    </div>
                    <p className="text-3xl font-black italic tracking-tighter uppercase leading-none">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Description Section */}
              <div className="p-16 bg-white/[0.02] border border-white/5 rounded-[4rem] backdrop-blur-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-12 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-1 bg-yellow-400" />
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Machine Specification</h3>
                  </div>
                  <p className="text-xl text-white/60 leading-relaxed font-bold italic uppercase tracking-tight max-w-[90%]">
                    {listing.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Color Style</p>
                      <p className="text-xl font-black italic tracking-tighter uppercase">{listing.color}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Technical Data</p>
                      <p className="text-xl font-black italic tracking-tighter uppercase">{listing.specs || "Premium Configuration"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="xl:col-span-5 space-y-10">
            <div className="sticky top-32 space-y-10">
              <div className="p-16 bg-white/[0.03] border border-white/10 rounded-[4rem] backdrop-blur-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 right-0 w-full h-1 bg-yellow-400" />
                
                <div className="space-y-12">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-yellow-400 mb-6 flex items-center gap-4">
                      Authentic Machine
                      {listing.status === 'sold' && (
                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-sm text-[8px] tracking-[0.2em]">VENDIDO</span>
                      )}
                    </p>
                    <h2 className="title-massive text-7xl md:text-8xl leading-none italic mb-4">
                      {listing.brand}<br />
                      <span className="text-white/40">{listing.model}</span>
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Investimento Premium</p>
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-black italic text-yellow-400 tracking-tighter">R$</span>
                      <span className="text-9xl font-black italic tracking-tighter leading-none shadow-text">
                        {listing.price.toLocaleString('pt-BR').split(',')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 pt-10">
                    <a 
                      href="https://wa.me/5518996770986"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-24 bg-[#25D366] text-white rounded-3xl font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-6 hover:scale-[1.02] active:scale-[0.98] transition-all no-underline shadow-[0_20px_50px_rgba(37,211,102,0.2)]"
                    >
                      <MessageCircle className="w-8 h-8" />
                      CONSULTOR VENDAS 01
                    </a>
                    <a 
                      href="https://wa.me/5518997572769"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-24 bg-white text-black rounded-3xl font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-6 hover:bg-yellow-400 active:scale-[0.98] transition-all no-underline"
                    >
                      <MessageCircle className="w-8 h-8" />
                      CONSULTOR VENDAS 02
                    </a>
                  </div>

                  <div className="flex items-center gap-4 justify-center pt-8 opacity-40">
                    <Shield className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">PROCEDÊNCIA GARANTIDA VARONI</span>
                  </div>
                </div>
              </div>

              {/* Seller Reference */}
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img src={seller?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=seller"} className="w-20 h-20 rounded-[2rem] border-2 border-white/5" alt="" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full border border-white/10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Official Dealer</p>
                    <p className="text-2xl font-black italic tracking-tighter uppercase">{seller?.displayName || "Varoni Motos"}</p>
                    <div className="flex items-center gap-2 mt-2 text-white/50">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{listing.location.city}, {listing.location.state}</span>
                    </div>
                  </div>
                </div>
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all">
                  <ChevronRight className="w-7 h-7" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
