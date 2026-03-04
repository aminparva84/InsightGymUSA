import React, { createContext, useContext, useState } from 'react';
import AuthModal from '../components/AuthModal';

const AuthModalContext = createContext(null);

export const useAuthModal = () => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) return { openAuth: () => {}, closeAuth: () => {} };
  return ctx;
};

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openAuth = () => setIsOpen(true);
  const closeAuth = () => setIsOpen(false);
  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeAuth} />
    </AuthModalContext.Provider>
  );
};
