import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SoundWaveCursor } from "../effects/SoundWaveCursor";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SoundWaveCursor />
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
