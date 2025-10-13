import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Pages Router file

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return new Response(JSON.stringify({ error: "Not signed in" }), {
      status: 401,
    });
  return new Response(
    JSON.stringify({
      ...session,
      user: { ...session.user, forcePasswordChange: false },
    }),
    { status: 200 }
  );
}
