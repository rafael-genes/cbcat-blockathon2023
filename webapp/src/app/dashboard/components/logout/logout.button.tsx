// Logout button
"use client";

import { signOut } from "next-auth/react";
import styles from "./logout.module.css";

export default function LogoutButton() {
  return (
    <button
      className={styles.logoutButton}
      onClick={() => {
        signOut();
      }}
    >
      Logout
    </button>
  );
}
