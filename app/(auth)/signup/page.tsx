'use client';

import { useState, FC } from 'react';
import CardContainer from '@/components/CardContainer';
import { getCsrfToken, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { SigninMessage } from '@/utils/SigninMessage';
import bs58 from 'bs58';

const SignupPage: FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');

  const wallet = useWallet();
  const walletModal = useWalletModal();

  const handleSignUp = async () => {
    try {
      if (!wallet.connected) {
        walletModal.setVisible(true);
      }

      const csrf = await getCsrfToken();
      if (!wallet.publicKey || !csrf || !wallet.signMessage) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.publicKey?.toBase58(),
        statement: `Sign this message to sign in to the app.`,
        nonce: csrf,
        username: name,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await wallet.signMessage(data);
      const serializedSignature = bs58.encode(signature);

      signIn('credentials', {
        message: JSON.stringify(message),
        redirect: false,
        signature: serializedSignature,
      });

      router.push('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <CardContainer>
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold md:text-4xl">Blockto</h1>
          <h2 className="text-xs">
            Ensuring Content Authenticity in the Age of Deepfakes
          </h2>
        </div>
      </CardContainer>

      <CardContainer>
        <div className="form-control w-full">
          <input
            autoFocus={true}
            type="text"
            placeholder="Choose your username"
            className="input-bordered input-primary input w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button className="btn-primary btn" onClick={handleSignUp}>
          Go
        </button>
      </CardContainer>
    </>
  );
};

export default SignupPage;
