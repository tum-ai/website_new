import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpRight, Cpu, Globe, Users, Calendar } from "lucide-react";
import { useState } from "react";

interface ProjectCardProps {
  name: string;
  description: string;
  image: string;
  detailedDescription: string;
  members: number;
  established: string;
  location: string;
  projects: string[];
  className?: string;
}

export function InnovationProjectCard({
  name,
  description,
  image,
  detailedDescription,
  members,
  established,
  location,
  className = "",
}: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Determine if we should attempt to show the image
  const showImage = image && image.length > 0 && !imgError;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_50px_-12px_rgba(100,100,255,0.25)] cursor-pointer ${className}`}
        >
          {/* --- Background Layer --- */}
          <div className="absolute inset-0 z-0 h-full w-full bg-slate-900">
            {showImage ? (
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
                onError={() => setImgError(true)} // Falls back to pattern on error
              />
            ) : (
              /* Fallback Pattern (Shows if image missing or error) */
              <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-slate-900">
                {/* Abstract Glow */}
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]" />
                {/* Dot Grid */}
                <div 
                  className="absolute bottom-0 left-0 h-full w-full opacity-30" 
                  style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />
                {/* Central Icon */}
                <div className="relative z-10 text-slate-800 opacity-50">
                   <Cpu size={120} strokeWidth={0.5} />
                </div>
              </div>
            )}
          </div>

          {/* --- Gradient Overlay (Ensures text readability) --- */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* --- Content Layout --- */}
          <div className="relative z-20 flex h-full flex-col justify-between p-6 sm:p-8">
            
            {/* Top Bar: Metadata Tags */}
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-mono text-blue-200 backdrop-blur-md shadow-sm">
                   <Users size={10} /> {members}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-mono text-purple-200 backdrop-blur-md shadow-sm">
                   {established}
                </span>
              </div>
              
              {/* Arrow Icon */}
              <div className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-white group-hover:text-black">
                <ArrowUpRight size={18} />
              </div>
            </div>

            {/* Bottom Bar: Title & Description */}
            <div className="space-y-2 mt-auto">
              <h3 className="text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl">
                {name}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-gray-200/90 line-clamp-2 drop-shadow-sm group-hover:text-white transition-colors">
                {description}
              </p>
            </div>
          </div>
        </div>
      </DialogTrigger>

      {/* --- Detailed Modal Content --- */}
      <DialogContent className="max-w-2xl border-gray-200 bg-white text-slate-900 sm:max-w-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-slate-900">{name}</DialogTitle>
          <div className="flex flex-wrap gap-4 pt-4 text-sm font-mono text-gray-600">
             <div className="flex items-center gap-2"><Globe size={14}/> {location}</div>
             <div className="flex items-center gap-2"><Calendar size={14}/> {established}</div>
             <div className="flex items-center gap-2"><Users size={14}/> {members} Members</div>
          </div>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <p className="text-lg leading-relaxed text-gray-700">{detailedDescription}</p>
        </div>
</DialogContent>
    </Dialog>
  );
}