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
  MessageCircle,
  Package,
  PackagePlus,
  PanelLeft,
  PanelRight,
  Search,
  ShoppingCart,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

const navigation: ReadonlyArray<{
  href?: string;
  icon: LucideIcon;
  label: string;
  soon?: boolean;
}> = [
  { href: "/distributor", icon: LayoutGrid, label: "Overview" },
  { href: "/distributor/orders", icon: ShoppingCart, label: "Order queue" },
  { href: "/distributor/deliveries", icon: Truck, label: "Deliveries" },
  { href: "/distributor/catalogue", icon: Package, label: "Catalogue" },
  { href: "/distributor/restock", icon: PackagePlus, label: "Restock from company" },
  { href: "/distributor/messages", icon: MessageCircle, label: "Company messages" },
  { href: "/distributor/service-areas", icon: MapPinned, label: "Service areas" },
  { href: "/distributor/performance", icon: BarChart3, label: "Performance" },
];

export function DistributorSidebar({
  businessName,
  email,
  unreadMessages,
}: {
  businessName: string;
  email: string;
  unreadMessages: number;
}) {
  const pathname = usePathname();
  const initials = businessName.slice(0, 2).toUpperCase();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.localStorage.getItem(
        "distributor-direct-distributor-sidebar-collapsed",
      ) === "true"
    );
  });

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--distributor-sidebar-width",
      isCollapsed ? "4.5rem" : "15.625rem",
    );
  }, [isCollapsed]);

  function toggleSidebar() {
    const next = !isCollapsed;
    setIsCollapsed(next);
    document.documentElement.style.setProperty(
      "--distributor-sidebar-width",
      next ? "4.5rem" : "15.625rem",
    );
    window.localStorage.setItem(
      "distributor-direct-distributor-sidebar-collapsed",
      String(next),
    );
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#e1e3e1] bg-[#f7f7f7] py-3 transition-[width,padding] duration-200 lg:flex ${isCollapsed ? "w-18 px-2" : "w-62.5 px-3"}`}
    >
      <div
        className={`flex h-10 items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        {isCollapsed ? (
          <button
            aria-label="Expand navigation"
            className="group relative grid size-8 place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2d423e]"
            onClick={toggleSidebar}
            title="Expand navigation"
            type="button"
          >
            <span className="grid size-7 place-items-center rounded-md bg-[#202a34] text-xs font-bold text-white transition group-hover:opacity-0">
              D
            </span>
            <PanelRight className="pointer-events-none absolute size-4 text-[#2d423e] opacity-0 transition group-hover:opacity-100" strokeWidth={1.7} />
          </button>
        ) : (
          <>
            <Link
              aria-label="Distributor Direct overview"
              className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-[#202a34]"
              href="/distributor"
            >
              <span className="grid size-7 place-items-center rounded-md bg-[#202a34] text-xs font-bold text-white">
                D
              </span>
              Distributor Direct
            </Link>
            <button
              aria-label="Collapse navigation"
              className="grid size-8 place-items-center rounded-md text-[#89909a] transition hover:bg-white hover:text-[#3b4650]"
              onClick={toggleSidebar}
              title="Collapse navigation"
              type="button"
            >
              <PanelLeft className="size-4" strokeWidth={1.7} />
            </button>
          </>
        )}
      </div>
      {!isCollapsed ? (
        <div className="mt-3 flex h-8 items-center gap-2 rounded-md bg-white px-2.5 text-[13px] text-[#7a828c] shadow-[0_4px_12px_rgba(17,20,26,0.05)]">
          <Search className="size-4" strokeWidth={1.7} />
          <span className="flex-1">Search anything</span>
          <kbd className="text-[11px] font-medium text-[#7a828c]">⌘ K</kbd>
        </div>
      ) : null}
      <nav aria-label="Distributor navigation" className={`mt-5 ${isCollapsed ? "px-1" : ""}`}>
        {!isCollapsed ? <p className="mb-3 text-[11px] font-medium text-[#7a828c]">Main navigation</p> : null}
        <div className="flex flex-col gap-1">
          {navigation.map(({ href, icon: Icon, label, soon }) => {
            const active = href === pathname;
            const unread = href === "/distributor/messages" ? unreadMessages : 0;
            const className = `group relative flex h-8 items-center rounded-lg text-[13px] ${isCollapsed ? "justify-center" : "gap-2.5 px-3"} ${active ? "border border-[#e1e3e1] bg-white font-medium text-[#253038] shadow-[0_1px_2px_rgba(17,20,26,0.04)]" : "text-[#58616e]"}`;
            const item = (
              <>
                <Icon className="size-4" strokeWidth={1.7} />
                {!isCollapsed ? <span className="flex-1">{label}</span> : null}
                {soon && !isCollapsed ? (
                  <span className="text-[10px] font-medium text-[#89909a]">
                    Soon
                  </span>
                ) : null}
                {unread ? <span className={`grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ${isCollapsed ? "absolute -right-1 -top-1 size-3 min-w-0 px-0 text-[0px]" : "ml-auto h-4"}`}>{unread > 99 ? "99+" : unread}</span> : null}
                {isCollapsed ? <span className="pointer-events-none absolute left-[calc(100%+0.65rem)] z-70 hidden whitespace-nowrap rounded-md bg-[#202a34] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">{label}</span> : null}
              </>
            );
            return href ? (
              <Link className={className} href={href} key={label} title={isCollapsed ? label : undefined}>
                {item}
              </Link>
            ) : (
              <div aria-disabled="true" className={className} key={label} title={isCollapsed ? label : undefined}>
                {item}
              </div>
            );
          })}
        </div>
      </nav>
      <div className={`mt-auto ${isCollapsed ? "px-1" : ""}`}>
        <a
          className={`mb-3 flex h-8 items-center rounded-lg text-[13px] text-[#58616e] hover:bg-white hover:text-[#202a34] ${isCollapsed ? "justify-center" : "gap-2.5 px-3"}`}
          href="mailto:support@distributordirect.com"
          title={isCollapsed ? "Help & Support" : undefined}
        >
          <CircleHelp className="size-4" strokeWidth={1.7} />
          {!isCollapsed ? "Help & Support" : null}
        </a>
        <div className="relative">
          <button
            aria-expanded={isAccountMenuOpen}
            aria-haspopup="menu"
            className={`flex min-h-12 w-full items-center rounded-xl border border-[#e2e4e4] bg-white text-left shadow-[0_2px_8px_rgba(17,20,26,0.04)] ${isCollapsed ? "justify-center" : "gap-2.5 px-2.5"}`}
            onClick={() => setIsAccountMenuOpen((open) => !open)}
            title={isCollapsed ? businessName : undefined}
            type="button"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#dce1df] bg-[#f8f8f7] text-[11px] font-semibold text-[#40504a]">
              {initials}
            </span>
            {!isCollapsed ? <span className="flex min-w-0 flex-1 items-center justify-between gap-2"><span className="min-w-0"><span className="block truncate text-[13px] font-medium text-[#253038]">{businessName}</span><span className="block truncate text-[11px] text-[#7a828c]">{email}</span></span><ChevronDown className={`size-4 shrink-0 text-[#7a828c] transition-transform ${isAccountMenuOpen ? "rotate-180" : ""}`} strokeWidth={1.7} /></span> : null}
          </button>
          {isAccountMenuOpen ? <div className={`absolute bottom-[calc(100%+0.5rem)] z-70 rounded-xl border border-[#e2e4e4] bg-white p-1.5 shadow-lg ${isCollapsed ? "left-0 w-52" : "left-0 w-full"}`} role="menu"><p className="px-2.5 py-2 text-[11px] text-[#7a828c]">Signed in as {businessName}</p><SignOutButton className="flex h-8 w-full items-center justify-center border-0 bg-transparent px-2.5 py-0 text-[13px] text-rose-600 hover:bg-rose-50 hover:text-rose-700" redirectTo="/distributor/sign-in" /></div> : null}
        </div>
      </div>
    </aside>
  );
}
