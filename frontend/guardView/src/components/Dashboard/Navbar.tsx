import { Menu } from "lucide-react";

interface NavProps {
  toggle: () => void;
}

export default function Navbar({ toggle }: NavProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-5 md:hidden">
      <button
        onClick={toggle}
        className="rounded-lg p-2 hover:bg-accent/30 transition"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="w-6"></div>
    </header>
  );
}
