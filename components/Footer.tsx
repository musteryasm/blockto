'use client';

import {
  HomeIcon,
  PaperAirplaneIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconFull,
  PaperAirplaneIcon as PaperAirplaneIconFull,
  PlusCircleIcon as PlusCircleIconFull,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
// import ProxyAvatar from "@/components/Avatar";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const MagnifyingGlassIconFull = ({ className }: { className?: string }) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="3"
      stroke="currentColor"
      className={className}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
};

const Footer = () => {
  const { data: session } = useSession() || {};
  const address = session?.user ? (session.user as any).address : '';
  const pathname = usePathname();

  if (!address) return null;

  return (
    <div className="fixed md:hidden bottom-0 z-10 w-full bg-base-200 pb-safe-area-inset-bottom">
      <div className="flex w-full h-full items-stretch">
        <Link
          href="/"
          className="flex-grow flex items-center justify-center p-3"
        >
          {pathname === '/' ? (
            <HomeIconFull className="h-6 w-6" />
          ) : (
            <HomeIcon className="h-6 w-6" />
          )}
        </Link>
        <Link
          href="/post"
          className="flex-grow flex items-center justify-center p-3"
        >
          {pathname === '/post' ? (
            <PlusCircleIconFull className="h-6 w-6" />
          ) : (
            <PlusCircleIcon className="h-6 w-6" />
          )}
        </Link>
        <Link
          href="/messages"
          className="flex-grow flex items-center justify-center p-3"
        >
          {pathname === '/messages' ? (
            <PaperAirplaneIconFull className="h-6 w-6" />
          ) : (
            <PaperAirplaneIcon className="h-6 w-6" />
          )}
        </Link>
        {address && (
          <Link
            href={`/${address}`}
            className="flex-grow flex items-center justify-center p-3"
          >
            <div
              className={`flex border-2 ${
                pathname === `/${address}`
                  ? 'border-white rounded-full'
                  : 'border-transparent'
              }`}
            >
              {/* <ProxyAvatar width="w-6" picture={session?.user?.image || ''} /> */}
              <Avatar className="w-6 h-6">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback>PFP</AvatarFallback>
              </Avatar>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Footer;
