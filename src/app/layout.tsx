import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OrderDesk - B2B Supplier Portal SaaS",
  description: "Automate wholesale orders, inventory, and inter-city freight in Zimbabwe.",
  icons: {
    icon: "/orderdesk-icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col justify-between bg-slate-50/50 text-slate-900`}>
        <div className="flex-grow">{children}</div>

        {/* Universal Security & Copyright Footer */}
        <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 py-6 px-6 sm:px-10 text-xs font-sans print:hidden">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/orderdesk-icon.svg" 
                alt="OrderDesk Icon" 
                width={24} 
                height={24} 
                className="h-6 w-6 object-contain" 
              />
              <span className="font-extrabold text-white text-sm tracking-tight">OrderDesk B2B SaaS</span>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <p className="font-medium text-slate-300">
                © 2026 OrderDesk. Developed & Powered by <strong className="text-indigo-400 font-bold">Vortex Technologies</strong>.
              </p>
              <p className="text-[11px] text-slate-500">
                Encrypted via 256-Bit SSL • All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}