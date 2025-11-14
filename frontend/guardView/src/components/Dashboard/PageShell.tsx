
import {  useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageShell({ title, subtitle, children }: PageShellProps) {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex">
      <Sidebar isOpen={openSidebar} />

      <main className="flex-1 md:ml-64">
        <Navbar toggle={() => setOpenSidebar((p) => !p)} />

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
