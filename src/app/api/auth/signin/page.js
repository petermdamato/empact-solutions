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
      window.location.href = "/upload"; // Redirect after successful login
    }
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.container}>
        {/* Background graphic placeholder */}
        <div style={styles.backgroundGraphic}></div>

        {/* Title content */}
        <div style={styles.textContainer}>
          <div style={styles.analyticsTitle}>
            <div style={styles.titleLine1}>Annual Youth Secure</div>
            <div style={styles.titleLine2}>Detention Analytics</div>
          </div>

          <div style={styles.logoContainer}>
            <span style={styles.logoEm}>em</span>
            <span style={styles.logoPact}>pact</span>
          </div>
          <div style={styles.solutions}>SOLUTIONS</div>
        </div>
      </div>
      <div style={styles.loginElement}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              style={{
                color: "black",
              }}
              htmlFor="email"
              className="block"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded"
              required
              style={{
                backgroundColor: "white",
                border: "1px solid black",
                color: "black",
                marginLeft: "4px",
              }}
            />
          </div>
          <div className="mb-4">
            <label
              style={{
                color: "black",
              }}
              htmlFor="password"
              className="block"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded"
              required
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid black",
                marginLeft: "4px",
              }}
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    backgroundColor: "#f5f5f5",
    borderRadius: "50%",
    opacity: 0.3,
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
  solutions: {
    letterSpacing: "2px",
    fontSize: "14px",
    color: "#444",
    fontWeight: 400,
  },
};
