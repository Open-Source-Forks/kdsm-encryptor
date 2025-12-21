"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * MetroTiles - Windows 8.1-style tile UI component
 * Features entry animations and flip-on-hover interactions
 */

const TileVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotateY: -90 
  },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
};

function MetroTile({ 
  icon: Icon, 
  title, 
  subtitle, 
  backContent,
  color = "bg-blue-600",
  size = "medium",
  index = 0,
  onClick,
  className,
  iconOnly = false,
  autoFlip = true
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate randomized flip duration between 0.4s and 0.8s for natural feel
  const [flipDuration] = useState(() => 0.4 + Math.random() * 0.4);
  
  // Generate randomized auto-flip interval between 3s and 8s
  const [flipInterval] = useState(() => 5000 + Math.random() * 6000);
  
  // Auto-flip effect
  useEffect(() => {
    if (!autoFlip || isHovered) return;
    
    const interval = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, flipInterval);
    
    return () => clearInterval(interval);
  }, [autoFlip, flipInterval, isHovered]);

  const sizeClasses = {
    xs: "col-span-1 row-span-1 h-20", // Extra small - 4 tiles = 1 medium tile
    small: "col-span-2 row-span-2 h-32",
    medium: "col-span-2 row-span-2 h-40", // Medium is now 2x2 grid
    large: "col-span-4 row-span-2 h-40",
    tall: "col-span-2 row-span-4 h-80",
    wide: "col-span-4 row-span-4 h-80",
  };
  
  const iconSizeClasses = size === "xs" ? "w-6 h-6 sm:w-8 sm:h-8" : iconOnly ? "w-8 h-8 sm:w-10 sm:h-10" : "w-12 h-12";

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={TileVariants}
      className={cn(
        "relative cursor-pointer perspective-1000",
        sizeClasses[size],
        className
      )}
      style={{ perspective: "1000px" }}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsFlipped(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsFlipped(false);
      }}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: flipDuration, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Face */}
        <div
          className={cn(
            "absolute inset-0 rounded-none overflow-hidden",
            color,
            "backface-hidden",
            "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className={cn(
            "w-full h-full flex text-white",
            iconOnly ? "items-center justify-center p-6" : "p-4 flex-col justify-between"
          )}>
            {iconOnly ? (
              Icon && <Icon className={iconSizeClasses} strokeWidth={1.5} />
            ) : (
              <>
                <div className="flex-1 flex items-start justify-start">
                  {Icon && <Icon className="w-12 h-12" strokeWidth={1.5} />}
                </div>
                <div>
                  <h3 className="font-tomorrow font-bold text-lg leading-tight mb-1">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-xs opacity-90 font-tomorrow">{subtitle}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back Face */}
        <div
          className={cn(
            "absolute inset-0 rounded-none overflow-hidden",
            color,
            "backface-hidden brightness-110",
            "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]"
          )}
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className={cn(
            "w-full h-full flex items-center justify-center text-white",
            iconOnly ? "p-6" : "p-4"
          )}>
            <div className="text-center font-tomorrow">
              {backContent || (
                iconOnly ? (
                  Icon && <Icon className={iconSizeClasses} strokeWidth={1.5} />
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-bold text-base">{title}</h4>
                    <p className="text-xs opacity-90">Click to interact</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MetroTiles({ tiles = [], className }) {
  return (
    <div 
      className={cn(
        "grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 auto-rows-[80px] gap-2 w-full max-w-7xl mx-auto",
        className
      )}
    >
      {tiles.map((tile, index) => (
        <MetroTile
          key={tile.id || index}
          {...tile}
          index={index}
        />
      ))}
    </div>
  );
}

export { MetroTile };
