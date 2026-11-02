"use client";

import { createContext, useContext, useEffect } from "react";

type Theme = "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme: Theme = "light";

  useEffect(() => {
    // Cố định 1 giao diện sáng (Light Mode), loại bỏ class 'dark'
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    // Cố định 1 giao diện
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
