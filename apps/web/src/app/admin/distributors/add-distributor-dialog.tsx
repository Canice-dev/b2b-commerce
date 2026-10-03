"use client";

import { Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createDistributor } from "./actions";

export function AddDistributorDialog() {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition hover:bg-slate-800">
        <Plus size={15} />
        Add distributor
      </DialogTrigger>
      <DialogContent
        className="max-w-xl gap-5 p-6 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle>Add distributor</DialogTitle>
          <DialogDescription>
            Create the distributor profile and its owner&apos;s dashboard login.
          </DialogDescription>
        </DialogHeader>
        <form action={createDistributor} className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" name="businessName" />
          <Field label="Contact phone" name="contactPhone" type="tel" />
          <Field label="Owner name" name="ownerName" />
          <Field label="Owner email" name="ownerEmail" type="email" />
          <Field
            hint="At least 12 characters"
            label="Temporary password"
            name="password"
            type="password"
            minLength={12}
          />
          <Field
            hint="NGN"
            label="Minimum order"
            name="minimumOrderNaira"
            type="number"
            min="0"
            step="0.01"
          />
          <DialogFooter className="sm:col-span-2">
            <DialogClose
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50"
              type="button"
            >
              Cancel
            </DialogClose>
            <button
              className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-800"
              type="submit"
            >
              Create distributor
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  hint,
  label,
  name,
  type = "text",
  ...props
}: {
  hint?: string;
  label: string;
  name: string;
  type?: string;
} & React.ComponentProps<"input">) {
  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-medium text-slate-700">
      {label}
      <input
        className="h-9 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm"
        name={name}
        required
        type={type}
        {...props}
      />
      {hint ? <span className="font-normal text-slate-400">{hint}</span> : null}
    </label>
  );
}
