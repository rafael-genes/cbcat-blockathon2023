"use client";

import { useState } from "react";
import { createUser } from "../lib/actions";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [error, setError] = useState("");

  // Declare async function
  const formAction = async (formData: FormData) => {
    const result = await createUser(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setError("");
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      callbackUrl: "/dashboard",
    });
  };

  return (
    <form action={formAction} className={styles.formContainer}>
      <div>
        <h1 className={styles.pageTitle}>Join us!</h1>
        <p className={styles.registerSubtitle}>Create a new account</p>
        <div className={styles.inputContainer}>
          <input
            className={styles.inputField}
            type="text"
            name="email"
            placeholder="Email"
          />
          <input
            className={styles.inputField}
            type="password"
            name="password"
            placeholder="Password"
          />
        </div>
        {error && <p className={styles.errorMessage}>Error: {error}</p>}
        <input className={styles.buttonField} type="submit" value="REGISTER" />
        <hr className={styles.divider} />
        <div className={styles.loginPrompt}>
          Already have an account? &nbsp;
          <Link href="/login" className={styles.link}>
            Login
          </Link>
        </div>
      </div>
    </form>
  );
}
