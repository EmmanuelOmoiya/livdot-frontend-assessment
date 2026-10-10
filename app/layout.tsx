import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local'

const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter_28pt-Medium_rg4qch.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter_28pt-Regular_exgste.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
})

const chillax = localFont({
  src: [
    {
      path: '../public/fonts/Chillax-Bold_tiahdf.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Chillax-Semibold_woooso.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-chillax',
})

export const metadata: Metadata = {
  title: "Livdot Frontend Assessment",
  description: "A Host Event Dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${chillax.variable} ${inter.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
