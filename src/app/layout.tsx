import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { QueryProvider } from "@/components/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sequoia",
  description: "Sequoia is a life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Nav />
        </QueryProvider>
      </body>
    </html>
  );
}

// Alternative for system preference:
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//         <script dangerouslySetInnerHTML={{
//           __html: `
//             if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
//               document.documentElement.classList.add('dark')
//             } else {
//               document.documentElement.classList.remove('dark')
//             }
//           `
//         }} />
//       </head>
//       <body className={`${inter.variable} antialiased`}>
//         <QueryProvider>
//           {children}
//           <Nav />
//         </QueryProvider>
//       </body>
//     </html>
//   );
// }
