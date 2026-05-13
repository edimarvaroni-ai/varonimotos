import React from "react";
import { motion } from "motion/react";
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import { StoreMap } from "../components/StoreMap";

export function ContactPage() {
  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-white/5 pb-16">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-400">Atendimento Exclusivo</p>
            <h1 className="text-7xl font-black uppercase italic tracking-tighter">Fale <span className="text-white/20">Conosco</span></h1>
          </div>
          <p className="text-xs text-white/30 uppercase font-black tracking-[0.3em] max-w-sm text-right leading-relaxed">
            Estamos prontos para tirar suas dúvidas e ajudar você a encontrar sua próxima moto.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Info */}
          <div className="lg:col-span-5 space-y-8">
            {[
              { 
                icon: Phone, 
                label: "WhatsApp Vendas 01", 
                val: "(18) 99677-0986", 
                sub: "Falar com Consultor",
                link: "https://wa.me/5518996770986"
              },
              { 
                icon: Phone, 
                label: "WhatsApp Vendas 02", 
                val: "(18) 99757-2769", 
                sub: "Falar com Consultor",
                link: "https://wa.me/5518997572769"
              },
              { 
                icon: Mail, 
                label: "E-mail Geral", 
                val: "contato@varonimotos.com", 
                sub: "Respostas em até 24h",
                link: "mailto:contato@varonimotos.com"
              },
              { 
                icon: MapPin, 
                label: "Showroom Físico", 
                val: "Rua Saudades, 1140", 
                sub: "Centro - Birigui",
                link: "https://maps.apple.com/?address=Rua%20Saudades,%201140,%20Birigui%20-%20SP"
              }
            ].map((c, i) => (
              <a 
                key={i}
                href={c.link}
                target="_blank"
                className="block p-10 glass-card border border-white/5 rounded-[2.5rem] group hover:border-yellow-400/30 transition-all no-underline"
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
                    <c.icon className="w-6 h-6 text-yellow-400 group-hover:text-black" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{c.label}</p>
                    <p className="text-xl font-black uppercase tracking-tighter italic text-white">{c.val}</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">{c.sub}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Map/Form */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[500px] rounded-[4.5rem] p-2 relative overflow-hidden bg-white/5 border border-white/10">
               <StoreMap />
            </div>
          </div>
        </div>

        {/* Social Large */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-12 glass-card premium-border rounded-[3.5rem] bg-[#E1306C]/5 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-8">
              <Instagram className="w-12 h-12 text-[#E1306C]" />
              <div>
                <p className="text-2xl font-black uppercase italic tracking-tighter">@varonimotos</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Acompanhe nosso estoque diário</p>
              </div>
            </div>
          </div>
          <div className="p-12 glass-card premium-border rounded-[3.5rem] bg-[#1877F2]/5 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-8">
              <Facebook className="w-12 h-12 text-[#1877F2]" />
              <div>
                <p className="text-2xl font-black uppercase italic tracking-tighter">Varoni Motos</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Novidades e eventos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
