import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartNotificationWrapper from "../components/CartNotificationWrapper";
import { CartProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PixelRent",
  description: "Video game rentals made easy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div className="relative flex min-h-screen w-full flex-col bg-[#080b16] text-white overflow-x-hidden">
            <Header />
            <CartNotificationWrapper />
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}