"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { updateMarketAssignment } from "./actions";

type Distributor = {
  id: string;
  businessName: string;
};

export function MarketAssignmentEditor({
  marketId,
  distributorId,
  distributorName,
  distributors,
}: {
  marketId: string;
  distributorId: string | null;
  distributorName: string | null;
  distributors: Distributor[];
}) {
  const [selectedDistributorId, setSelectedDistributorId] = useState(
    distributorId,
  );
  const [isPending, startTransition] = useTransition();

  function handleValueChange(value: string | null) {
    const nextDistributorId = value || null;
    if (nextDistributorId === selectedDistributorId) return;

    setSelectedDistributorId(nextDistributorId);
    const formData = new FormData();
    formData.set("marketId", marketId);
    formData.set("distributorId", nextDistributorId ?? "");
    startTransition(async () => {
      await updateMarketAssignment(formData);
    });
  }

  const selectedName = selectedDistributorId
    ? distributors.find((distributor) => distributor.id === selectedDistributorId)
        ?.businessName ?? distributorName
    : null;

  return (
    <Combobox
      onValueChange={handleValueChange}
      value={selectedDistributorId}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-48 truncate text-sm text-slate-700">
          {selectedName ?? "Not assigned"}
        </span>
        <ComboboxTrigger
          aria-label={`Edit distributor for this market${selectedName ? `, currently ${selectedName}` : ""}`}
          className="grid size-7 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-wait disabled:opacity-50"
          disabled={isPending}
          showIndicator={false}
        >
          <Pencil size={14} />
        </ComboboxTrigger>
      </div>
      <ComboboxContent className="min-w-72">
        <ComboboxInput
          aria-label="Search distributors"
          placeholder="Search distributors..."
          showClear
          showTrigger={false}
        />
        <ComboboxList>
          <ComboboxItem value="">Unassign distributor</ComboboxItem>
          {distributors.map((distributor) => (
            <ComboboxItem key={distributor.id} value={distributor.id}>
              {distributor.businessName}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No distributor found.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
