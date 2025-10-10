export async function POST() {
  return Response.json({
    status: "ok",
    authenticated: true,
    user: { id: "1", email: "user@example.com" },
    forcePasswordChange: false,
  });
}
