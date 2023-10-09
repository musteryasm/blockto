'use client'

import { SessionProvider } from "next-auth/react";
import { SolanaProvider } from "./SolanaProvider";

type ProviderProps = {
  children: React.ReactNode;
  session?: any;
};

const Provider = ({ children, session }: ProviderProps) => {
  return (
    <SolanaProvider>
      <SessionProvider session={session} refetchInterval={0}>
        {children}
      </SessionProvider>
    </SolanaProvider>
  );
}

export default Provider;
