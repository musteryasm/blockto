'use client';

import { useState, FC } from 'react';
import CardContainer from '@/components/CardContainer';
import { getCsrfToken, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useWallet } from '@suiet/wallet-kit';
import { SigninMessage } from '@/utils/SigninMessage';
import bs58 from 'bs58';

const SignupPage: FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');

  const wallet = useWallet();

  const handleSignUp = async () => {
    try {
      const csrf = await getCsrfToken();
      if (!wallet.address || !csrf) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.address,
        statement: `Sign this message to sign in to Blockto.`,
        nonce: csrf,
        username: name,
      });

      console.log('Message', message);

      const data = new TextEncoder().encode(message.prepare());
      const result = await wallet.signMessage({
        message: data,
      });
      const signature = result.signature;
      console.log('Signature', signature);

      signIn('credentials', {
        message: JSON.stringify(message),
        redirect: false,
        signature,
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
