import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ChatRevive - WhatsApp Chat Archiver & Viewer",
  description: "Upload, explore, and revive WhatsApp exported chats with authentic WhatsApp Web interface, media previews, and deep search.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-[#111B21] flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
        </AuthProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

