import { ReactNode } from "react";
import { TopBar, BottomNav } from "./Nav";

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <TopBar />
    <main className="flex-1 pb-24 md:pb-12">{children}</main>
    <BottomNav />
  </div>
);
