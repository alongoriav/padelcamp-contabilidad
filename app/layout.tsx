import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Padel Camp - Sistema de Contabilidad",
  description: "Sistema de contabilidad y gestión financiera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
