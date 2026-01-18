import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = ''
}) => {
  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      onPageChange(newPage);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`mt-12 mb-16 space-y-4 ${className}`}>
      {/* Información de paginación */}
      <div className="text-center text-gray-600">
        <p className="text-sm">
          Mostrando página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
          {' '}({totalItems} productos en total)
        </p>
      </div>
      
      {/* Controles de paginación */}
      <div className="flex justify-center items-center gap-3">
        {/* Botón Anterior */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg border border-white/30 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {generatePaginationNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`px-3 py-2 min-w-[40px] rounded-lg font-medium transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-medical-primary text-white shadow-lg shadow-medical-primary/25'
                      : 'bg-white/80 backdrop-blur-lg border border-white/30 text-gray-700 hover:text-gray-900 hover:bg-white shadow-sm'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg border border-white/30 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default Pagination; 