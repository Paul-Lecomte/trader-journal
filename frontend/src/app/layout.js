"use client";
import "./globals.css";

export const metadata = {
    title: "Trade Journal",
    description: "Analyze your trading performance with interactive charts and comments.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className="antialiased bg-gray-100 text-gray-900">
        {children}
        </body>
        </html>
    );
}