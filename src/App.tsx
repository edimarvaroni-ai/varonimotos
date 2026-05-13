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
  TrendingUp, MapPin, Calculator, Shield, Zap, Instagram, Facebook, Phone, MessageCircle
} from "lucide-react";
import { 
  db, auth, collection, onSnapshot, query, orderBy, 
  signInWithPopup, googleProvider, signOut, where, doc 
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

  const navLinks = [
    { name: "Catálogo", path: "/", icon: Bike },
    { name: "Financiamento", path: "/financiamento", icon: Calculator },
    { name: "Vender", path: "/vender", icon: PlusCircle },
    { name: "Sobre", path: "/sobre", icon: Shield },
    { name: "Contato", path: "/contato", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-400 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center group-hover:rotate-[-5deg] transition-transform">
              <Bike className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">
                Varoni<span className="text-yellow-400">Motos</span>
              </h1>
              <p className="text-[8px] uppercase tracking-[0.4em] text-white/30 font-bold leading-none">Marketplace Premium</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  location.pathname === link.path ? 'text-yellow-400' : 'text-white/40 hover:text-white'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/favoritos" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors relative">
                  <Heart className="w-5 h-5 text-white/40" />
                </Link>
                <Link to="/dashboard" className="flex items-center gap-3 p-1 pl-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Minha Conta</p>
                    <p className="text-xs font-bold uppercase truncate max-w-[100px]">{user.displayName || "Usuário"}</p>
                  </div>
                  <img src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} className="w-8 h-8 rounded-xl border border-white/10" alt="" />
                </Link>
                {profile?.role === "admin" && (
                  <Link to="/admin" className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors">
                    <Settings className="w-5 h-5 text-yellow-400 hover:text-white" />
                  </Link>
                )}
                <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-yellow-400/20 hover:text-yellow-400 transition-colors cursor-pointer border-0">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-400 hover:text-black transition-all shadow-xl shadow-white/5 flex items-center gap-3 border-0 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Acessar Marketplace
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
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
              <li><Link to="/vender" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">Anunciar Moto</Link></li>
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
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-t-2 border-yellow-400 rounded-full animate-spin" />
          <h2 className="text-[10px] font-black bg-white/5 px-6 py-2 rounded-full uppercase tracking-[0.5em] text-yellow-400">Varoni Motos</h2>
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
