import { SchedulerProvider } from "@/components/SchedulerProvider";
import { ToastProvider } from "@/components/Toast";
import { ShopHeader } from "@/components/layout/ShopHeader";
import { ShopProvider } from "@/contexts/ShopContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CafeLink - Coffee Shop App",
  description: "Order coffee and manage your coffee shop in Atyrau, Kazakhstan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CafeLink" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-screen`}
      >
        <ToastProvider>
          <ShopProvider>
            <SchedulerProvider />
            <ShopHeader />
            {children}
          </ShopProvider>
        </ToastProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    }, function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
