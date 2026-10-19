import "./globals.css";
import LayoutComponent from "./Components/LayoutComponent";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "VYRO — A new space for conversations",
  description: "VYRO is a modern, expressive messaging workspace engineered for real-time team communication, encrypted channels, audio notes, and communities.",
  keywords: ["chat", "messaging", "real-time", "conversations", "channels", "community", "vyro"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/vyro-icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body className={`${inter.className} font-sans antialiased selection:bg-primary/20 selection:text-primary`}>
        <LayoutComponent>
          {children}
        </LayoutComponent>
      </body>
    </html>
  );
}
