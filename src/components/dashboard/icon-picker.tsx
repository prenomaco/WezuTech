"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import { Glyph } from "@/components/glyph";
import { ICON_OPTIONS, canonicalIconKey, iconLabel, type IconGroup } from "@/lib/icon-library";

/**
 * The icon chooser, as a searchable panel rather than a `<select>`.
 *
 * The set it draws from went from fifteen glyphs to eighty, which a native
 * select cannot show: its list is names with no marks beside them, so picking
 * meant reading "Monitoring" and publishing to find out what it looked like,
 * and at eighty entries the scroll alone made it unusable. This shows the
 * glyphs themselves, in groups, with a search field over them, so "load" or
 * "coolant" or "rfid" lands on the right one without knowing its name.
 *
 * The value travels in a hidden input, so the surrounding server action reads
 * `icon` from the form exactly as it did from the select.
 */

/** The lit panel a chosen glyph sits in, on both the trigger and the grid. */
const MARK =
  "grid place-items-center rounded-[0.5rem] border border-[rgb(35_164_236/0.28)] " +
  "bg-[linear-gradient(160deg,rgb(35_164_236/0.18),rgb(2_7_28/0.55))] text-[var(--dash-primary)]";

/*
 * `100vw - 5rem`, not `100vw - 3rem`.
 *
 * The panel opens at the left edge of its trigger, and the trigger is at its
 * deepest indent inside a feature row: about 3.6rem in at phone width. A
 * viewport-minus-gutter width therefore ran past the right edge by ten pixels,
 * and every ancestor here clips rather than scrolls, so the last column of
 * glyphs was simply cut off. Five covers that indent plus the gutter.
 */
const PANEL =
  "absolute left-0 top-full z-50 mt-1.5 w-[min(24rem,calc(100vw-5rem))] overflow-hidden rounded-xl " +
  "border border-[var(--dash-border-strong)] bg-[var(--dash-card)] shadow-[0_1.25rem_2.5rem_rgb(0_0_0/0.45)]";

const SEARCH =
  "h-9 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-subtle)] pl-8 pr-3 " +
  "text-sm text-[var(--dash-fg)] placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-primary)] focus:outline-none";

/** One glyph in the grid. Blue in every state; the ring is what reads as chosen. */
function IconButton({
  option,
  selected,
  onPick,
}: {
  readonly option: (typeof ICON_OPTIONS)[number];
  readonly selected: boolean;
  readonly onPick: (value: string) => void;
}) {
  return (
    <button
      aria-label={option.label}
      aria-pressed={selected}
      className={`${MARK} size-9 transition-colors hover:border-[rgb(35_164_236/0.6)] hover:bg-[rgb(35_164_236/0.26)] ${
        selected ? "ring-2 ring-[var(--dash-primary)] ring-offset-2 ring-offset-[var(--dash-card)]" : ""
      }`}
      onClick={() => onPick(option.value)}
      title={option.label}
      type="button"
    >
      <Glyph className="size-[1.125rem]" icon={option.value} />
    </button>
  );
}

export function IconPicker({
  name = "icon",
  value,
  label = "Icon",
  hint,
  onChange,
  /** `field` fills the width of a form row; `compact` is the trigger alone. */
  variant = "field",
}: {
  /**
   * The hidden input's name, so a plain server action reads the choice
   * straight off the form. Pass an empty string where the value belongs to a
   * list the parent already serialises, as the product form's features do.
   */
  readonly name?: string;
  readonly value: string;
  readonly label?: string;
  readonly hint?: string;
  /** Called with the new key, for a parent that keeps the value itself. */
  readonly onChange?: (value: string) => void;
  readonly variant?: "field" | "compact";
}) {
  const [icon, setIcon] = useState(() => canonicalIconKey(value));
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapper = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const panelId = useId();

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle
      ? ICON_OPTIONS.filter((option) => option.haystack.includes(needle))
      : ICON_OPTIONS;
    const byGroup = new Map<IconGroup, (typeof ICON_OPTIONS)[number][]>();
    for (const option of matches) {
      const bucket = byGroup.get(option.group);
      if (bucket) bucket.push(option);
      else byGroup.set(option.group, [option]);
    }
    return [...byGroup];
  }, [query]);

  /*
   * Closing is handled here rather than with an `onBlur` on the trigger:
   * clicking a glyph moves focus inside the panel, which fires blur on the
   * trigger and would close the panel before the click landed.
   */
  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const pick = (next: string) => {
    setIcon(next);
    onChange?.(next);
    setOpen(false);
    setQuery("");
  };

  /* Enter in the search field takes the first match, so a keyboard user who
     types "payment" never has to reach for the grid. */
  const firstMatch = groups[0]?.[1][0]?.value;

  return (
    <div className={`flex flex-col gap-1.5 ${variant === "field" ? "" : "shrink-0"}`}>
      {variant === "field" ? (
        <>
          <span className="text-xs font-medium text-[var(--dash-muted)]">{label}</span>
          {hint ? <span className="-mt-1 text-xs text-[var(--dash-muted)]">{hint}</span> : null}
        </>
      ) : null}

      <div className="relative" ref={wrapper}>
        {name ? <input name={name} type="hidden" value={icon} /> : null}

        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={variant === "compact" ? `${label}: ${iconLabel(icon)}` : undefined}
          className={
            variant === "field"
              ? "flex h-9 w-full items-center gap-2.5 rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-subtle)] px-2 text-left text-sm text-[var(--dash-fg)] transition-colors hover:border-[var(--dash-primary)]"
              : `${MARK} size-9 transition-colors hover:border-[rgb(35_164_236/0.6)]`
          }
          onClick={() => setOpen((current) => !current)}
          title={variant === "compact" ? iconLabel(icon) : undefined}
          type="button"
        >
          {variant === "field" ? (
            <>
              <span className={`${MARK} size-[1.625rem] shrink-0`}>
                <Glyph className="size-4" icon={icon} />
              </span>
              <span className="min-w-0 flex-1 truncate">{iconLabel(icon)}</span>
              <span aria-hidden className="text-[var(--dash-muted)]">
                Change
              </span>
            </>
          ) : (
            <Glyph className="size-[1.125rem]" icon={icon} />
          )}
        </button>

        {open ? (
          <div className={PANEL} id={panelId} role="dialog">
            <div className="relative border-b border-[var(--dash-border)] p-2.5">
              <MagnifyingGlassIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-5 size-3.5 -translate-y-1/2 text-[var(--dash-muted)]"
              />
              <input
                aria-label="Search icons"
                className={SEARCH}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (firstMatch) pick(firstMatch);
                  }
                }}
                placeholder="Search icons: charging, cooling, payment…"
                ref={search}
                type="search"
                value={query}
              />
            </div>

            <div className="max-h-[19rem] overflow-y-auto p-2.5">
              {groups.length ? (
                <div className="flex flex-col gap-3">
                  {groups.map(([group, options]) => (
                    <div key={group}>
                      <p className="mb-1.5 text-[0.6875rem] font-medium tracking-wide text-[var(--dash-muted)] uppercase">
                        {group}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {options.map((option) => (
                          <IconButton
                            key={option.value}
                            onPick={pick}
                            option={option}
                            selected={option.value === icon}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-1 py-3 text-sm text-[var(--dash-muted)]">
                  No icon matches &ldquo;{query.trim()}&rdquo;.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
