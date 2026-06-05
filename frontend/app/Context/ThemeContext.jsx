'use client'
import { createContext, useContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()

const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState('white');
  const [wallpaper, setWallpaper] = useState({
    type: 'none',
    value: '',
    opacity: 0.15
  });

  // Load theme and wallpaper from localStorage on first render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
      const savedWallpaper = localStorage.getItem('chat-wallpaper');
      if (savedWallpaper) {
        try {
          setWallpaper(JSON.parse(savedWallpaper));
        } catch (e) {
          console.error("Error parsing chat-wallpaper from localStorage:", e);
        }
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

  // Save wallpaper to localStorage when wallpaper state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-wallpaper', JSON.stringify(wallpaper));
    }
  }, [wallpaper]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, wallpaper, setWallpaper }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider
