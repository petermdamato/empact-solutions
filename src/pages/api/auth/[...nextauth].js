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

          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || "Firebase User",
          };
        } catch (err) {
          console.error("Firebase auth error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default (req, res) => NextAuth(req, res, authOptions);
