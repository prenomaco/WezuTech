"use client";

import { useFormStatus } from "react-dom";
import { deleteProduct } from "@/app/admin/actions";
import { Button } from "@/components/dashboard/ui";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit" variant="destructive">
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}

export function AdminDeleteProductButton({ id, name }: { readonly id: string; readonly name: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <input name="id" type="hidden" value={id} />
      <SubmitButton />
    </form>
  );
}
