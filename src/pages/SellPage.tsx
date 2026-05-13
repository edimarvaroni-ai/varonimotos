import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bike, Camera, MapPin, CheckCircle2, 
  ArrowRight, Shield, Zap, Info, Plus, 
  Trash2, Image as ImageIcon
} from "lucide-react";
import { db, auth, collection, addDoc, serverTimestamp } from "../lib/firebase";

export function SellPage({ user }: { user: any }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: 2024,
    price: "",
    condition: "Seminova",
    kilometers: "",
    description: "",
    category: "Street",
    specs: "Motor Potente • Econômica",
    images: ["https://images.unsplash.com/photo-1599819811279-d1921f3f7a6c?q=80&w=2070&auto=format&fit=crop"],
    location: {
      lat: -23.55052,
      lng: -46.633308,
      city: "São Paulo",
      state: "SP"
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, "listings"), {
        ...formData,
        userId: user.uid,
        price: Number(formData.price),
        kilometers: Number(formData.kilometers),
        status: "active",
        isPremium: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating listing", error);
      alert("Erro ao criar anúncio. Verifique se preencheu todos os campos obrigatórios.");
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-8 glass-card premium-border p-12 rounded-[3.5rem]">
          <div className="w-20 h-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center mx-auto border border-yellow-400/20">
            <Shield className="w-10 h-10 text-yellow-500" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Acesso Restrito</h2>
            <p className="text-xs text-white/30 uppercase font-bold tracking-widest leading-relaxed">
              Você precisa estar logado para anunciar sua moto no marketplace Varoni.
            </p>
          </div>
          <button onClick={() => navigate("/")} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border-0 cursor-pointer">Ir para Início</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-16">
          <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-400/30">
            <Camera className="w-8 h-8 text-black" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-1">Anunciar agora</p>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">Venda sua <span className="text-white/20">Máquina</span></h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Step 1: Basic Info */}
          <section className="glass-card premium-border p-12 rounded-[3rem] space-y-10">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Info Básica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Marca</label>
                <input 
                  required
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic optional:uppercase outline-none focus:border-yellow-400/50 transition-all placeholder:text-white/5"
                  placeholder="Ex: Honda"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Modelo</label>
                <input 
                  required
                  value={formData.model}
                  onChange={e => setFormData({...formData, model: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic placeholder:text-white/5 outline-none focus:border-yellow-400/50 transition-all"
                  placeholder="Ex: CB 500F"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Ano</label>
                <input 
                  required
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic outline-none focus:border-red-600/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Estilo</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic outline-none focus:border-yellow-400/50 transition-all appearance-none cursor-pointer"
                >
                  {["Street", "Naked", "Esportiva", "Custom", "Trail", "Adventure"].map(c => (
                    <option key={c} value={c} className="bg-neutral-900">{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Step 2: Specs and Price */}
          <section className="glass-card premium-border p-12 rounded-[3rem] space-y-10">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Detalhes e Preço</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Preço (R$)</label>
                <input 
                  required
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-2xl font-black italic outline-none focus:border-yellow-400/50 transition-all text-yellow-400"
                  placeholder="30000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">KM Rodados</label>
                <input 
                  required
                  type="number"
                  value={formData.kilometers}
                  onChange={e => setFormData({...formData, kilometers: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic outline-none focus:border-red-600/50 transition-all"
                  placeholder="5000"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Descrição Detalhada</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-sm font-medium outline-none focus:border-yellow-400/50 transition-all resize-none placeholder:text-white/5 leading-relaxed"
                  placeholder="Descreva o estado de conservação, manutenções e diferenciais..."
                />
              </div>
            </div>
          </section>

          {/* Submission */}
          <div className="flex items-center justify-between p-12 glass-card premium-border rounded-[3rem] bg-yellow-400/5">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">Pronto para anunciar?</p>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Sua moto será listada imediatamente após a confirmação.</p>
            </div>
            <button 
              type="submit"
              className="px-12 py-6 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-white transition-all shadow-4xl shadow-yellow-400/40 border-0 cursor-pointer"
            >
              Publicar Máquina
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
