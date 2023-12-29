"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const [error, setError] = useState("");

  // Declare async function
  const formAction = async (formData: FormData) => {
    setError("");
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      // Show error message
      setError(result.error);
      return;
    }

    redirect("/dashboard");
  };

  return (
    <form action={formAction} className={styles.formContainer}>
      <div>
        <h1 className={styles.loginTitle}>CBCAT - BLOCKATHON 2023!</h1>
        <p className={styles.loginSubtitle}>Sign in to continue</p>
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
        <input className={styles.buttonField} type="submit" value="LOG IN" />
        <hr className={styles.divider} />
        <div className={styles.registrationPrompt}>
          Don't have an account?&nbsp;
          <Link href="/register" className={styles.link}>
            Register
          </Link>
        </div>
      </div>
    </form>
  );
}
