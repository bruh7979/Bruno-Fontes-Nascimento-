import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  banners: Banner[];
}

export const Hero: React.FC<HeroProps> = ({ banners }) => {
  const activeBanners = banners.filter(b => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const banner = activeBanners[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gray-200">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform hover:scale-105"
        style={{ backgroundImage: `url(${banner.image})` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
        <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg animate-fade-in-up">
          {banner.title}
        </h2>
        <p className="text-lg md:text-xl font-light mb-8 max-w-2xl drop-shadow-md">
          {banner.subtitle}
        </p>
        <button className="px-8 py-3 bg-white text-black font-semibold tracking-widest hover:bg-gray-100 transition-colors uppercase text-sm">
          Conferir Ofertas
        </button>
      </div>

      {activeBanners.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-all text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-all text-white"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {activeBanners.map((_, idx) => (
          <div 
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};
