import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { Navbar } from "@/components/ui/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import Script from "next/script";
import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "TalentFlow - A Hiring Platform",
  description: "Streamline your hiring process with TalentFlow's comprehensive candidate management and assessment platform",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%236366f1' rx='6'/><text x='16' y='22' font-family='Arial,sans-serif' font-size='18' font-weight='bold' text-anchor='middle' fill='white'>TF</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <AppProviders>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
        </AppProviders>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}