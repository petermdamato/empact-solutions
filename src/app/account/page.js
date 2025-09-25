import { useSession } from "next-auth/react";
import { firebaseAuth } from "@/lib/firebaseClient";
import { updatePassword } from "firebase/auth";

async function changePassword() {
  const user = firebaseAuth.currentUser;
  console.log(useSession);
  // if (user) {
  //   try {
  //     await updatePassword(user, newPassword);
  //     console.log("Password updated!");
  //   } catch (error) {
  //     console.error("Error updating password:", error);
  //     // If error is "auth/requires-recent-login", user needs to re-login
  //   }
  // } else {
  //   console.error("No user logged in");
  // }
}

export default function Overview() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Not signed in</p>;

  return (
    <div>
      <p>Signed in as {session.user?.email}</p>
      <p>UID: {session.uid}</p>
      <button
        onClick={changePassword}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#333a43",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "0.9rem",
        }}
      >
        Function
      </button>
    </div>
  );
}
