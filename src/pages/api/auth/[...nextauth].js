import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "@/lib/firebaseClient";
import { firebaseAuth } from "@/lib/firebaseClient";
import admin from "firebase-admin";
import { getAuth, signOut } from "firebase/auth";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

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
          // Force sign out before login attempts
          const auth = getAuth();
          await signOut(auth);

          const userCredential = await signInWithEmailAndPassword(
            firebaseAuth,
            email,
            password
          );
          const user = userCredential.user;

          // Get Firebase ID token
          const idToken = await user.getIdToken();

          const userDoc = await db.collection("users").doc(user.uid).get();
          const userData = userDoc.exists ? userDoc.data() : {};
          const forcePasswordChange = Boolean(userData?.forcePasswordChange);

          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || "Firebase User",
            idToken, // Include the Firebase token
            forcePasswordChange,
          };
        } catch (err) {
          console.error("Firebase auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Added session parameter here
      const now = Math.floor(Date.now() / 1000);

      // Initial sign in
      if (user) {
        token.idToken = user.idToken;
        token.uid = user.id;
        token.expiresAt = now + 2 * 60 * 60; // 2 hours
        token.lastActivity = now;
        token.forcePasswordChange = user.forcePasswordChange;
        console.log(
          "JWT: New session created, expires at",
          new Date(token.expiresAt * 1000)
        );
        return token;
      }

      // Handle session updates (like password changes)
      if (trigger === "update" && session) {
        console.log("JWT: Updating token after session update", session);
        return {
          ...token,
          ...session, // Merge all session updates
          expiresAt: now + 2 * 60 * 60, // Reset expiration
          lastActivity: now,
        };
      }

      // Activity-based update (triggered by useActivityBasedSession)
      if (trigger === "update") {
        console.log("JWT: Activity detected, updating session");
        token.lastActivity = now;

        // If token still has more than 30 minutes left, extend it
        if (token.expiresAt > now + 30 * 60) {
          console.log("JWT: Token still valid, extending by 2 hours from now");
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
        session.forcePasswordChange = token.forcePasswordChange;

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

export default NextAuth(authOptions);
