/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { 
  Bike, Search, MessageSquare, Heart, User, PlusCircle, 
  Settings, LogOut, LogIn, Menu, X, ChevronRight,
  TrendingUp, MapPin, Calculator, Shield, Zap, Instagram, Facebook, Phone, MessageCircle,
  ShieldCheck
} from "lucide-react";
import { 
  db, auth, collection, onSnapshot, query, orderBy, 
  signInWithPopup, googleProvider, signOut, where, doc,
  handleFirestoreError, OperationType
} from "./lib/firebase";
import { Listing, ListingStatus, UserProfile } from "./types";
import { Marketplace } from "./pages/Marketplace";
import { ListingDetail } from "./pages/ListingDetail";
import { ChatPage } from "./pages/Chat";
import { Dashboard } from "./pages/Dashboard";
import { SellPage } from "./pages/SellPage";
import { AdminPortal } from "./pages/Admin";
import { AboutPage } from "./pages/About";
import { ContactPage } from "./pages/Contact";
import { FinancingPage } from "./pages/Financing";

// --- Layout Component ---
function Layout({ children, user, profile }: { children: React.ReactNode, user: any, profile: UserProfile | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isAdmin = user?.email === "edimar.varoni@gmail.com";

  const navLinks = [
    { name: "Catálogo", path: "/", icon: Bike },
    { name: "Financiamento", path: "/financiamento", icon: Calculator },
    ...(isAdmin ? [{ name: "Anunciar", path: "/vender", icon: PlusCircle }] : []),
    { name: "Sobre", path: "/sobre", icon: Shield },
    { name: "Contato", path: "/contato", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-400 selection:text-black font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-2xl border-b border-white/5 h-24 flex items-center">
        <div className="max-w-[1600px] w-full mx-auto px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center group-hover:rotate-[-10deg] transition-all duration-500 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
              <Bike className="text-black w-7 h-7" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
                VARONI<span className="text-yellow-400 ml-1">MOTOS</span>
              </h1>
              <p className="text-[7px] uppercase tracking-[0.6em] text-white/20 font-black mt-1">Authentic Machine Marketplace</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path}
                className={`relative px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${
                  location.pathname === link.path ? 'text-yellow-400' : 'text-white/30 hover:text-white'
                }`}
              >
                <span className="relative z-10">{link.name}</span>
                {location.pathname === link.path && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                  />
                )}
              </Link>
            ))}
            {isAdmin && (
              <Link 
                to="/admin"
                className={`relative px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${
                  location.pathname === "/admin" ? 'text-yellow-400' : 'text-white/30 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                  <span className="relative z-10">Admin Portal</span>
                </div>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-8">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/favoritos" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
                  <Heart className="w-5 h-5 text-white/30" />
                </Link>
                <Link to="/dashboard" className="flex items-center gap-4 p-1.5 pl-5 bg-white/5 rounded-2xl border border-white/5 hover:border-yellow-400/50 transition-all">
                  <div className="text-right hidden xl:block">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-400 leading-none mb-1">Commander</p>
                    <p className="text-xs font-black uppercase truncate max-w-[120px] italic">{user.displayName?.split(' ')[0] || "Pilot"}</p>
                  </div>
                  <img src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} className="w-9 h-9 rounded-xl border border-white/10" alt="" />
                </Link>
                <button onClick={handleLogout} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all cursor-pointer border border-white/5">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-yellow-400 text-black px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all shadow-[0_0_40px_rgba(250,204,21,0.15)] flex items-center gap-4 border-0 cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Join The Crew
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 min-h-screen">
        {children}
      </main>

      {/* Floating WhatsApp */}
      <div className="fixed bottom-8 right-8 z-[150] group">
        <div className="absolute bottom-full right-0 mb-4 space-y-3 opacity-0 translate-y-10 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
          <a 
            href="https://wa.me/5518997572769"
            target="_blank"
            className="flex items-center gap-4 bg-white text-black pl-6 pr-4 py-3 rounded-2xl border border-white/10 shadow-2xl hover:bg-yellow-400 transition-all no-underline shrink-0 whitespace-nowrap"
          >
            <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">Vendas 02</span>
            <div className="w-8 h-8 bg-[#25D366] rounded-xl flex items-center justify-center">
               <Phone className="w-4 h-4 text-white" />
            </div>
          </a>
          <a 
            href="https://wa.me/5518996770986"
            target="_blank"
            className="flex items-center gap-4 bg-white text-black pl-6 pr-4 py-3 rounded-2xl border border-white/10 shadow-2xl hover:bg-yellow-400 transition-all no-underline shrink-0 whitespace-nowrap"
          >
            <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">Vendas 01</span>
            <div className="w-8 h-8 bg-[#25D366] rounded-xl flex items-center justify-center">
               <Phone className="w-4 h-4 text-white" />
            </div>
          </a>
        </div>
        <button className="w-16 h-16 bg-[#25D366] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all border-0 cursor-pointer group-hover:rotate-12">
          <MessageCircle className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5 bg-black/60 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Bike className="text-black w-5 h-5" />
              </div>
              <h1 className="text-lg font-black tracking-tighter uppercase italic">
                Varoni<span className="text-yellow-400">Motos</span>
              </h1>
            </div>
            <p className="text-xs text-white/30 uppercase tracking-widest leading-loose font-medium">
              A maior plataforma exclusiva para entusiastas de duas rodas. Segurança, transparência e as melhores máquinas.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">Navegação</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">Catálogo</Link></li>
              <li><Link to="/financiamento" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">Financiamento</Link></li>
              {isAdmin && <li><Link to="/vender" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">Anunciar Moto</Link></li>}
              <li><Link to="/sobre" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">Sobre Nós</Link></li>
              <li><Link to="/contato" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">Contato</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">Suporte</h4>
            <ul className="space-y-4">
              <li><Link to="/ajuda" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">Central de Ajuda</Link></li>
              <li><Link to="/termos" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">Privacidade</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">Contato</h4>
            <ul className="space-y-4">
              <li>
                <a href="https://wa.me/5518996770986" target="_blank" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3 h-3 text-yellow-400" />
                  Vendas 01
                </a>
              </li>
              <li>
                <a href="https://wa.me/5518997572769" target="_blank" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3 h-3 text-yellow-400" />
                  Vendas 02
                </a>
              </li>
              <li className="text-[10px] text-white/20 uppercase tracking-widest pt-2">Av. das Rosas, 35 - Birigui, SP</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">Social</h4>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-yellow-400 transition-colors cursor-pointer group">
                <Instagram className="w-4 h-4 group-hover:text-black" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-yellow-400 transition-colors cursor-pointer group">
                <Facebook className="w-4 h-4 group-hover:text-black" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 text-center">
          <p className="text-[9px] uppercase font-black tracking-[0.8em] text-white/10">
            © 2026 Varoni Motos Marketplace <span className="mx-6">|</span> Liderança em Duas Rodas
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        // Fetch user profile from Firestore
        onSnapshot(doc(db, "users", u.uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${u.uid}`);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.05),transparent_70%)]" />
        <div className="flex flex-col items-center gap-10 relative">
          <div className="relative">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="w-32 h-32 border-[1px] border-yellow-400/20 border-t-yellow-400 rounded-full" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Bike className="w-10 h-10 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-4">
            <h2 className="title-massive text-5xl italic text-white leading-none">VARONI<br /><span className="text-yellow-400">MOTOS</span></h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout user={user} profile={profile}>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/chat" element={<ChatPage user={user} />} />
          <Route path="/chat/:chatId" element={<ChatPage user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/vender" element={<SellPage user={user} />} />
          <Route path="/admin" element={<AdminPortal user={user} profile={profile} />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/financiamento" element={<FinancingPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
