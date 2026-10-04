"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  CircleHelp,
  LayoutGrid,
  MapPinned,
  Menu,
  Package,
  ClipboardCheck,
  PanelLeft,
  PanelRight,
  Search,
  Settings2,
  ShoppingCart,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

const primaryNavigation: ReadonlyArray<{
  href: string;
  icon: LucideIcon;
  label: string;
}> = [
  { href: "/admin", icon: LayoutGrid, label: "Overview" },
  { href: "/admin/territories", icon: MapPinned, label: "Territories" },
  { href: "/admin/distributors", icon: Truck, label: "Distributors" },
  { href: "/admin/catalogue", icon: Package, label: "Catalogue & stock" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/restock", icon: ClipboardCheck, label: "Restock approvals" },
];

const insightNavigation: ReadonlyArray<{
  href: string;
  icon: LucideIcon;
  label: string;
}> = [
  { href: "/admin/reports", icon: BarChart3, label: "Reports" },
  { href: "/admin/settings", icon: Settings2, label: "Settings" },
];

function applySidebarWidth(collapsed: boolean) {
  document.documentElement.style.setProperty(
    "--admin-sidebar-width",
    collapsed ? "4.5rem" : "15.625rem",
  );
}

type SidebarContentProps = {
  collapsed: boolean;
  email: string;
  name: string;
  onNavigate?: () => void;
  onToggle?: () => void;
};

function NavList({
  collapsed,
  items,
  onNavigate,
}: Pick<SidebarContentProps, "collapsed" | "onNavigate"> & {
  items: typeof primaryNavigation;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {items.map(({ href, icon: Icon, label }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            aria-label={label}
            className={`group relative flex h-8 items-center rounded-lg text-[13px] transition-colors ${collapsed ? "justify-center" : "gap-2.5 px-3"} ${active ? "border border-[#e1e3e1] bg-white font-medium text-[#253038] shadow-[0_1px_2px_rgba(17,20,26,0.04)]" : "text-[#58616e] hover:bg-white/70 hover:text-[#202a34]"}`}
            href={href}
            key={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.7} />
            {!collapsed ? <span className="truncate">{label}</span> : null}
            {collapsed ? (
              <span className="pointer-events-none absolute left-[calc(100%+0.65rem)] z-70 hidden whitespace-nowrap rounded-md bg-[#202a34] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block group-focus-visible:block">
                {label}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

function SidebarContent({
  collapsed,
  email,
  name,
  onNavigate,
  onToggle,
}: SidebarContentProps) {
  const profileName = name || "Company Admin";
  const initials = profileName.slice(0, 2).toUpperCase();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  return (
    <>
      <div
        className={`flex h-10 items-center ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {collapsed ? (
          <button
            aria-label="Expand navigation"
            className="group relative grid size-8 place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2d423e]"
            onClick={onToggle ?? onNavigate}
            title="Expand navigation"
            type="button"
          >
            <span className="grid size-7 place-items-center rounded-md bg-[#202a34] text-xs font-bold text-white transition group-hover:opacity-0">
              D
            </span>
            <PanelRight className="pointer-events-none absolute size-4 text-[#2d423e] opacity-0 transition group-hover:opacity-100" />
          </button>
        ) : (
          <>
            <Link
              aria-label="Distributor Direct overview"
              className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-[#202a34]"
              href="/admin"
              onClick={onNavigate}
            >
              <span className="grid size-7 place-items-center rounded-md bg-[#202a34] text-xs font-bold text-white">
                D
              </span>
              Distributor Direct
            </Link>
            {onToggle ? (
              <button
                aria-label="Collapse navigation"
                className="grid size-8 place-items-center rounded-md text-[#89909a] transition hover:bg-white hover:text-[#3b4650]"
                onClick={onToggle}
                title="Collapse navigation"
                type="button"
              >
                <PanelLeft className="size-4" strokeWidth={1.7} />
              </button>
            ) : null}
          </>
        )}
      </div>

      {!collapsed ? (
        <div className="mt-3 flex h-8 items-center gap-2 rounded-md bg-white px-2.5 text-[13px] text-[#7a828c] shadow-[0_4px_12px_rgba(17,20,26,0.05)]">
          <Search className="size-4" strokeWidth={1.7} />
          <span className="flex-1">Search anything</span>
          <kbd className="text-[11px] font-medium text-[#7a828c]">⌘ K</kbd>
        </div>
      ) : null}

      <nav
        aria-label="Admin navigation"
        className={`mt-5 ${collapsed ? "px-1" : ""}`}
      >
        {!collapsed ? (
          <p className="mb-3 text-[11px] font-medium uppercase tracking-normal text-[#7a828c]">
            Main navigation
          </p>
        ) : null}
        <NavList
          collapsed={collapsed}
          items={primaryNavigation}
          onNavigate={onNavigate}
        />
        {!collapsed ? (
          <p className="mb-3 mt-7 text-[11px] font-medium uppercase tracking-normal text-[#7a828c]">
            Analytics & insights
          </p>
        ) : null}
        <div className={collapsed ? "mt-3" : ""}>
          <NavList
            collapsed={collapsed}
            items={insightNavigation}
            onNavigate={onNavigate}
          />
        </div>
      </nav>

      <div className={`mt-auto ${collapsed ? "px-1" : ""}`}>
        <a
          aria-label="Help and support"
          className={`mb-3 flex h-8 items-center rounded-lg text-[13px] text-[#58616e] transition hover:bg-white hover:text-[#202a34] ${collapsed ? "justify-center" : "gap-2.5 px-3"}`}
          href="mailto:support@distributordirect.com"
          title={collapsed ? "Help & Support" : undefined}
        >
          <CircleHelp className="size-4 shrink-0" strokeWidth={1.7} />
          {!collapsed ? "Help & Support" : null}
        </a>
        <div className="relative">
          <button
            aria-expanded={isAccountMenuOpen}
            aria-haspopup="menu"
            className={`flex min-h-12 w-full items-center rounded-xl border border-[#e2e4e4] bg-white text-left shadow-[0_2px_8px_rgba(17,20,26,0.04)] ${collapsed ? "justify-center" : "gap-2.5 px-2.5"}`}
            onClick={() => setIsAccountMenuOpen((open) => !open)}
            title={collapsed ? profileName : undefined}
            type="button"
          >
          <span className="relative grid size-7 shrink-0 place-items-center rounded-full border border-[#dce1df] bg-[#f8f8f7] text-[11px] font-semibold text-[#40504a]">
            {initials}
          </span>
          {!collapsed ? (
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-[#253038]">
                  {profileName}
                </span>
                <span className="block truncate text-[11px] text-[#7a828c]">
                  {email}
                </span>
              </span>
              <ChevronDown
                className={`size-4 shrink-0 text-[#7a828c] transition-transform ${isAccountMenuOpen ? "rotate-180" : ""}`}
                strokeWidth={1.7}
              />
            </span>
          ) : null}
          </button>
          {isAccountMenuOpen ? (
            <div className={`absolute bottom-[calc(100%+0.5rem)] z-70 rounded-xl border border-[#e2e4e4] bg-white p-1.5 shadow-lg ${collapsed ? "left-0 w-52" : "left-0 w-full"}`} role="menu">
              <p className="px-2.5 py-2 text-[11px] text-[#7a828c]">
                Signed in as {profileName}
              </p>
              <SignOutButton className="flex h-8 w-full items-center justify-center border-0 bg-transparent px-2.5 py-0 text-[13px] text-rose-600 hover:bg-rose-50 hover:text-rose-700" />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function AdminSidebar({ name, email }: { name: string; email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(
      "distributor-direct-admin-sidebar-collapsed",
    );
    const collapsed =
      window.matchMedia("(max-width: 1279px)").matches || saved === "true";
    const frame = window.requestAnimationFrame(() => {
      setIsCollapsed(collapsed);
      applySidebarWidth(collapsed);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleSidebar() {
    const next = !isCollapsed;
    setIsCollapsed(next);
    applySidebarWidth(next);
    window.localStorage.setItem(
      "distributor-direct-admin-sidebar-collapsed",
      String(next),
    );
  }

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-label="Open navigation menu"
        className="fixed left-4 top-3 z-60 grid size-10 place-items-center rounded-lg border border-[#e1e3e1] bg-white text-[#3b4650] shadow-sm lg:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Menu className="size-5" />
      </button>
      {isOpen ? (
        <button
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-[#202a34]/30 lg:hidden"
          onClick={() => setIsOpen(false)}
          type="button"
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-60 flex w-72 flex-col border-r border-[#e1e3e1] bg-[#f7f7f7] px-3 py-3 shadow-xl transition-[transform,width,padding] duration-200 lg:w-62.5 lg:translate-x-0 lg:shadow-none lg:max-xl:w-18 lg:max-xl:px-2 ${isCollapsed ? "xl:w-18 xl:px-2" : "xl:w-62.5 xl:px-3"} ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          aria-label="Close navigation menu"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-md text-[#69717a] hover:bg-white lg:hidden"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          <X className="size-4" />
        </button>
        <div className="flex min-h-full flex-col lg:hidden">
          <SidebarContent
            collapsed={false}
            email={email}
            name={name}
            onNavigate={() => setIsOpen(false)}
          />
        </div>
        <div className="hidden min-h-full flex-col lg:flex">
          <SidebarContent
            collapsed={isCollapsed}
            email={email}
            name={name}
            onToggle={toggleSidebar}
          />
        </div>
      </aside>
    </>
  );
}
