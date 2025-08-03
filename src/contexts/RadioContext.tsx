import React, { createContext, useContext, useState } from 'react';

interface RadioContextType {
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
  hasPermission: boolean;
  setHasPermission: (hasPermission: boolean) => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  return (
    <RadioContext.Provider value={{ isReady, setIsReady, hasPermission, setHasPermission }}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
}