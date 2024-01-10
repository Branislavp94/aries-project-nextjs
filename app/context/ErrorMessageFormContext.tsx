'use client'

import React, { FC, ReactNode, createContext, useState } from 'react';

interface Props {
  children: ReactNode;
}

interface AuthErrorContextType {
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
}

const initialContext: AuthErrorContextType = {
  errorMessage: null,
  setErrorMessage: () => { },
};

export const AuthErrorContext = createContext<AuthErrorContextType>(initialContext);

export const AuthErrorContextProvider: FC<Props> = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const provide: AuthErrorContextType = {
    errorMessage,
    setErrorMessage,
  };

  return (
    <AuthErrorContext.Provider value={provide}>
      {children}
    </AuthErrorContext.Provider>
  );
};
