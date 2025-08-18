"use client";

import { signIn, signOut } from "next-auth/react";
import React, { useState } from "react";
import LockOutline from "@mui/icons-material/LockOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.status !== 200) {
      setError("Wrong email/password combination");
    } else {
      window.location.href = "/detention-overview"; // Redirect after successful login
    }
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.container}>
        {/* Background graphic placeholder */}

        {/* Title content */}
        <div style={styles.textContainer}>
          {/* <div style={styles.analyticsTitle}>
            <div style={styles.titleLine1}>Annual Youth Secure</div>
            <div style={styles.titleLine2}>Detention Analytics</div>
          </div> */}

          <div style={styles.graphicWrapper}>
            <img
              style={styles.backgroundGraphic}
              src="/background-login.png"
              alt="Empact Solutions Logo"
            />
            <div style={styles.logoOverlay}>
              <div style={styles.logoHeadline}>Youth Detention Analytics</div>
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
                style={styles.input}
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
                  style={styles.inputWithIcon}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.iconButton}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <LockOpenIcon style={{ fontSize: 20, color: "#133A6F" }} />
                  ) : (
                    <LockOutline style={{ fontSize: 20, color: "#133A6F" }} />
                  )}
                </button>
              </div>
            </div>
            {error && <p style={styles.errorMessage}>{error}</p>}
            <button
              type="submit"
              style={{
                ...styles.loginButton,
                backgroundColor: "#133A6F",
                color: "white",
                marginTop: "10px",
                height: "32px",
                padding: "6px 12px",
                fontSize: "16px",
                borderRadius: "4px",
                width: "100%",
              }}
            >
              Sign In
            </button>
          </form>
          <div style={styles.copyright}>
            © 2025 Empact Solutions. Empulse Data Studio™. All rights reserved.
          </div>
        </div>
      </div>
      <style jsx global>{`
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
    display: "inline-block", // helps enforce layout
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
    position: "absolute",
    top: "20%",
    left: "10%",
    width: "300px",
    opacity: 0.3,
    zIndex: 0,
  },
  backgroundGraphic: {
    width: "400px",
    height: "300px",
    opacity: 1,
    zIndex: 0,
  },
  textContainer: {
    zIndex: 1,
    textAlign: "center",
    maxWidth: "700px",
  },
  analyticsTitle: {
    color: "#e54e26",
    fontSize: "22px",
    fontWeight: 500,
    marginBottom: "40px",
    textAlign: "right",
  },
  titleLine1: {
    fontWeight: 400,
  },
  titleLine2: {
    fontWeight: 600,
  },
  subtitle: {
    color: "#222",
    fontSize: "12px",
    marginTop: "6px",
    lineHeight: "1.4",
  },
  graphicWrapper: {
    position: "relative",
    display: "inline-block",
    textAlign: "center",
  },

  backgroundGraphic: {
    width: "400px",
    height: "auto",
    opacity: 1,
    zIndex: 0,
  },

  logoOverlay: {
    position: "absolute",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    zIndex: 1,
    width: "480px",
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

  logoContainer: {
    fontSize: "60px",
    fontWeight: 300,
    marginBottom: "8px",
  },

  logoEm: {
    color: "#e54e26",
    fontWeight: "600",
  },

  logoPact: {
    color: "#222",
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
    position: "absolute",
    marginTop: "-12px",
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

  solutions: {
    letterSpacing: "2px",
    fontSize: "14px",
    color: "#444",
    fontWeight: 400,
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
