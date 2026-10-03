"use client";

import { Pencil, Plus, SlidersHorizontal } from "lucide-react";
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
import {
  adjustStock,
  archiveProduct,
  createProduct,
  updateProduct,
} from "./actions";

export type CatalogueProduct = {
  id: string;
  name: string;
  variant: string | null;
  unit: string;
  priceKobo: number;
  quantity: number;
  isActive: boolean;
};

export function AddProductDialog() {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition hover:bg-slate-800">
        <Plus size={15} /> Add product
      </DialogTrigger>
      <DialogContent
        className="max-w-xl gap-5 p-6 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle>Add product</DialogTitle>
          <DialogDescription>
            Add a company product that distributors can order. Complete the
            product details below, then enter the quantity currently in stock.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          action={createProduct}
          isNewProduct
          submitLabel="Create product"
        />
      </DialogContent>
    </Dialog>
  );
}

export function EditProductDialog({ product }: { product: CatalogueProduct }) {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Edit ${product.name}`}
        className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      >
        <Pencil size={15} />
      </DialogTrigger>
      <DialogContent
        className="max-w-xl gap-5 p-6 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>
            Update catalogue details. Adjust stock separately to preserve its
            history.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          action={updateProduct}
          product={product}
          submitLabel="Save changes"
        />
        {product.isActive ? (
          <form
            action={archiveProduct}
            className="border-t border-slate-100 pt-4"
          >
            <input name="productId" type="hidden" value={product.id} />
            <button
              className="text-xs font-medium text-rose-700 hover:text-rose-800"
              type="submit"
            >
              Archive product
            </button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function AdjustStockDialog({ product }: { product: CatalogueProduct }) {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Add or adjust stock for ${product.name}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <SlidersHorizontal size={14} /> Add stock
      </DialogTrigger>
      <DialogContent
        className="max-w-md gap-5 p-6 sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle>Add or adjust stock</DialogTitle>
          <DialogDescription>
            {product.name} currently has{" "}
            {product.quantity.toLocaleString("en-NG")} {product.unit} available.
          </DialogDescription>
        </DialogHeader>
        <form action={adjustStock} className="grid gap-4">
          <input name="productId" type="hidden" value={product.id} />
          <Field
            hint="Enter a positive number to add stock. Use a negative number only to correct a stock count."
            label="Quantity to add"
            name="quantityDelta"
            type="number"
            step="1"
          />
          <Field
            label="Reason"
            name="note"
            maxLength={500}
            placeholder="e.g. Physical stock count"
          />
          <DialogFooter>
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
              Save adjustment
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({
  action,
  isNewProduct = false,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  isNewProduct?: boolean;
  product?: CatalogueProduct;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {product ? (
        <input name="productId" type="hidden" value={product.id} />
      ) : null}
      <Field
        defaultValue={product?.name}
        hint={
          isNewProduct
            ? "Use the name distributors will see when ordering."
            : undefined
        }
        label="Product name"
        name="name"
        maxLength={160}
        placeholder="e.g. Premium Rice"
      />
      <Field
        defaultValue={product?.variant ?? ""}
        hint={
          isNewProduct
            ? "Optional: size, flavour, pack type, or grade."
            : undefined
        }
        label="Variant"
        name="variant"
        maxLength={120}
        required={false}
        placeholder="e.g. 50 kg bag"
      />
      <Field
        defaultValue={product?.unit}
        hint={
          isNewProduct
            ? "The unit used for ordering and stock counts."
            : undefined
        }
        label="Unit"
        name="unit"
        maxLength={60}
        placeholder="e.g. carton, bag, piece"
      />
      <Field
        defaultValue={
          product ? (product.priceKobo / 100).toFixed(2) : undefined
        }
        hint={
          isNewProduct ? "Enter the distributor price in Naira." : undefined
        }
        label="Unit price (NGN)"
        min="0"
        name="unitPriceNaira"
        placeholder="e.g. 25000.00"
        step="0.01"
        type="number"
      />
      {product ? (
        <label className="flex h-9 items-center gap-2 self-end text-sm text-slate-700">
          <input
            defaultChecked={product.isActive}
            name="isActive"
            type="checkbox"
          />{" "}
          Active product
        </label>
      ) : (
        <Field
          hint="How many units are currently available. This creates the opening stock record."
          label="Opening stock"
          min="0"
          name="openingQuantity"
          placeholder="e.g. 100"
          step="1"
          type="number"
        />
      )}
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
          {submitLabel}
        </button>
      </DialogFooter>
    </form>
  );
}

function Field({
  hint,
  label,
  name,
  type = "text",
  required = true,
  ...props
}: {
  hint?: string;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
} & React.ComponentProps<"input">) {
  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-medium text-slate-700">
      {label}
      <input
        className="h-9 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm"
        name={name}
        required={required}
        type={type}
        {...props}
      />
      {hint ? <span className="font-normal text-slate-400">{hint}</span> : null}
    </label>
  );
}
