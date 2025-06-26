import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
  icon: Icon,
  title,
  description,
  index
}) => {
  return (
    <motion.div
      className="group text-center cursor-pointer h-full"
      whileHover={{ scale: 1.03, y: -12 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.8 + index * 0.2,
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
    >
      <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/40 hover:bg-white/95 hover:border-gray-200 transition-all duration-500 overflow-hidden h-56 flex flex-col justify-between">
        {/* Hover gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex flex-col items-center h-full justify-center space-y-4">
          {/* Icon Container - Standardized size with animations */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl border border-slate-500/50 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:shadow-lg transition-all duration-500"
              whileHover={{ 
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.6,
                ease: "easeInOut"
              }}
            >
              <Icon className="w-8 h-8 text-white group-hover:text-white transition-colors duration-500" />
            </motion.div>
            
            {/* Pulse ring effect on hover - Applied to all cards */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-blue-400 opacity-0 group-hover:opacity-30"
              initial={{ scale: 1, opacity: 0 }}
              whileHover={{
                scale: [1, 1.3, 1.5],
                opacity: [0, 0.4, 0]
              }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            
            {/* Secondary pulse ring for enhanced effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-blue-300 opacity-0 group-hover:opacity-20"
              initial={{ scale: 1, opacity: 0 }}
              whileHover={{
                scale: [1, 1.6, 2],
                opacity: [0, 0.2, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.3
              }}
            />
          </div>
          
          {/* Text Content - Fixed spacing */}
          <div className="space-y-3 text-center flex-grow flex flex-col justify-center">
            <h3 className="font-bold text-lg text-white group-hover:text-gray-900 transition-colors duration-500 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-slate-200 group-hover:text-gray-600 leading-relaxed transition-colors duration-500 px-2">
              {description}
            </p>
          </div>
        </div>
        
        {/* Enhanced shine effect on hover - Applied to all cards */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-400/30 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ 
            x: '200%',
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 1,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
        
        {/* Additional glowing border effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-blue-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </div>
    </motion.div>
  );
}; 