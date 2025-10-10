import { CSVProvider } from "@/context/CSVContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { LinkOutProvider } from "@/context/LinkOutContext";
import { ModalProvider } from "@/context/ModalContext";
import { TagsProvider } from "@/context/TagsContext";
import { AuthListener } from "@/components/AuthListener/AuthListener";
import { WindowCloseHandler } from "@/components/WindowCloseHandler/WindowCloseHandler";
import { FirstLoginProvider } from "@/context/FirstLoginContext";
import SessionWrapper from "@/components/SessionWrapper/SessionWrapper";
import "./globals.css";

export const metadata = {
  title: "Empulse: Youth Detention Analytics",
  description: "Developed by Empact Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <CSVProvider>
            <AuthListener />
            <WindowCloseHandler />
            <LinkOutProvider>
              <TagsProvider>
                <FirstLoginProvider>
                  <SidebarProvider>
                    <ModalProvider>
                      {children}
                      <div id="modal-root"></div>
                    </ModalProvider>
                  </SidebarProvider>
                </FirstLoginProvider>
              </TagsProvider>
            </LinkOutProvider>
          </CSVProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
