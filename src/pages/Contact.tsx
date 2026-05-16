import React from "react";
import { motion } from "motion/react";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

export function ContactPage() {
  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-white/5 pb-16">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-400">Official Dealer Birigui, SP</p>
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
                val: "VARONIMOTOS@GMAIL.COM", 
                sub: "Respostas em até 24h",
                link: "mailto:VARONIMOTOS@GMAIL.COM"
              },
              { 
                icon: MapPin, 
                label: "Official Dealer", 
                val: "BIRIGUI, SP", 
                sub: "AV. DAS ROSAS, 35",
                link: "https://maps.apple.com/?address=Av.%20das%20Rosas,%2035,%20Birigui%20-%20SP"
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

          {/* Brand Visual */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[500px] rounded-[4.5rem] p-12 relative overflow-hidden bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center space-y-8">
               <div className="absolute inset-0 opacity-10">
                 <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent" />
                 <div className="h-full w-full bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px]" />
               </div>
               
               <div className="relative">
                 <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse blur-3xl absolute inset-0 -z-10 opacity-20" />
                 <h2 className="text-[120px] font-black italic tracking-tighter text-white opacity-5 select-none">VARONI</h2>
               </div>
               
               <div className="space-y-4 max-w-sm relative">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Authentic Machine</h3>
                 <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.4em] leading-relaxed">
                   Visite nosso showroom em Birigui para uma experiência completa no mundo das duas rodas.
                 </p>
                 <div className="pt-8">
                   <a 
                     href="https://maps.apple.com/?address=Av.%20das%20Rosas,%2035,%20Birigui%20-%20SP"
                     target="_blank"
                     rel="noreferrer"
                     className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-yellow-400 hover:text-black transition-all"
                   >
                     Abrir no GPS
                   </a>
                 </div>
               </div>
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
