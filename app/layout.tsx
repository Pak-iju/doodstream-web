import "./globals.css";

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { SITENAME } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme-provider";
import Popunder from "@/components/popunder";

const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: SITENAME,
    description: `${SITENAME} is a video sharing platform that allows users to upload, watch, and share videos.`,
    metadataBase: new URL("http://localhost:3000/"),
};

export const runtime = "edge";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={font.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    forcedTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    {/* Komponen Iklan Popunder */}
                    {/* 0.5 jam = 30 menit */}
                    <Popunder targetUrl="https://www.google.com/" cooldownHours={0.5} />
                    
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
