// app/api/auth/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // console.log("Leaving");
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });

    // Clear the NextAuth session cookie
    response.cookies.set({
      name: "next-auth.session-token",
      value: "",
      expires: new Date(0), // Expire immediately
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    // Also clear the CSRF token cookie
    response.cookies.set({
      name: "next-auth.csrf-token",
      value: "",
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    // console.log("Hello? , res", response);
    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { success: false, error: "Signout failed" },
      { status: 500 }
    );
  }
}
