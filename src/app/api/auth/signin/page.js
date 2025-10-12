"use client";

import { signIn, getSession } from "next-auth/react";
import React, { useState } from "react";
import LockOutline from "@mui/icons-material/LockOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log("SignIn result:", result);

      // Check the signIn result first - this tells us if credentials were wrong
      if (result?.error) {
        setError("Wrong email/password combination");
        setLoading(false);
        return;
      }

      // If signIn was successful, then check the session
      const session = await getSession();
      console.log("Session after signIn:", session);

      if (session?.uid) {
        if (session.forcePasswordChange) {
          window.location.href = "/account";
        } else {
          // Successful login - redirect to overview
          window.location.href = "/detention-overview";
        }
      } else {
        // This should rarely happen if signIn was successful, but just in case
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
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
          Signing In...
        </div>
      );
    }
    return "Sign In";
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.container}>
        {/* Title content */}
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
          <form onSubmit={handleSubmit}>
            <div style={styles.formField}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "black";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "black";
                }}
                required
                disabled={loading}
                style={{
                  ...styles.input,
                  opacity: loading ? 0.6 : 1,
                }}
              />
            </div>
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
                      style={{
                        fontSize: 20,
                        color: "#133A6F",
                        opacity: loading ? 0.6 : 1,
                      }}
                    />
                  ) : (
                    <LockOutline
                      style={{
                        fontSize: 20,
                        color: "#133A6F",
                        opacity: loading ? 0.6 : 1,
                      }}
                    />
                  )}
                </button>
              </div>
            </div>
            {error && <p style={styles.errorMessage}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.loginButton,
                backgroundColor: loading ? "#666" : "#133A6F",
                color: "white",
                marginTop: "10px",
                height: "40px",
                padding: "6px 12px",
                fontSize: "16px",
                borderRadius: "4px",
                width: "100%",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {renderButtonContent()}
            </button>
          </form>
          <div style={styles.copyright}>
            © 2025 Empact Solutions. Empulse Data Studio™. All rights reserved.
          </div>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        input::selection {
          background: #133a6f;
          color: white;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: black !important;
          transition: background-color 5000s ease-in-out 0s;
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
};
