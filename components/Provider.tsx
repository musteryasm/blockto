'use client';

import { SessionProvider } from 'next-auth/react';
import { WalletProvider } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

type ProviderProps = {
  children: React.ReactNode;
  session?: any;
};

const Provider = ({ children, session }: ProviderProps) => {
  return (
    <WalletProvider>
      <SessionProvider session={session} refetchInterval={0}>
        {children}
      </SessionProvider>
    </WalletProvider>
  );
};

export default Provider;
