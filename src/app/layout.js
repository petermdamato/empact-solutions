import { Geist, Geist_Mono } from "next/font/google";
import { CSVProvider } from "@/context/CSVContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { LinkOutProvider } from "@/context/LinkOutContext";
import { ModalProvider } from "@/context/ModalContext";
import { TagsProvider } from "@/context/TagsContext";

import SessionWrapper from "@/components/SessionWrapper/SessionWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Youth Detention Analysis",
  description: "Developed by Empact Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SessionWrapper>
          <CSVProvider>
            <LinkOutProvider>
              <TagsProvider>
                <SidebarProvider>
                  <ModalProvider>
                    {children}
                    <div id="modal-root"></div>
                  </ModalProvider>
                </SidebarProvider>
              </TagsProvider>
            </LinkOutProvider>
          </CSVProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
