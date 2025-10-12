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
import { useModal } from "@/context/ModalContext";
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
  const { data: session } = useSession();

  useEffect(() => {
    setEmail(session?.user?.email ?? "");
  }, [session]);

  const handleLogoutAndRedirect = async () => {
    try {
      // Sign out from Firebase
      await firebaseSignOut(firebaseAuth);

      // Sign out from NextAuth and redirect to signin page
      await nextAuthSignOut({
        callbackUrl: "/api/auth/signin",
        redirect: true,
      });
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, redirect to signin page
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

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long.");
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

      // Update the session to reflect the change
      await fetch("/api/session", {
        method: "POST",
      });

      setSuccess(true);
      setMessage(
        "Password updated successfully! You will be asked to login in again."
      );

      // Wait a moment to show success message, then logout and redirect
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
        <h2 style={styles.title}>
          {firstLogin ? "Set Your Password" : "Reset Your Password"}
        </h2>
        {firstLogin && (
          <p style={styles.subtext}>
            This is your first time signing in. Please choose a secure password.
            You'll be asked to sign in again after updating your password.
          </p>
        )}
        {!firstLogin && (
          <p style={styles.subtext}>
            You'll be signed out and redirected to the login page after updating
            your password.
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
  title: {
    fontSize: "24px",
    marginBottom: "10px",
    color: "#000",
    textAlign: "center",
  },
  subtext: {
    fontSize: "14px",
    color: "#333",
    textAlign: "center",
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
