"use client";

import { useState, useEffect } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { firebaseAuth, firestore } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  updatePassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useFirstLogin } from "@/context/FirstLoginContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PasswordResetForm() {
  const searchParams = useSearchParams();
  const fromSidebar = searchParams.get("fromSidebar") === "true";
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { firstLogin } = useFirstLogin();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setEmail(session?.user?.email ?? "");
  }, [session]);

  const handleGoBack = () => {
    // Go back to the previous page in browser history
    router.back();
  };

  const handleLogoutAndRedirect = async () => {
    try {
      await firebaseSignOut(firebaseAuth);
      await nextAuthSignOut({
        callbackUrl: "/api/auth/signin",
        redirect: true,
      });
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = "/api/auth/signin";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);

      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        oldPassword
      );

      const user = userCredential.user;

      await updatePassword(user, newPassword);

      const userDocRef = doc(firestore, "users", user?.uid);
      await updateDoc(userDocRef, {
        forcePasswordChange: false,
      });

      await fetch("/api/session", {
        method: "POST",
      });

      setSuccess(true);
      setMessage(
        "Password updated successfully! You will be asked to login in again."
      );

      setTimeout(() => {
        handleLogoutAndRedirect();
      }, 1500);
    } catch (error) {
      console.error("Error updating password:", error.code);
      if (
        error.code === "auth/wrong-password" ||
        error.code.includes("credential")
      ) {
        setMessage("Old password is incorrect.");
      } else if (error.code === "auth/user-not-found") {
        setMessage("No user found with this email.");
      } else if (error.code === "auth/weak-password") {
        setMessage("New password is too weak.");
      } else if (error.code.includes("auth/missing-password")) {
        setMessage("New password is missing");
      } else {
        setMessage("❌ " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderButtonContent = () => {
    if (loading) {
      return (
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinner} />
          Updating...
        </div>
      );
    }

    if (success) {
      return (
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinner} />
          Redirecting...
        </div>
      );
    }

    return "Change Password";
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        {/* Header with conditional back button */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {firstLogin ? "Set Your Password" : "Reset Your Password"}
          </h2>
          {fromSidebar && !firstLogin && (
            <button
              onClick={handleGoBack}
              style={styles.backButton}
              disabled={loading || success}
            >
              ← Back to App
            </button>
          )}
        </div>

        {firstLogin && (
          <p style={styles.subtext}>
            This is your first time signing in. Please choose a secure password.
            You&apos;ll be asked to sign in again after updating your password.
          </p>
        )}
        {!firstLogin && (
          <p style={styles.subtext}>
            You&apos;ll be signed out and redirected to the login page after
            updating your password.
          </p>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formField}>
            <label style={styles.label}>Email</label>
            <div style={styles.emailDisplay}>{email}</div>
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={loading || success}
              style={{
                ...styles.input,
                opacity: loading || success ? 0.6 : 1,
              }}
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading || success}
              style={{
                ...styles.input,
                opacity: loading || success ? 0.6 : 1,
              }}
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || success}
              style={{
                ...styles.input,
                opacity: loading || success ? 0.6 : 1,
              }}
            />
          </div>

          {message && (
            <p
              style={{
                ...styles.message,
                color: success ? "#104488" : "#F93E33",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || success}
            style={{
              ...styles.button,
              backgroundColor: success ? "#104488" : "#104488",
              cursor: loading || success ? "not-allowed" : "pointer",
            }}
          >
            {renderButtonContent()}
          </button>
        </form>

        <div style={styles.footer}>
          © 2025 Empact Solutions. Empulse Data Studio™. All rights reserved.
        </div>
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
    </div>
  );
}

const styles = {
  pageContainer: {
    height: "100vh",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Avenir', 'Arial', sans-serif",
    padding: "20px",
  },
  formContainer: {
    width: "100%",
    maxWidth: "480px",
    padding: "30px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.02)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
    gap: "20px",
  },
  title: {
    fontSize: "24px",
    color: "#000",
    textAlign: "left",
    flex: 1,
    margin: 0,
  },
  backButton: {
    background: "transparent",
    border: "1px solid #104488",
    color: "#104488",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
    marginTop: "4px",
  },
  subtext: {
    fontSize: "14px",
    color: "#333",
    textAlign: "left",
    marginBottom: "20px",
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: 500,
    color: "#000",
    marginBottom: "4px",
    fontSize: "14px",
  },
  emailDisplay: {
    backgroundColor: "#f5f5f5",
    padding: "10px",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#000",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    color: "black",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    fontWeight: 500,
    borderRadius: "4px",
    color: "white",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  message: {
    marginTop: "8px",
    fontSize: "14px",
    textAlign: "center",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
    fontSize: "14px",
    color: "#000",
  },
};
