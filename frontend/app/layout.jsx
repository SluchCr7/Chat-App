import "./globals.css";
import NavBar from "./Components/NavBar";
import LayoutComponent from "./Components/LayoutComponent";
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"]
  , weight: ["100", "200", "300", "400", "500", "600"]
  , style: ["normal", "italic"]
})

export const metadata = {
  title: "ChatYou",
  description: "ChatYou a chat app where you can chat with your friends and explore new communities to join", 
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${jetBrainsMono.className}`}
      >
        <LayoutComponent>
          {children}
        </LayoutComponent>
      </body>
    </html>
  );
}
