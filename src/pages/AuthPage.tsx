import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import JuridicoRegisterForm from '../components/Auth/JuridicoRegisterForm';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm';

const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  
  const [isLogin, setIsLogin] = useState(mode !== 'register' && mode !== 'forgot-password');
  const [userType, setUserType] = useState<'juridico' | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(mode === 'forgot-password');

  useEffect(() => {
    setShowForgotPassword(mode === 'forgot-password');
    setIsLogin(mode !== 'register' && mode !== 'forgot-password');
  }, [mode]);

  const handleShowRegister = () => {
    setIsLogin(false);
    setUserType('juridico');
    setSearchParams({ mode: 'register' });
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setUserType(null);
    setShowForgotPassword(false);
    setSearchParams({ mode: 'login' });
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setIsLogin(false);
    setSearchParams({ mode: 'forgot-password' });
  };

  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false);
    setIsLogin(true);
    setSearchParams({ mode: 'login' });
  };

  const renderForm = () => {
    if (showForgotPassword) {
      return (
        <ForgotPasswordForm
          onBack={handleBackFromForgotPassword}
        />
      );
    }
    
    if (isLogin) {
      return (
        <LoginForm
          onSwitchToRegister={handleShowRegister}
        />
      );
    }
    
    return <JuridicoRegisterForm onSuccess={handleSwitchToLogin} onSwitchToLogin={handleSwitchToLogin} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-2 sm:p-4">
      <div className={`bg-white rounded-xl sm:rounded-2xl shadow-xl transition-all duration-500 w-full flex flex-col ${
        isLogin ? 'max-w-md' : 'max-w-5xl max-h-[90vh]'
      }`}>
        <div className={`flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 ${isLogin ? '' : 'custom-scrollbar'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={showForgotPassword ? 'forgot-password' : isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderForm()}
              </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;