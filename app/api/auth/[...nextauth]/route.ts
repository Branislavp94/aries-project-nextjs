import { getUserByEmail } from '@/app/apiCalls/user';
import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";

const authOptions = NextAuth({
  providers: [
    CredentialProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
      },
      // @ts-ignore
      async authorize(credentials: Record<"email", string> | undefined) {
        if (!credentials) {
          throw new Error("Credentials are undefined")
        }

        return {
          email: credentials.email,
        }
      }
    }),
  ],
  callbacks: {
    // @ts-ignore
    async jwt(params: { token: { email: string } }) {
      const user = await getUserByEmail(params.token.email);

      if (user) {
        return {
          email: user?.email,
          name: user?.name,
          role: user?.role,
          id: user?.id,
        }
      }
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { image: string }).image = token.image as string;
      }

      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 3600 * 1000,  //one week
  },
  pages: {
    signIn: '/login', //custom login page 
  },
});


export { authOptions as GET, authOptions as POST };
