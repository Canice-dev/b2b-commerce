import type { ReactNode } from "react";
import { Plus, type LucideIcon } from "lucide-react";
import { AdminUtilityActions } from "@/components/admin-utility-actions";
import { SignOutButton } from "@/components/sign-out-button";

type AdminPageShellProps = {
  action: string;
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  label: string;
  title: string;
};

export function AdminPageShell({
  action,
  children,
  description,
  icon: Icon,
  label,
  title,
}: AdminPageShellProps) {
  return (
    <main className="mx-auto max-w-[1540px] px-4 pb-6 pt-16 sm:px-6 lg:px-8 lg:py-6">
      <div className="border-b border-slate-200 pb-6">
        <div className="mb-4 flex w-full items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex min-w-0 items-center gap-2">
            <span>Operations</span>
            <span>/</span>
            <span className="truncate font-medium text-slate-700">{label}</span>
          </span>
          <SignOutButton className="h-7 shrink-0 border-0 bg-transparent px-2 py-0 text-xs hover:bg-white" />
        </div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-slate-500" />
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {title}
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminUtilityActions />
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition hover:bg-slate-800"
              type="button"
            >
              <Plus size={15} />
              {action}
            </button>
          </div>
        </div>
      </div>
      {children}
    </main>
  );
}
