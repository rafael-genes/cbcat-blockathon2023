// Logout button
"use client";

import { useState } from "react";
import styles from "./action.module.css";
import stylesParent from "../../page.module.css";
import { Result } from "@/app/types";
import { set } from "zod";
import { revalidatePath } from "next/cache";

export default function Action({
  text,
  action,
  callback,
}: {
  text: string;
  action: "earn" | "spend";
  callback: (input: number) => Promise<Result>;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOnClick = async () => {
    if (value === "") {
      return;
    }

    // Just in case
    const parsedValue = parseInt(value);
    if (isNaN(parsedValue)) {
      return;
    }
    if (parsedValue < 0) {
      return;
    }

    // We could move all this logic to another place
    setLoading(true);
    setError("");
    const result = await callback(parsedValue);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setValue("");
    setError("");
    setLoading(false);
    window.location.reload();
  };

  return (
    <>
      {/* error should be below input */}
      {error && <span className={styles.error}>{error}</span>}
      <input
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          const parsedValue = parseInt(value);

          if (isNaN(parsedValue)) {
            setValue("");
            return;
          }

          if (parsedValue < 0) {
            return;
          }

          setValue(parsedValue.toString());
        }}
        className={stylesParent.inputField}
        type="number"
        name={action === "earn" ? "earnValue" : "spendValue"}
        placeholder="Value"
        disabled={loading}
      />

      <button
        onClick={handleOnClick}
        className={`${styles.buttonField}`}
        disabled={loading}
      >
        {loading ? "Loading..." : text}
      </button>
    </>
  );
}
