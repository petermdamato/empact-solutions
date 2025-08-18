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
    async jwt({ token, user, trigger }) {
      const now = Math.floor(Date.now() / 1000);

      // Initial sign in
      if (user) {
        token.idToken = user.idToken;
        token.uid = user.id;
        token.expiresAt = now + 2 * 60 * 60; // 2 hours
        token.lastActivity = now;
        console.log(
          "JWT: New session created, expires at",
          new Date(token.expiresAt * 1000)
        );
        return token;
      }

      // Activity-based update (triggered by useActivityBasedSession)
      if (trigger === "update") {
        console.log("JWT: Activity detected, updating session");
        token.lastActivity = now;

        // If token still has more than 30 minutes left, extend it
        if (token.expiresAt > now + 30 * 60) {
          console.log("JWT: Token still valid, extending by 2 hours from now");
          // Extend the token by another 2 hours from now
          token.expiresAt = now + 2 * 60 * 60;
          return token;
        }

        // If token is expiring soon, try to refresh the Firebase token
        try {
          const currentUser = firebaseAuth.currentUser;
          if (currentUser && currentUser.uid === token.uid) {
            const newIdToken = await currentUser.getIdToken(true);
            console.log("JWT: Firebase token refreshed and extended");
            return {
              ...token,
              idToken: newIdToken,
              expiresAt: now + 2 * 60 * 60,
              lastActivity: now,
            };
          }
        } catch (error) {
          console.error("JWT: Failed to refresh Firebase token:", error);
          return {};
        }
      }

      // Regular session check - if expired, force logout
      if (token.expiresAt <= now) {
        console.log("JWT: Token expired, forcing logout");
        return {};
      }

      return token;
    },

    async session({ session, token }) {
      if (token.idToken && token.expiresAt) {
        session.idToken = token.idToken;
        session.uid = token.uid;
        // Keep expires as Unix timestamp for consistency
        session.expires = token.expiresAt;
        session.lastActivity = token.lastActivity;

        console.log("Session callback: Setting expires to", session.expires);
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
    updateAge: 5 * 60, // 5 minutes
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default (req, res) => NextAuth(req, res, authOptions);
