import React from "react";
import { motion } from "motion/react";
import { Calculator, Shield, Zap, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";

export function FinancingPage() {
  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Hero */}
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-3 bg-yellow-400/10 px-6 py-2 rounded-full border border-yellow-400/20">
            <Calculator className="w-4 h-4 text-yellow-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">Soluções Financeiras</p>
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl font-black uppercase italic tracking-tighter">SUA MOTO NO <span className="text-yellow-400">BOLSO</span></h1>
            <p className="text-sm font-bold text-white/30 uppercase tracking-[0.3em] max-w-2xl mx-auto leading-relaxed">
              As melhores taxas do mercado com aprovação rápida e sem burocracia.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "Taxas Reduzidas", 
              desc: "Parcerias com os maiores bancos para garantir o menor juros.",
              icon: TrendingUp 
            },
            { 
              title: "Aprovação 100% Online", 
              desc: "Simule e receba a resposta em poucos minutos pelo WhatsApp.",
              icon: Zap 
            },
            { 
              title: "Entrada Facilitada", 
              desc: "Aceitamos sua moto usada como entrada com a melhor avaliação.",
              icon: Shield 
            }
          ].map((b, i) => (
            <div key={i} className="p-12 glass-card premium-border rounded-[3rem] space-y-8">
              <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center">
                <b.icon className="w-7 h-7 text-black" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{b.title}</h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Simulator CTA */}
        <div className="p-20 glass-card premium-border rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 bg-yellow-400">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-xl text-black">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-tight">QUER SIMULAR UM <span className="text-white">FINANCIAMENTO?</span></h2>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem Burocracia</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Resultado Imediato</p>
              </div>
            </div>
          </div>

          <a 
            href="https://wa.me/5518996770986" 
            target="_blank"
            className="relative z-10 px-12 py-8 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs flex items-center gap-6 hover:scale-105 transition-transform shadow-2xl shadow-black/40 no-underline"
          >
            Falar com Especialista
            <ArrowRight className="w-6 h-6 text-yellow-400" />
          </a>
        </div>

        {/* Partners */}
        <div className="space-y-12 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.6em]">Nossos Parceiros Financeiros</p>
          <div className="flex flex-wrap justify-center gap-16 grayscale px-8">
            <img src="https://logodownload.org/wp-content/uploads/2014/05/santander-logo-1.png" className="h-8 md:h-12 object-contain" alt="Santander" />
            <img src="https://logodownload.org/wp-content/uploads/2014/04/itau-logo-0.png" className="h-8 md:h-12 object-contain" alt="Itau" />
            <img src="https://logodownload.org/wp-content/uploads/2014/04/bradesco-logo-2.png" className="h-8 md:h-12 object-contain" alt="Bradesco" />
            <img src="https://logodownload.org/wp-content/uploads/2019/06/bv-financeira-logo-1.png" className="h-8 md:h-12 object-contain" alt="BV" />
          </div>
        </div>
      </div>
    </div>
  );
}
