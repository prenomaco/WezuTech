"use client";

import { TrashIcon } from "@phosphor-icons/react/ssr";
import { useFormStatus } from "react-dom";

/**
 * Delete, as a row action.
 *
 * Sized and shaped like the Edit and View controls beside it rather than as a
 * filled red block: a table of seven rows had seven of those, which made
 * destruction the loudest thing on the page. The danger reads in the colour
 * and in the confirm, not in a solid fill.
 *
 * The confirm is on the form's `submit` rather than the button's `click` so a
 * keyboard submit is caught too.
 */
const DANGER =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-red-500/40 px-2.5 text-xs font-medium " +
  "text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 " +
  "disabled:pointer-events-none disabled:opacity-50";

function SubmitButton({ label }: { readonly label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={DANGER} disabled={pending} type="submit">
      <TrashIcon aria-hidden className="size-3.5" />
      {pending ? "Deleting…" : label}
    </button>
  );
}

export function DeleteRowButton({
  action,
  id,
  name,
  label = "Delete",
}: {
  readonly action: (formData: FormData) => void | Promise<void>;
  readonly id: string;
  /** Named in the confirm, so it is clear which row is going. */
  readonly name: string;
  readonly label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <input name="id" type="hidden" value={id} />
      <SubmitButton label={label} />
    </form>
  );
}
