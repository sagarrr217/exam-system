import React, { createContext, useContext, useState, useCallback } from 'react';
import { RoleGatewayModal } from '../components/RoleGatewayModal';

interface RoleGatewayContextType {
  isGatewayOpen: boolean;
  openGateway: () => void;
  closeGateway: () => void;
}

const RoleGatewayContext = createContext<RoleGatewayContextType | undefined>(undefined);

export const RoleGatewayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  const openGateway = useCallback(() => setIsGatewayOpen(true), []);
  const closeGateway = useCallback(() => setIsGatewayOpen(false), []);

  return (
    <RoleGatewayContext.Provider value={{ isGatewayOpen, openGateway, closeGateway }}>
      {children}
      <RoleGatewayModal isOpen={isGatewayOpen} onClose={closeGateway} />
    </RoleGatewayContext.Provider>
  );
};

export const useRoleGateway = (): RoleGatewayContextType => {
  const ctx = useContext(RoleGatewayContext);
  if (!ctx) {
    throw new Error('useRoleGateway must be used within RoleGatewayProvider');
  }
  return ctx;
};
