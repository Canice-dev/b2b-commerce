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
import { createTerritory } from "./actions";

type Distributor = {
  id: string;
  businessName: string;
};

export function AddTerritoryDialog({
  distributors,
}: {
  distributors: Distributor[];
}) {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition hover:bg-slate-800">
        <Plus size={15} />
        Add territory
      </DialogTrigger>
      <DialogContent
        className="max-w-xl gap-5 p-6 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle>Add a market</DialogTitle>
          <DialogDescription>
            Add a State, LGA/city, and market. Reuse a state code when adding
            another market within an existing state.
          </DialogDescription>
        </DialogHeader>
        <form action={createTerritory} className="grid gap-4 sm:grid-cols-2">
          <label className="grid min-w-0 gap-1.5 text-xs font-medium text-slate-700">
            State name
            <input
              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm"
              maxLength={120}
              name="stateName"
              placeholder="e.g. Lagos"
              required
            />
            <span className="font-normal text-slate-400">Full state name</span>
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-medium text-slate-700">
            State code
            <input
              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm uppercase"
              maxLength={8}
              name="stateCode"
              pattern="[A-Za-z]{2,8}"
              placeholder="e.g. LA"
              required
            />
            <span className="font-normal text-slate-400">
              2–8 letters; reuse this code for the same state
            </span>
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-medium text-slate-700">
            LGA / city
            <input
              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm"
              maxLength={120}
              name="lgaName"
              placeholder="e.g. Ikeja"
              required
            />
            <span className="font-normal text-slate-400">Local Government Area or city</span>
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-medium text-slate-700">
            Market
            <input
              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm"
              maxLength={120}
              name="marketName"
              placeholder="e.g. Computer Village"
              required
            />
            <span className="font-normal text-slate-400">The market customers select</span>
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-medium text-slate-700 sm:col-span-2">
            Distributor
            <select
              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              defaultValue=""
              name="distributorId"
            >
              <option value="">Assign later</option>
              {distributors.map((distributor) => (
                <option key={distributor.id} value={distributor.id}>
                  {distributor.businessName}
                </option>
              ))}
            </select>
            <span className="font-normal text-slate-400">Optional — you can assign one later</span>
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
              Save territory
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
