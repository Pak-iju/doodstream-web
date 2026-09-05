import "./globals.css";

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { SITENAME } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme-provider";

const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: SITENAME,
    description: `${SITENAME} is a video sharing platform that allows users to upload, watch, and share videos.`,
    metadataBase: new URL("http://localhost:3000/"),
    verification: {
        other: {
            "profiton-domain-verification": "7d8d2fb14a768cc38ade307cf5becff3640197c5af88c757c705c06d3bce9be1",
        },
    },
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
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
