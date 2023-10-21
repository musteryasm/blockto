'use client';

import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon, Cog8ToothIcon } from '@heroicons/react/24/solid';
import { usePathname, useParams, useRouter } from 'next/navigation';
import React, { MouseEventHandler, useEffect } from 'react';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { generateNonceForLogin } from '@/utils/zklogin';
import { useWallet } from '@suiet/wallet-kit';
import { SigninMessage } from '@/utils/SigninMessage';
import { jwtToAddress } from '@mysten/zklogin';
import bs58 from 'bs58';

const navigateBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  window.history.back();
};

const ZkHeader = ({ onZkLoginClick }: { onZkLoginClick: () => void }) => {
  return (
    <>
      <div className="flex items-center md:hidden gap-2 p-3 text-2xl">
        <Image
          src="/img/icon128.png"
          alt="Blockto Icon"
          width={32}
          height={32}
          className="rounded-full"
        />
        blockto
      </div>
      <div className="w-full flex items-center justify-end gap-2 p-2 h-14">
        <button
          type="button"
          onClick={onZkLoginClick}
          className="btn btn-sm btn-primary text-white"
        >
          ZK Login
        </button>
      </div>
    </>
  );
};

const NotLoggedInHeader = ({
  onLoginClick,
  onZkLoginClick,
}: {
  onLoginClick: () => void;
  onZkLoginClick: () => void;
}) => {
  return (
    <>
      <div className="flex items-center md:hidden gap-2 p-3 text-2xl">
        <Image
          src="/img/icon128.png"
          alt="Blockto Icon"
          width={32}
          height={32}
          className="rounded-full"
        />
        blockto
      </div>
      <div className="w-full flex items-center justify-end gap-2 p-2 h-14">
        <button
          type="button"
          onClick={onZkLoginClick}
          className="btn btn-sm btn-secondary text-white"
        >
          ZK Login
        </button>
        <button
          type="button"
          onClick={onLoginClick}
          className="btn btn-sm btn-primary text-white"
        >
          Wallet Login
        </button>
      </div>
    </>
  );
};

const HomeHeader = () => {
  return (
    <>
      <div className="flex items-center md:hidden gap-2 px-4 p-3 text-2xl mr-3">
        <Image
          src="/img/icon128.png"
          alt="Blockto Icon"
          width={32}
          height={32}
          className="rounded-full"
        />
        blockto
      </div>
      <div className="hidden md:flex w-full flex items-center justify-center gap-2 p-3 mr-16 md:mr-0 h-14">
        Home
      </div>
    </>
  );
};

const BackNavHeader = () => {
  const pathname = usePathname();
  const params = useParams();
  const { data: session } = useSession() || {};
  console.log('Session', session);

  const isMyProfile =
    pathname.startsWith('/0x') &&
    params.address === (session?.user as any).address;

  return (
    <>
      <div className="p-2">
        <a href="components/Header#" onClick={navigateBack}>
          <ArrowLeftIcon width={24} />
        </a>
      </div>
      {isMyProfile && (
        <div className="md:hidden flex items-center gap-2 p-3">
          <Link href="/settings">
            <Cog8ToothIcon width={28} />
          </Link>
        </div>
      )}
    </>
  );
};

const scrollUp: MouseEventHandler = (e) => {
  const target = e.target as HTMLElement;
  const selectors = ['a', 'input', 'button', '.btn'];

  const isMatch = selectors.some((selector) => target.closest(selector));

  if (!isMatch) {
    window.scrollTo(0, 0);
  }
};

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = (useSession() || {}) as any;
  const loading = status === 'loading';

  useEffect(() => {
    if (window.location.hash.includes('id_token')) {
      const tokenMatch = window.location.hash.match(/id_token=([^&]*)/);
      if (tokenMatch && tokenMatch[1]) {
        router.push('/');

        const extendedEphemeralPublicKey = Cookies.get('publickey');
        const maxEpoch = Cookies.get('maxepoch');
        const jwtRandomness = Cookies.get('randomness');

        const payload = {
          jwt: tokenMatch[1],
          extendedEphemeralPublicKey,
          maxEpoch,
          jwtRandomness,
          salt: '0',
          keyClaimName: 'sub',
        };

        const sendPostRequest = async () => {
          try {
            const response = await fetch('/api/zklogin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                payload,
                zklogin: jwtToAddress(tokenMatch[1], '0'),
                privatekey: Cookies.get('privatekey'),
              }),
            });

            const data = await response.json();
            console.log('Response:', data);

            const csrf = await getCsrfToken();
            if (!csrf) return;

            const userResponse = await fetch(`/api/user/${data.zklogin}`);

            if (userResponse.status === 404) {
              const message = new SigninMessage({
                domain: window.location.host,
                publicKey: data.zklogin,
                statement: `Sign this message to sign in to Blockto.`,
                nonce: csrf,
                username: data.username,
              });

              signIn('credentials', {
                message: JSON.stringify(message),
                redirect: false,
                signature: data.final.digest,
              });
            } else {
              const message = new SigninMessage({
                domain: window.location.host,
                publicKey: data.zklogin,
                statement: `Sign this message to sign in to Blockto.`,
                nonce: csrf,
              });

              signIn('credentials', {
                message: JSON.stringify(message),
                redirect: false,
                signature: data.final.digest,
              });
            }
          } catch (error) {
            console.error('Error sending POST request:', error);
          }
        };

        sendPostRequest();
      }
    }
  }, [router]);

  console.log('Zklogin? ', Cookies.get('zklogin'));

  const wallet = useWallet();

  const handleSignIn = React.useCallback(async () => {
    try {
      const suiAccount = wallet.address;
      console.log('Sui Account', suiAccount);

      if (!suiAccount) {
        console.log('Sui account is not available.');
        return;
      }

      const userResponse = await fetch(`/api/user/${suiAccount}`);
      if (userResponse.status === 404) {
        router.push('/signup');
        return;
      }

      const csrf = await getCsrfToken();
      if (!wallet.address || !csrf) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.address,
        statement: `Sign this message to sign in to Blockto.`,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const result = await wallet.signMessage({
        message: data,
      });
      const signature = result.signature;

      signIn('credentials', {
        message: JSON.stringify(message),
        redirect: false,
        signature,
      });
    } catch (error) {
      console.log(error);
    }
  }, [wallet, router]);

  const handleZkSignIn = async () => {
    const nonce = await generateNonceForLogin();
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=952881201008-g6bmhti204d20f20hoe7s20ktpcbj3d2.apps.googleusercontent.com&response_type=id_token&redirect_uri=http://localhost:3002&scope=openid%20profile%20email&nonce=${nonce}`;
    window.location.href = authUrl;
  };

  let content;
  if (!session?.user?.address && !wallet.connected) {
    content = <ZkHeader onZkLoginClick={handleZkSignIn} />;
  } else if (!session?.user?.address && wallet.connected) {
    content = (
      <NotLoggedInHeader
        onLoginClick={handleSignIn}
        onZkLoginClick={handleZkSignIn}
      />
    );
  } else if (pathname.length <= 1) {
    content = <HomeHeader />;
  } else {
    content = <BackNavHeader />;
  }

  return (
    <div className="sticky top-0 z-10 w-full cursor-pointer" onClick={scrollUp}>
      <div className="w-full bg-base-200 bg-black md:bg-opacity-50 md:shadow-lg md:backdrop-blur-lg">
        <div className="flex w-full items-center justify-between">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Header;
