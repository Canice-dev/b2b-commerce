"use client";

import { Pencil } from "lucide-react";
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
import { updateDistributor } from "./actions";

export function EditDistributorDialog({
  distributor,
}: {
  distributor: {
    id: string;
    ownerUserId: string;
    businessName: string;
    phone: string;
    ownerName: string | null;
    ownerEmail: string | null;
    minimumOrderNaira: string;
    isActive: boolean;
  };
}) {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Edit ${distributor.businessName}`}
        className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      >
        <Pencil size={15} />
      </DialogTrigger>
      <DialogContent
        className="max-w-xl gap-5 p-6 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle>Edit distributor</DialogTitle>
          <DialogDescription>
            Update the distributor profile and owner dashboard account.
          </DialogDescription>
        </DialogHeader>
        <form action={updateDistributor} className="grid gap-4 sm:grid-cols-2">
          <input name="distributorId" type="hidden" value={distributor.id} />
          <input
            name="ownerUserId"
            type="hidden"
            value={distributor.ownerUserId}
          />
          <Field
            defaultValue={distributor.businessName}
            label="Business name"
            name="businessName"
          />
          <Field
            defaultValue={distributor.phone}
            label="Contact phone"
            name="contactPhone"
            type="tel"
          />
          <Field
            defaultValue={distributor.ownerName ?? ""}
            label="Owner name"
            name="ownerName"
          />
          <Field
            defaultValue={distributor.ownerEmail ?? ""}
            label="Owner email"
            name="ownerEmail"
            type="email"
          />
          <Field
            defaultValue={distributor.minimumOrderNaira}
            label="Minimum order"
            min="0"
            name="minimumOrderNaira"
            step="0.01"
            type="number"
          />
          <label className="flex h-9 items-center gap-2 self-end text-sm text-slate-700">
            <input
              defaultChecked={distributor.isActive}
              name="isActive"
              type="checkbox"
            />
            Active distributor
          </label>
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
              Save changes
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
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
    </label>
  );
}
