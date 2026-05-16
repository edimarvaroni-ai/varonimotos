import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { MapPin, Zap, Calendar, TrendingUp, Heart, ChevronRight } from "lucide-react";
import { Listing } from "../types";

export function ListingCard({ listing, isFavorite, onToggleFavorite }: { 
  listing: Listing, 
  isFavorite?: boolean,
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void 
}) {
  return (
    <motion.div
      layout
      whileHover={{ y: -10 }}
      className="group bg-black border border-white/5 hover:border-yellow-400/30 transition-all duration-500 rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl"
    >
      <Link to={`/listing/${listing.id}`} className="block relative h-72 overflow-hidden">
        <img 
          src={listing.images?.[0] || "https://images.unsplash.com/photo-1599819811279-d1921f3f7a6c?q=80&w=2070&auto=format&fit=crop"} 
          alt={`${listing.brand} ${listing.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex gap-3 z-20">
          {listing.isPremium && (
            <div className="bg-yellow-400 text-black text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.3)]">
              PREMIUM
            </div>
          )}
          <div className="bg-black/80 backdrop-blur-xl text-white/50 text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl border border-white/10">
            {listing.condition}
          </div>
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => onToggleFavorite?.(listing.id, e)}
          className={`absolute top-6 right-6 z-20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all duration-500 ${
            isFavorite ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-6 left-8 z-20">
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-400 mb-2"
          >
            {listing.category}
          </motion.p>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-[0.8] text-white">
            {listing.brand}<br />
            <span className="text-white/40">{listing.model}</span>
          </h3>
        </div>
      </Link>

      <div className="p-10 flex flex-col flex-1 space-y-8">
        <div className="grid grid-cols-2 gap-6 pb-8 border-b border-white/5">
          <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Ano/Modelo</p>
            <div className="flex items-center gap-2 text-xs font-black italic text-white/80">
              <Calendar className="w-3 h-3 text-yellow-400" />
              {listing.year}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Kilometragem</p>
            <div className="flex items-center gap-2 text-xs font-black italic text-white/80">
              <TrendingUp className="w-3 h-3 text-yellow-400" />
              {listing.kilometers?.toLocaleString()} KM
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Investimento</p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-yellow-400 italic">R$</span>
              <span className="text-4xl font-black tracking-tighter italic text-white">
                {listing.price.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
          
          <Link 
            to={`/listing/${listing.id}`}
            className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all duration-700 group-hover:rotate-[-8deg] shadow-2xl"
          >
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
