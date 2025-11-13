import React from 'react';
import ResetPasswordForm from '../components/Auth/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl transition-all duration-500 w-full max-w-md">
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

