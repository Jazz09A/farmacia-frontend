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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 w-full ${
        isLogin ? 'max-w-md' : 'max-w-4xl'
      }`}>
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
  );
};

export default AuthPage;