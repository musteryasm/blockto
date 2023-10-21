import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import { SigninMessage } from '@/utils/SigninMessage';

import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Sui',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
        },
        signature: {
          label: 'Signature',
          type: 'text',
        },
      },
      async authorize(credentials, req) {
        try {
          const signinMessage = new SigninMessage(
            JSON.parse(credentials?.message || '{}')
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);
          if (signinMessage.domain !== nextAuthUrl.host) {
            return null;
          }

          const csrfToken = await getCsrfToken({ req: { ...req, body: null } });

          if (signinMessage.nonce !== csrfToken) {
            return null;
          }

          const validationResult = await signinMessage.validate(
            credentials?.signature || ''
          );

          if (!validationResult)
            throw new Error('Could not validate the signed message');

          return {
            id: signinMessage.publicKey,
            username: signinMessage.username,
          };
        } catch (e) {
          console.log(e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      const sessionUser = await User.findOne({ address: token.sub });

      if (session.user && sessionUser) {
        session.user.address = sessionUser.address;
        session.user.id = sessionUser._id;
        session.user.username = sessionUser.username;
        if (sessionUser.name) session.user.name = sessionUser.name;
        if (sessionUser.profilePicture)
          session.user.image = sessionUser.profilePicture;
      }

      return session;
    },
    async signIn({ user }) {
      try {
        await connectToDB();

        const publicKey = user.id;
        const username = user.username;

        const userExists = await User.findOne({ address: publicKey });

        if (!userExists) {
          if (!username) {
            throw new Error('No username provided for a new user.');
          }
          await User.create({
            address: publicKey,
            username: username,
            timestamp: new Date(),
          });
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
