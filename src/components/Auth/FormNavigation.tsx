
import React from 'react';
import { ChevronLeft, ChevronRight, Loader2, Building } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  isLoading,
  onPrevStep,
  onNextStep,
  onSubmit,
}) => {
  return (
    <div className="flex justify-between items-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
      <button
        onClick={onPrevStep}
        disabled={currentStep === 1 || isLoading}
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="font-medium">Anterior</span>
      </button>

      <div className="text-xs sm:text-sm text-gray-500">
        Paso {currentStep} de {totalSteps}
      </div>

      {currentStep < totalSteps ? (
        <button
          onClick={onNextStep}
          className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
        >
          <span className="font-medium">Siguiente</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md disabled:opacity-75"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span>Creando...</span>
            </>
          ) : (
            <>
              <Building className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Crear Cuenta</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}; 