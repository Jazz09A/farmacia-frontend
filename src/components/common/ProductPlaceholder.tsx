import React from 'react';

interface ProductPlaceholderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ProductPlaceholder: React.FC<ProductPlaceholderProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/4 h-3/4 text-gray-400"
      >
        {/* Fondo del frasco */}
        <rect
          x="60"
          y="80"
          width="80"
          height="100"
          rx="8"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Tapa del frasco */}
        <rect
          x="65"
          y="70"
          width="70"
          height="15"
          rx="4"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Etiqueta del frasco */}
        <rect
          x="70"
          y="100"
          width="60"
          height="40"
          rx="4"
          fill="white"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
        
        {/* Líneas de texto en la etiqueta */}
        <line
          x1="75"
          y1="110"
          x2="115"
          y2="110"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <line
          x1="75"
          y1="120"
          x2="125"
          y2="120"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <line
          x1="75"
          y1="130"
          x2="105"
          y2="130"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        
        {/* Cruz médica */}
        <g transform="translate(85, 45)">
          <circle
            cx="15"
            cy="15"
            r="12"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M15 8v14M8 15h14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        
        {/* Píldoras decorativas */}
        <ellipse
          cx="45"
          cy="150"
          rx="8"
          ry="12"
          fill="currentColor"
          fillOpacity="0.15"
          transform="rotate(-20 45 150)"
        />
        <ellipse
          cx="155"
          cy="160"
          rx="8"
          ry="12"
          fill="currentColor"
          fillOpacity="0.15"
          transform="rotate(25 155 160)"
        />
        
        {/* Cápsulas */}
        <g transform="translate(35, 120)">
          <rect
            x="0"
            y="0"
            width="12"
            height="6"
            rx="3"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <rect
            x="0"
            y="6"
            width="12"
            height="6"
            rx="3"
            fill="currentColor"
            fillOpacity="0.1"
          />
        </g>
        
        <g transform="translate(153, 120)">
          <rect
            x="0"
            y="0"
            width="12"
            height="6"
            rx="3"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <rect
            x="0"
            y="6"
            width="12"
            height="6"
            rx="3"
            fill="currentColor"
            fillOpacity="0.1"
          />
        </g>
      </svg>
    </div>
  );
};

export default ProductPlaceholder;
