"use client";
/* Product renders are admin-uploaded to Cloudinary; no remote pattern is
   configured for next/image. */
/* eslint-disable @next/next/no-img-element */

import type { ProductStatus } from "@prisma/client";
import Link from "next/link";
import { ExternalLink, ImageOff, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteProduct } from "@/app/admin/actions";
import { DeleteRowButton } from "@/components/dashboard/delete-row-button";
import { PRODUCT_STATUS_TONE, StatusText, titleCase } from "@/components/dashboard/status-text";
import { EmptyState, FilterSelect, ResultCount, SearchField, Toolbar } from "@/components/dashboard/toolbar";
import { Table, Td, Th } from "@/components/dashboard/ui";

export interface ProductRow {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly status: ProductStatus;
  readonly sortOrder: number;
  readonly leadCount: number;
  readonly categories: readonly { slug: string; name: string }[];
  /** The catalogue card image, so the row can be recognised by its picture. */
  readonly imageUrl: string | null;
}

/** The taxonomy to filter by, passed in because it lives in the database. */
export interface CategoryOption {
  readonly slug: string;
  readonly name: string;
}

const STATUS_OPTIONS = (["PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((status) => ({
  value: status,
  label: titleCase(status),
}));

const ACTION =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--dash-border-strong)] px-2.5 " +
  "text-xs font-medium text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-subtle)]";

/**
 * The catalogue, as a table you can actually work in.
 *
 * What this replaces: a table with one Delete button per row, followed by
 * eight stacked `<details>` elements — "Add product", then "Edit <name>" for
 * every product — so editing meant scrolling past the table to find the right
 * collapsed panel, and the page grew a whole form per product whether or not
 * anyone opened it.
 *
 * Now the table is the index and the form is a page. Editing is a link on the
 * row; adding is a button in the page header. Search and the two filters run
 * in the browser over rows already fetched, so they respond on the keystroke.
 */
export function ProductsTable({
  products,
  categories,
}: {
  readonly products: readonly ProductRow[];
  readonly categories: readonly CategoryOption[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [category, setCategory] = useState<string | "">("");

  const categoryOptions = useMemo(
    () =>
      categories.map((entry) => ({
        value: entry.slug,
        label: entry.name,
        count: products.filter((product) =>
          product.categories.some((tag) => tag.slug === entry.slug),
        ).length,
      })),
    [products, categories],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      if (status && product.status !== status) return false;
      if (category && !product.categories.some((tag) => tag.slug === category)) return false;
      if (!needle) return true;
      return `${product.name} ${product.slug}`.toLowerCase().includes(needle);
    });
  }, [products, query, status, category]);

  return (
    <div className="flex flex-col gap-3">
      <Toolbar>
        <SearchField
          label="Search products"
          onChange={setQuery}
          placeholder="Search by name or slug…"
          value={query}
        />
        <FilterSelect
          allLabel="All statuses"
          label="Filter by status"
          onChange={setStatus}
          options={STATUS_OPTIONS}
          value={status}
        />
        <FilterSelect
          allLabel="All categories"
          label="Filter by category"
          onChange={setCategory}
          options={categoryOptions}
          value={category}
        />
      </Toolbar>

      <ResultCount noun="products" shown={filtered.length} total={products.length} />

      {filtered.length ? (
        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
          <Table>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th className="hidden md:table-cell">Categories</Th>
                <Th>Status</Th>
                <Th className="hidden text-right sm:table-cell">Enquiries</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <Td>
                    {/* The card image, at thumbnail size. A catalogue of
                        similarly-named chargers and packs is hard to scan as
                        text alone, and this is the same picture the client
                        sees on the site, so a row is recognisable at a glance
                        rather than by reading its slug. */}
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--dash-border)] bg-[rgb(2_7_28/0.45)]">
                        {product.imageUrl ? (
                          <img
                            alt=""
                            className="h-full w-full object-contain p-0.5"
                            loading="lazy"
                            src={product.imageUrl}
                          />
                        ) : (
                          <ImageOff aria-hidden className="size-4 text-[var(--dash-muted)]" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <Link
                          className="font-medium text-[var(--dash-fg)] hover:text-[var(--dash-primary)]"
                          href={`/admin/products/${product.id}/edit`}
                        >
                          {product.name}
                        </Link>
                        <span className="block text-xs text-[var(--dash-muted)]">
                          /products/{product.slug}
                        </span>
                      </div>
                    </div>
                  </Td>

                  <Td className="hidden md:table-cell">
                    {product.categories.length ? (
                      <span className="text-xs text-[var(--dash-muted)]">
                        {product.categories.map((tag) => tag.name).join(", ")}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400">Uncategorised</span>
                    )}
                  </Td>

                  <Td>
                    <StatusText tone={PRODUCT_STATUS_TONE[product.status]}>{product.status}</StatusText>
                  </Td>

                  <Td className="hidden text-right tabular-nums sm:table-cell">{product.leadCount}</Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link className={ACTION} href={`/admin/products/${product.id}/edit`}>
                        <Pencil aria-hidden className="size-3.5" /> Edit
                      </Link>
                      {product.status === "PUBLISHED" ? (
                        <a
                          className={ACTION}
                          href={`/products/${product.slug}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ExternalLink aria-hidden className="size-3.5" /> View
                        </a>
                      ) : null}
                      <DeleteRowButton action={deleteProduct} id={product.id} name={product.name} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <EmptyState filtered={products.length > 0}>
          Nothing in the catalogue yet. Add your first product.
        </EmptyState>
      )}
    </div>
  );
}
