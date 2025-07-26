import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/Auth/LoginForm';
import JuridicoRegisterForm from '../components/Auth/JuridicoRegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'juridico' | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleShowRegister = () => {
    setIsLogin(false);
    setUserType('juridico');
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setUserType(null);
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.user_type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const renderForm = () => {
    if (isLogin) {
      return (
        <LoginForm
          onSwitchToRegister={handleShowRegister}
          onSuccess={() => {
            if (user?.user_type === 'admin') {
              navigate('/admin');
            } else {
              navigate('/profile');
            }
          }}
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
                key={isLogin ? 'login' : 'register'}
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