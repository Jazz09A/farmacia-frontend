
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
}

export const FormStepper: React.FC<FormStepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full px-2 sm:px-4">
        <div className="flex items-center justify-center">
            {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                    <React.Fragment key={step.id}>
                        <div className="relative flex flex-col items-center">
                            <motion.div
                                className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${isActive ? 'bg-blue-600 border-blue-600 text-white' : ''}
                                ${isCompleted ? 'bg-white border-blue-600' : ''}
                                ${!isActive && !isCompleted ? 'bg-white border-gray-300' : ''}
                                `}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                                ) : (
                                    <step.icon className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                )}
                            </motion.div>
                            <p className={`absolute top-10 sm:top-12 lg:top-15 text-[10px] sm:text-xs font-semibold text-center w-16 sm:w-20 lg:w-24 transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-gray-500'} leading-tight`}>
                                {step.title}
                            </p>
                        </div>

                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 sm:h-1 transition-colors duration-500 mx-1 sm:mx-2 lg:mx-3
                            ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'}
                            `} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    </div>
  );
}; 