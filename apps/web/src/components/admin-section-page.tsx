import { ArrowUpRight, type LucideIcon, Plus } from "lucide-react";
import { AdminUtilityActions } from "@/components/admin-utility-actions";
import { SignOutButton } from "@/components/sign-out-button";

type AdminSectionPageProps = {
  action: string;
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  icon: LucideIcon;
  label: string;
  title: string;
};

export function AdminSectionPage({
  action,
  description,
  emptyDescription,
  emptyTitle,
  icon: Icon,
  label,
  title,
}: AdminSectionPageProps) {
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
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminUtilityActions />
            <button className="inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition hover:bg-slate-800" type="button">
              <Plus size={15} />
              {action}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="panel-heading flex h-12 items-center gap-2 border-b border-slate-200 px-4 text-sm font-medium text-slate-700">
          <Icon className="text-slate-500" size={16} />
          {label}
        </div>
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <span className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
            <Icon size={18} />
          </span>
          <h2 className="mt-4 text-sm font-semibold text-slate-800">{emptyTitle}</h2>
          <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
            {emptyDescription}
          </p>
          <button className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-950" type="button">
            {action}
            <ArrowUpRight size={14} />
          </button>
        </div>
      </section>
    </main>
  );
}
