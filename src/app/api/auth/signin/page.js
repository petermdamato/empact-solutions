"use client";

import { signIn, signOut } from "next-auth/react";
import React, { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.status !== 200) {
      setError("Invalid credentials.");
    } else {
      window.location.href = "/overview"; // Redirect after successful login
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
              <div style={styles.logoEmPrefix}>a tool from </div>
              <div style={styles.logoContainer}>
                <span style={styles.logoEm}>em</span>
                <span style={styles.logoPact}>pact</span>
              </div>
              <div style={styles.solutions}>SOLUTIONS</div>
            </div>
          </div>
        </div>
      </div>
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
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            style={{
              ...styles.loginButton,
              backgroundColor: "#333a43",
              color: "white",
              padding: "6px 12px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageContent: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingBottom: "20px",
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
    width: "100vw",
    alignItems: "center",
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "space-around",
  },
  container: {
    backgroundColor: "#fff",
    flexGrow: "1",
    width: "100vw",
    padding: "40px",
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
    height: "300px",
    opacity: 0.3,
    zIndex: 0,
  },
  backgroundGraphic: {
    width: "400px",
    height: "auto",
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
    marginBottom: "20px",
  },

  backgroundGraphic: {
    width: "400px",
    height: "auto",
    opacity: 1,
    zIndex: 0,
  },

  logoOverlay: {
    position: "absolute",
    bottom: "-40px", // controls overlap — adjust as needed
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    zIndex: 1,
  },

  logoEmPrefix: {
    color: "#222222",
    fontSize: "20px",
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
    width: "300px", // consistent width for all fields
  },

  label: {
    marginBottom: "6px",
    color: "black",
    fontWeight: "500",
    fontSize: "14px",
  },

  input: {
    backgroundColor: "white",
    border: "1px solid black",
    color: "black",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "14px",
  },
  solutions: {
    letterSpacing: "2px",
    fontSize: "14px",
    color: "#444",
    fontWeight: 400,
  },
};
