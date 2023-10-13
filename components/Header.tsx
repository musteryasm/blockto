'use client';

import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon, Cog8ToothIcon } from '@heroicons/react/24/solid';
import { usePathname, useParams, useRouter } from 'next/navigation';
import React, { MouseEventHandler, useEffect } from 'react';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import Image from 'next/image';

import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { SigninMessage } from '@/utils/SigninMessage';
import bs58 from 'bs58';

const navigateBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  window.history.back();
};

const NotLoggedInHeader = ({ onLoginClick }: { onLoginClick: () => void }) => {
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
          onClick={onLoginClick}
          className="btn btn-sm btn-primary text-white"
        >
          Log In
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

  const wallet = useWallet();
  const walletModal = useWalletModal();

  const handleSignIn = React.useCallback(async () => {
    try {
      // if (!wallet.connected) {
      //   walletModal.setVisible(true);
      // }

      const solanaAccount = wallet.publicKey;

      if (!solanaAccount) {
        console.log('Solana account is not available.');
        return;
      }

      const userResponse = await fetch(`/api/user/${solanaAccount.toBase58()}`);
      if (userResponse.status === 404) {
        router.push('/signup');
        return;
      }

      const csrf = await getCsrfToken();
      if (!wallet.publicKey || !csrf || !wallet.signMessage) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.publicKey?.toBase58(),
        statement: `Sign this message to sign in to Blockto.`,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await wallet.signMessage(data);
      const serializedSignature = bs58.encode(signature);

      signIn('credentials', {
        message: JSON.stringify(message),
        redirect: false,
        signature: serializedSignature,
      });
    } catch (error) {
      console.log(error);
    }
  }, [wallet, router]);

  // useEffect(() => {
  //   if (wallet.connected && status === 'unauthenticated' && !loading) {
  //     handleSignIn();
  //   }
  // }, [wallet.connected, loading, handleSignIn, status]);

  let content;
  if (!session?.user?.address && wallet.connected) {
    content = <NotLoggedInHeader onLoginClick={handleSignIn} />;
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
