import type { Metadata } from "next";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const metadata: Metadata = {
  title: "Compute Veil",
  description: "Encrypted compute marketplace powered by FHEVM",
  icons: {
    icon: "/compute-veil-logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-base-100 text-base-content antialiased">
        <Providers>
          <main className="flex flex-col min-h-screen">
            <nav className="navbar bg-base-100 border-b border-base-300 px-6">
              <div className="flex-1 flex items-center gap-3">
                <Image
                  src="/compute-veil-logo.svg"
                  alt="Compute Veil Logo"
                  width={40}
                  height={40}
                  className="rounded-xl glow-primary"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-semibold tracking-tight">
                    Compute Veil
                  </span>
                  <span className="text-xs text-base-content/60">
                    Compute without exposing your data
                  </span>
                </div>
              </div>
              <div className="flex-none">
                <ConnectButton />
              </div>
            </nav>
            <div className="flex-1">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
