'use client'
import { createContext, useContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()

const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState('white');

  // Load theme from localStorage on first render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  // Apply theme to document body and save to localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.body;
      root.classList.remove('theme-black', 'theme-white', 'theme-red', 'theme-green', 'theme-blue', 'theme-yellow');
      root.classList.add(`theme-${theme}`);
      localStorage.setItem('theme', theme); // Save the current theme
    }
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider
