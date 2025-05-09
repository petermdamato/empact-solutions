import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Dummy user for demonstration
const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123", // NEVER store passwords like this in production
  },
];

// Define the NextAuth configuration
const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = users.find(
          (u) =>
            u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          return { id: user.id, name: user.name, email: user.email };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  pages: {
    signIn: "/auth/signin", // Your custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure your secret is set
};

// Export the NextAuth API route handler
export default (req, res) => NextAuth(req, res, authOptions);
