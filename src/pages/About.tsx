import React from "react";
import { motion } from "motion/react";
import { Bike, Shield, Zap, Users, Globe, Target } from "lucide-react";

export function AboutPage() {
  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-4xl mx-auto space-y-24">
        {/* Hero */}
        <section className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-24 h-24 bg-yellow-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-yellow-400/20"
          >
            <Bike className="w-12 h-12 text-black" />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black uppercase italic tracking-tighter italic">Nossa <span className="text-yellow-400">História</span></h1>
            <p className="text-sm font-bold text-white/30 uppercase tracking-[0.3em] max-w-xl mx-auto leading-relaxed">
              Varoni Motos: Onde a paixão por duas rodas encontra a excelência em negociação.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-12 glass-card premium-border rounded-[3rem] space-y-6">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center border border-yellow-400/20">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Missão</h3>
            <p className="text-sm text-white/50 leading-relaxed font-medium uppercase tracking-wide">
              Proporcionar a melhor experiência de compra e venda de motocicletas do Brasil, unindo tecnologia de ponta com um atendimento humano e especializado.
            </p>
          </div>

          <div className="p-12 glass-card premium-border rounded-[3rem] space-y-6 md:mt-12">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center border border-yellow-400/20">
              <Target className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter transition-all">Visão</h3>
            <p className="text-sm text-white/50 leading-relaxed font-medium uppercase tracking-wide">
              Ser a plataforma número um em confiança e volume de negócios para motocicletas premium e seminovas no mercado nacional.
            </p>
          </div>
        </div>

        {/* Values */}
        <section className="space-y-12">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-center">Nossos <span className="text-white/20">Valores</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, label: "Velocidade" },
              { icon: Shield, label: "Segurança" },
              { icon: Users, label: "Comunidade" },
              { icon: Globe, label: "Presença" }
            ].map((v, i) => (
              <div key={i} className="p-8 glass-card border border-white/5 rounded-[2rem] text-center space-y-4">
                <v.icon className="w-8 h-8 text-yellow-400 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">{v.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <div className="p-16 glass-card premium-border rounded-[4rem] text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] rounded-full" />
          <h2 className="text-4xl font-black uppercase italic tracking-tighter relative z-10">Faça parte do <span className="text-yellow-400">Futuro</span></h2>
          <p className="text-xs text-white/30 uppercase font-black tracking-[0.4em] leading-relaxed relative z-10 max-w-lg mx-auto">
            Official Dealer em Birigui, conectando motociclistas e realizando sonhos sobre duas rodas para todo o Brasil.
          </p>
        </div>
      </div>
    </div>
  );
}
