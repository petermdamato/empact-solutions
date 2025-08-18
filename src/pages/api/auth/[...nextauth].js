import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "@/lib/firebaseClient";
import { firebaseAuth } from "@/lib/firebaseClient";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Firebase Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize({ email, password }) {
        try {
          const userCredential = await signInWithEmailAndPassword(
            firebaseAuth,
            email,
            password
          );
          const user = userCredential.user;

          // Get Firebase ID token
          const idToken = await user.getIdToken();

          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || "Firebase User",
            idToken, // Include the Firebase token
          };
        } catch (err) {
          console.error("Firebase auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.idToken = user.idToken;
        token.expiresAt = Math.floor(Date.now() / 1000) + 2 * 60 * 60; // 2 hours
      }

      // Return previous token if still valid
      if (token.expiresAt > Math.floor(Date.now() / 1000)) {
        return token;
      }

      // Token expired - return empty token which will force logout
      return {};
    },

    async session({ session, token }) {
      // Send properties to the client
      session.idToken = token.idToken;
      session.expires = token.expiresAt;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
    updateAge: 5 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default (req, res) => NextAuth(req, res, authOptions);
