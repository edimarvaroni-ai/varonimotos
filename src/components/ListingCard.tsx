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
      whileHover={{ y: -8 }}
      className="group bg-[#0A0A0A] border border-white/5 hover:border-yellow-400/30 transition-all rounded-[2rem] overflow-hidden flex flex-col relative"
    >
      <Link to={`/listing/${listing.id}`} className="block relative h-64 overflow-hidden">
        <img 
          src={listing.images[0]} 
          alt={`${listing.brand} ${listing.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {listing.isPremium && (
            <div className="bg-yellow-400 text-black text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-2xl">
              Destaque
            </div>
          )}
          <div className="bg-black/80 backdrop-blur-md text-white/70 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-white/10">
            {listing.condition}
          </div>
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => onToggleFavorite?.(listing.id, e)}
          className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all ${
            isFavorite ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-4 left-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-1">{listing.brand}</p>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{listing.model}</h3>
        </div>
      </Link>

      <div className="p-8 flex flex-col flex-1">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest">
            <Calendar className="w-4 h-4 text-yellow-400/50" />
            {listing.year}
          </div>
          <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest">
            <TrendingUp className="w-4 h-4 text-yellow-400/50" />
            {listing.kilometers?.toLocaleString()} KM
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest mb-8">
          <MapPin className="w-4 h-4 text-yellow-400" />
          {listing.location.city}, {listing.location.state}
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Preço à Vista</p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-yellow-400 italic">R$</span>
              <span className="text-3xl font-black tracking-tighter italic">
                {listing.price.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
          
          <Link 
            to={`/listing/${listing.id}`}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all duration-500 group-hover:rotate-[-8deg]"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
