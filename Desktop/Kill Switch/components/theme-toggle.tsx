"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("kill-switch-theme");
    const initialTheme =
      savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";

    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  function updateTheme(nextTheme: "light" | "dark") {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("kill-switch-theme", nextTheme);
  }

  return (
    <div className="theme-toggle">
      <button
        className={theme === "light" ? "theme-active" : ""}
        onClick={() => updateTheme("light")}
        type="button"
      >
        Light
      </button>
      <button
        className={theme === "dark" ? "theme-active" : ""}
        onClick={() => updateTheme("dark")}
        type="button"
      >
        Dark
      </button>
    </div>
  );
}
