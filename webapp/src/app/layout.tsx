import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/footer/footer";
import type { Metadata } from 'next'
import Logo from '../../public/logo.png';
import Image from 'next/image';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'BlockAthon 2023',
  description: 'e-Commerce mockup',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
        style={{
          letterSpacing: "1px",
          backgroundColor: "#efefef",
          margin: "0",
        }}
      >
        <Image className='logo' key='Logo' src={Logo} alt='Logo' height='300'/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
