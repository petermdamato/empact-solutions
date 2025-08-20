import { adminAuth } from "@/lib/firebaseAdmin"; // This should work in API routes

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    await adminAuth.revokeRefreshTokens(uid);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Token revocation error:", error);
    res.status(500).json({ error: "Failed to revoke tokens" });
  }
}
