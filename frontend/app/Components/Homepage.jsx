// components/HomePage.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl"
      >
        <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to ChatYou</h1>
        <p className="text-lg text-gray-600 mb-6">
          Connect with friends, join conversations, and explore new communities. Get started now!
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/Pages/Login">
            <button className="px-6 py-2 text-base rounded-lg bg-white text-black">
              Log In
            </button>
          </Link>
          <Link href="/Pages/Register">
            <button className="px-6 py-2 text-base rounded-lg bg-white text-black">
              Sign Up
            </button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
