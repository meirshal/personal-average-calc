import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מחשבון ממוצע בגרות",
  description: "מחשבון ממוצע בגרות משוקלל",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
