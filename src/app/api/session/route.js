import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 }); // Use NextResponse.json for proper response
  }

  // Return the session data with user modifications
  return NextResponse.json({
    ...session,
    user: { ...session.user, forcePasswordChange: false },
  });
}
