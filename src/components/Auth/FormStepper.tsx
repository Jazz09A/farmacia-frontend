
import React from 'react';
import { motion } from 'framer-motion';

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
    <div className="flex items-center justify-center space-x-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCompleted
                    ? 'bg-white border-blue-600'
                    : 'bg-white border-gray-300'
                }`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <step.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                )}
              </motion.div>
              <p className={`mt-2 text-xs font-medium text-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 rounded ${
                  isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}; 