"use client";

import { signIn, getSession } from "next-auth/react";
import React, { useState } from "react";
import LockOutline from "@mui/icons-material/LockOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { firebaseAuth } from "@/lib/firebaseClient";
import { sendPasswordResetEmail } from "firebase/auth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signin"); // "signin" | "reset"

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(firebaseAuth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with that email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send password reset email. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Wrong email/password combination");
        setLoading(false);
        return;
      }

      const session = await getSession();

      if (session?.uid) {
        if (session.forcePasswordChange) {
          window.location.href = "/account";
        } else {
          window.location.href = "/detention-overview";
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderButtonContent = () => {
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: "center",
          }}
        >
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
          {mode === "signin" ? "Signing In..." : "Sending..."}
        </div>
      );
    }
    return mode === "signin" ? "Sign In" : "Send Reset Link";
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.container}>
        <div style={styles.textContainer}>
          <div style={styles.graphicWrapper}>
            <img
              style={styles.backgroundGraphic}
              src="/logo_frontpage.png"
              alt="Empact Solutions Logo"
            />
            <div style={styles.logoOverlay}>
              <div style={styles.logoDek}>A tool from Empact Solutions</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.loginContainer}>
        <div style={styles.loginElement}>
          <form
            onSubmit={mode === "signin" ? handleSignIn : handleResetPassword}
          >
            {/* Email Field */}
            <div style={styles.formField}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{ ...styles.input, opacity: loading ? 0.6 : 1 }}
              />
            </div>

            {/* Password Field (only for sign-in mode) */}
            {mode === "signin" && (
              <div style={styles.formField}>
                <label htmlFor="password" style={styles.label}>
                  Password
                </label>
                <div style={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    style={{
                      ...styles.inputWithIcon,
                      opacity: loading ? 0.6 : 1,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.iconButton}
                    aria-label="Toggle password visibility"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <LockOpenIcon
                        style={{ fontSize: 20, color: "#133A6F" }}
                      />
                    ) : (
                      <LockOutline style={{ fontSize: 20, color: "#133A6F" }} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error and Success Messages */}
            {error && <p style={styles.errorMessage}>{error}</p>}
            {message && <p style={styles.successMessage}>{message}</p>}

            <div style={styles.buttonRow}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.loginButton,
                  backgroundColor: loading ? "#666" : "#133A6F",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {renderButtonContent()}
              </button>

              {mode === "signin" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setError(null);
                    setMessage(null);
                    setPassword("");
                  }}
                  style={styles.forgotPasswordButton}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setMessage(null);
                  }}
                  style={styles.forgotPasswordButton}
                  disabled={loading}
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          </form>

          <div style={styles.copyright}>
            © 2025 Empact Solutions. Empulse Data Studio™. All rights reserved.
          </div>
        </div>
      </div>

      <style jsx global>{`
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
  loginContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  pageContent: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingBottom: "20px",
  },
  copyright: {
    marginTop: "20px",
    textAlign: "center",
    width: "100%",
    overflow: "visible",
    color: "#000",
    fontSize: "16px",
  },
  loginButton: {
    backgroundColor: "#333a43",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    textAlign: "center",
    cursor: "pointer",
    display: "inline-block",
  },
  loginElement: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "650px",
    margin: "0 auto",
    padding: "20px",
  },
  container: {
    backgroundColor: "#fff",
    width: "100vw",
    boxSizing: "border-box",
    fontFamily: "'Avenir', 'Arial', sans-serif",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  backgroundGraphic: {
    width: "440px",
    height: "auto",
    opacity: 1,
    zIndex: 0,
  },
  textContainer: {
    zIndex: 1,
    textAlign: "center",
    maxWidth: "700px",
    paddingTop: "40px",
  },
  graphicWrapper: {
    position: "relative",
    display: "inline-block",
    textAlign: "center",
  },

  logoHeadline: {
    color: "#133A6F",
    fontSize: "38px",
    letterSpacing: "-0.02em",
    fontWeight: "bold",
    textAlign: "center",
    zIndex: 1,
  },
  logoDek: {
    color: "#133A6F",
    fontSize: "20px",
    textAlign: "center",
    fontWeight: 300,
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
    width: "442px",
  },
  label: {
    marginBottom: "6px",
    color: "#133A6F",
    fontWeight: "400",
    fontSize: "16px",
  },
  errorMessage: {
    color: "#6F1B13",
    marginTop: "8px",
    marginBottom: "8px",
    fontSize: "14px",
    textAlign: "center",
  },
  successMessage: {
    color: "#133a6f",
    marginTop: "8px",
    marginBottom: "8px",
    fontSize: "14px",
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    color: "black",
    border: "1px solid grey",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "14px",
    outline: "none",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  inputWithIcon: {
    backgroundColor: "white",
    color: "black",
    border: "1px solid grey",
    borderRadius: "4px",
    padding: "8px 36px 8px 8px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  },
  iconButton: {
    position: "absolute",
    right: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  forgotPasswordContainer: {
    textAlign: "right",
    marginBottom: "10px",
    width: "100%",
  },
  forgotPasswordButton: {
    background: "none",
    border: "none",
    color: "#133A6F",
    textDecoration: "underline",
    fontSize: "14px",
    cursor: "pointer",
    padding: 0,
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: "16px",
  },
};
