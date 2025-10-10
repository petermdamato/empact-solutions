import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Not signed in" }), {
        status: 401,
      });
    }

    // Ensure session.user and other session properties are valid JSON
    const responseBody = {
      ...session,
      user: { ...session.user, forcePasswordChange: false },
    };

    return new Response(JSON.stringify(responseBody), { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
