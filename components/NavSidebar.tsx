'use client';

import { usePathname } from 'next/navigation';
import Modal from '@/components/modal/Modal';
import NewPostForm from '@/components/NewPostForm';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

import {
  Cog8ToothIcon,
  HomeIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  HeartIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  Cog8ToothIcon as Cog8ToothIconFull,
  HomeIcon as HomeIconFull,
  InformationCircleIcon as InformationCircleIconFull,
  PaperAirplaneIcon as PaperAirplaneIconFull,
  HeartIcon as HeartIconFull,
  PlusIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import ProxyAvatar from '@/components/Avatar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

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

export default function NavSidebar() {
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const { data: session } = useSession() || {};
  const loggedIn = !!session?.user;
  const address = session?.user ? (session.user as any).address : '';
  const username = session?.user ? (session.user as any).username : '';
  const pathname = usePathname();

  const APPLICATIONS = [
    { url: '/', text: 'Home', icon: HomeIcon, activeIcon: HomeIconFull },
    // { url: '/search', text: 'Search', icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassIconFull, className: 'lg:hidden' },
    {
      url: '/settings',
      text: 'Settings',
      loggedInOnly: true,
      icon: Cog8ToothIcon,
      activeIcon: Cog8ToothIconFull,
    },
    {
      url: '/messages',
      text: 'Messages',
      loggedInOnly: true,
      icon: PaperAirplaneIcon,
      activeIcon: PaperAirplaneIconFull,
    },
    // { url: '/hacker', text: 'Find Teammates', loggedInOnly: true, icon: PaperAirplaneIcon, activeIcon: PaperAirplaneIconFull },
    {
      url: '/about',
      text: 'About',
      icon: InformationCircleIcon,
      activeIcon: InformationCircleIconFull,
    },
  ];

  return (
    <aside className="sticky top-0 z-20 h-screen max-h-screen hidden md:w-16 lg:w-64 flex-col px-2 py-4 md:flex justify-between">
      <div>
        <nav className="space-y-2 lg:space-y-1">
          <Link href="/" className="flex items-center gap-3 px-2 mb-4">
            {/* <img className="rounded-full w-8" src="/img/icon128.png" /> */}
            {/* <Image src="/img/icon128.png" alt="Xocial Icon" width={32} height={32} className="rounded-full" /> */}
            <Avatar className="w-8 h-8">
              <AvatarImage src="/img/icon128.png" />
              <AvatarFallback>X X</AvatarFallback>
            </Avatar>
            <h1 className="hidden lg:flex text-3xl">blockto</h1>
          </Link>
          {APPLICATIONS.map((a, index) => {
            if (a.loggedInOnly && !loggedIn) return null;
            const isActive = a.url === pathname;
            const Icon = isActive ? a.activeIcon : a.icon;
            return (
              <div key={index}>
                <Link
                  href={a.url}
                  // className={`${a.className || ''} inline-flex w-auto flex items-center space-x-4 p-3 rounded-full transition-colors duration-200 hover:bg-neutral-900`}
                  className={`inline-flex w-auto flex items-center space-x-4 p-3 rounded-full transition-colors duration-200 hover:bg-neutral-900`}
                >
                  <Icon className="w-6 h-6" />
                  <span className={`hidden lg:flex`}>{a.text}</span>
                  {a.text === 'messages' && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                      2
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
        {loggedIn ? (
          <div className="flex lg:flex-row md:flex-col gap-2 mt-4">
            <div
              onClick={() => setShowNewPostModal(true)}
              className="btn btn-primary sm:max-md:btn-circle gap-3"
            >
              <PlusIcon width={20} height={20} className="text-white" />
              <div className="hidden lg:block text-white">New Post</div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
      {loggedIn ? (
        <div>
          <Link
            href={`/${address}`}
            className="btn btn-ghost md:max-lg:btn-circle gap-1"
          >
            {/* <ProxyAvatar picture={session?.user?.image || ''} width='w-8'/> */}
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={session?.user?.image || '/default.png'}
                alt="pfp"
              />
              <AvatarFallback>PFP</AvatarFallback>
            </Avatar>
            <div className="hidden lg:block ml-2">
              <span style={{ textTransform: 'none' }}>{username}</span>
            </div>
          </Link>
        </div>
      ) : (
        ''
      )}
      {loggedIn && showNewPostModal ? (
        <Modal
          showContainer={true}
          onClose={() => setShowNewPostModal(false)}
          width={{ md: '2/5' }}
        >
          <div className="flex flex-col gap-4 bg-black w-full rounded-lg border-2 border-gray-500">
            <NewPostForm onSubmit={() => setShowNewPostModal(false)} />
          </div>
        </Modal>
      ) : (
        ''
      )}
    </aside>
  );
}
