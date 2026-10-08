import type { Metadata } from "next";
import "./styles.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Daybreak — weather, wherever you are",
  description: "A shared weather experience for web, iOS, and Android.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
