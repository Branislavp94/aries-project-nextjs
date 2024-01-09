import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";

const authOptions = NextAuth({
  providers: [
    CredentialProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // @ts-ignore
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        if (!credentials) {
          throw new Error("Credentials are undefined")
        }
        console.log('Implement connection with db');
      }
    }),
  ],
  callbacks: {
    async jwt(params: any) {
      if (params) {
        console.log('DO something');
      }
      return params.token;
    },
    session({ session, token }) {
      if (session.user) {
        console.log('DO something');
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
    signIn: '/', //custom login page 
  },
});


export { authOptions as GET, authOptions as POST };
