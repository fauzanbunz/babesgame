import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// IMPORT THIRDWEB PROVIDER DI SINI
import { ThirdwebProvider } from "thirdweb/react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Babes Island",
  description: "Web3 Game for Babes in the Hood NFT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {/* BUNGKUS CHILDREN DENGAN PROVIDER */}
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}