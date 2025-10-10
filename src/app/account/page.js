"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { firebaseAuth } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useModal } from "@/context/ModalContext";
import { firestore } from "@/lib/firebaseClient";
import { useFirstLogin } from "@/context/FirstLoginContext";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { setShowAccount } = useModal();
  const { firstLogin, setFirstLogin } = useFirstLogin();
  const { data: session, update: updateSession } = useSession();

  useEffect(() => {
    setEmail(session?.user?.email);
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);

      // Re-authenticate with old password
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        oldPassword
      );

      const user = userCredential.user;

      // Update password
      await updatePassword(user, newPassword);

      // Update Firestore to mark forcePasswordChange -> false
      const userDocRef = doc(firestore, "users", user.uid);
      await updateDoc(userDocRef, {
        forcePasswordChange: false,
      });

      // Refresh Firebase token after password change
      const newIdToken = await user.getIdToken(true);

      // Update NextAuth session with the new token and forcePasswordChange status
      await updateSession({
        idToken: newIdToken,
        forcePasswordChange: false,
      });

      // Show success state
      setSuccess(true);
      setMessage("Password updated successfully.");

      // Wait 2 seconds before closing modal
      setTimeout(() => {
        setFirstLogin(false);
        setShowAccount(false);
      }, 2000);
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        setMessage("Old password is incorrect.");
      } else if (error.code === "auth/user-not-found") {
        setMessage("No user found with this email.");
      } else if (error.code === "auth/weak-password") {
        setMessage(
          "New password is too weak. Please use at least 6 characters."
        );
      } else if (error.code.includes("auth/missing-password")) {
        setMessage("Please enter a new password.");
      } else if (error.code === "auth/requires-recent-login") {
        setMessage("Security session expired. Please sign in again and try.");
      } else if (error.code === "auth/network-request-failed") {
        setMessage(
          "Network error. Please check your connection and try again."
        );
      } else {
        setMessage("❌ " + (error.message || "An unexpected error occurred."));
      }
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component remains the same
  const renderButtonContent = () => {
    if (success) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            style={{ width: "16px", height: "16px", color: "green" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Success!
        </div>
      );
    }

    if (loading) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid transparent",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          Updating...
        </div>
      );
    }

    return "Change Password";
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ margin: 0 }}>Reset Password</h2>
        {firstLogin && (
          <p
            style={{
              margin: "4px 0 12px 0",
              fontSize: "14px",
              color: "#555",
            }}
          >
            This is your first time signing in. For security reasons please
            enter a password of your own choosing.
          </p>
        )}

        <div>
          <span
            style={{
              fontWeight: 700,
              background: "white",
              padding: "8px 0",
              borderRadius: "4px",
            }}
          >
            Email:
          </span>
          <span
            style={{
              background: "white",
              padding: "8px 4px",
              borderRadius: "4px",
            }}
          >
            {email}
          </span>
        </div>

        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          disabled={loading || success}
          style={{
            color: "#333a43",
            background: "white",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            opacity: loading || success ? 0.6 : 1,
          }}
        />

        <input
          type="password"
          placeholder="New Password (min. 6 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading || success}
          style={{
            color: "#333a43",
            background: "white",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            opacity: loading || success ? 0.6 : 1,
          }}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading || success}
          style={{
            color: "#333a43",
            background: "white",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            opacity: loading || success ? 0.6 : 1,
          }}
        />

        {message && (
          <p
            style={{
              marginTop: "8px",
              color: message.includes("success") || success ? "green" : "red",
              fontSize: "14px",
              fontWeight: success ? "600" : "400",
            }}
          >
            {message}
          </p>
        )}
      </form>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "12px",
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={loading || success}
          style={{
            padding: "0.4rem 0.6rem",
            backgroundColor: success ? "#4CAF50" : "#333a43",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading || success ? "not-allowed" : "pointer",
            fontSize: "14px",
            right: "0 !important",
            minWidth: "140px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading && !success) {
              e.target.style.backgroundColor = "#1a1f24";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !success) {
              e.target.style.backgroundColor = "#333a43";
            }
          }}
        >
          {renderButtonContent()}
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
