'use client'
import React, { useContext } from 'react'
import { ThemeContext } from '@/app/Context/ThemeContext'

const ThemeSettingsPage = () => {
  const { theme, setTheme } = useContext(ThemeContext)

  const themes = [
    { name: 'white', bg: '#f3f4f6', text: '#1f2937' },
    { name: 'black', bg: '#0f0f0f', text: '#f3f4f6' },
    { name: 'red', bg: '#0f0f0f', text: '#ff4d4d' },
    { name: 'green', bg: '#0f0f0f', text: '#22c55e' },
    { name: 'blue', bg: '#0f0f0f', text: '#3b82f6' },
    { name: 'yellow', bg: '#0f0f0f', text: '#fbbf24' },
  ]

  return (
    <div className="w-full min-h-screen py-12 px-4 bg-bg text-text">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text">Settings</h1>
          <p className="text-gray-400 text-sm">Customize how your app looks and feels.</p>
        </div>

        <div className="bg-[#1a1a1a]/50 border border-gray-700 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-primary">Choose Theme</h2>
            <p className="text-sm text-gray-400">Your current theme is: {theme}</p>
          </div>
          <span className="font-medium text-white uppercase">{theme}</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-4">
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                style={{ backgroundColor: t.bg, color: t.text }}
                className={`rounded-lg p-4 uppercase font-semibold text-sm text-center border transition-all duration-300 `}
              >
                {t.name} 
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeSettingsPage
