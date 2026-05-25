import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
        active ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <Link to="/" className="text-lg font-semibold tracking-tight text-white">
          Manifest
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/items/new"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            + Add
          </Link>
          <button
            onClick={() => void logout()}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-4">{children}</main>

      {/* Bottom nav for mobile */}
      <nav className="sticky bottom-0 flex justify-around border-t border-slate-800 bg-slate-900 sm:hidden">
        <NavLink to="/">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Items
        </NavLink>
        <NavLink to="/items/new">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </NavLink>
        <NavLink to="/scan">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m-7-8H4m16 0h1M6.34 6.34l-.7-.7m12.72 12.72-.7-.7M6.34 17.66l-.7.7m12.72-12.72-.7.7" />
          </svg>
          Scan
        </NavLink>
      </nav>
    </div>
  );
}
