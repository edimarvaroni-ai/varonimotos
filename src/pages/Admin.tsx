import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, Users, Package, AlertTriangle, 
  Trash2, CheckCircle2, TrendingUp, Search, 
  ChevronRight, ArrowRight, Zap 
} from "lucide-react";
import { db, collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, where } from "../lib/firebase";
import { Listing, UserProfile, ListingStatus } from "../types";

export function AdminPortal({ user, profile }: { user: any, profile: UserProfile | null }) {
  const [stats, setStats] = useState({ users: 0, listings: 0, pending: 0, revenue: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== "admin") return;

    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Listing));
      setListings(data);
      setStats({
        users: 142, // Mock for now
        listings: data.length,
        pending: data.filter(l => l.status !== ListingStatus.ACTIVE && l.status !== ListingStatus.SOLD).length,
        revenue: data.reduce((acc, l) => acc + l.price, 0) * 0.02 // Commission mock
      });
      setLoading(false);
    });
  }, [profile]);

  const deleteListing = async (id: string) => {
    if (confirm("EXCLUIR ANÚNCIO DEFINITIVAMENTE? Esta ação não pode ser desfeita.")) {
      await deleteDoc(doc(db, "listings", id));
    }
  };

  const promoteListing = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "listings", id), { isPremium: !current });
  };

  if (profile?.role !== "admin") {
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
          
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            <img src={user?.photoURL} className="w-10 h-10 rounded-xl" alt="" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Admin Logado</p>
              <p className="text-xs font-bold uppercase">{user?.displayName}</p>
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

        {/* Inventory Control */}
        <section className="space-y-10">
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
      </div>
    </div>
  );
}
