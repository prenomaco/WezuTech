"use client";
/* Category artwork is admin-uploaded to Cloudinary; no remote pattern is
   configured for next/image. */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteCategory } from "@/app/admin/actions";
import { DeleteRowButton } from "@/components/dashboard/delete-row-button";
import { EmptyState, ResultCount, SearchField, Toolbar } from "@/components/dashboard/toolbar";
import { Table, Td, Th } from "@/components/dashboard/ui";
import { CategoryIcon } from "@/components/category-icon";

export interface CategoryRow {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly blurb: string;
  readonly image: string | null;
  readonly icon: string;
  readonly sortOrder: number;
  readonly productCount: number;
}

const ACTION =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--dash-border-strong)] px-2.5 " +
  "text-xs font-medium text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-subtle)]";

/**
 * The product families, as the dashboard's own list.
 *
 * The same shape as Products and Testimonials so the three read as one tool.
 * No status filter, because a category has no draft state — it either exists
 * or it does not — so the toolbar is search alone.
 *
 * The mark column shows what the public card will show: the uploaded artwork
 * if there is any, otherwise the icon the card falls back to. That way the
 * choice of icon is verifiable here rather than only on the live site.
 */
function CategoryMark({ category }: { readonly category: CategoryRow }) {
  if (category.image) {
    return (
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--dash-border)] bg-[var(--dash-subtle)]">
        <img alt="" className="h-full w-full object-contain p-0.5" src={category.image} />
      </span>
    );
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-md border border-[rgb(9_133_204/0.3)] bg-[rgb(9_133_204/0.1)] text-[var(--dash-primary)]">
      <CategoryIcon className="size-4" icon={category.icon} strokeWidth={1.7} />
    </span>
  );
}

export function CategoriesTable({ categories }: { readonly categories: readonly CategoryRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((category) =>
      `${category.name} ${category.slug} ${category.blurb}`.toLowerCase().includes(needle),
    );
  }, [categories, query]);

  return (
    <div className="flex flex-col gap-3">
      <Toolbar>
        <SearchField
          label="Search categories"
          onChange={setQuery}
          placeholder="Search by name, slug or description…"
          value={query}
        />
      </Toolbar>

      <ResultCount noun="categories" shown={filtered.length} total={categories.length} />

      {filtered.length ? (
        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
          <Table>
            <thead>
              <tr>
                <Th className="w-12 text-right">#</Th>
                <Th>Category</Th>
                <Th className="hidden lg:table-cell">Description</Th>
                <Th className="text-right">Products</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((category) => (
                <tr key={category.id}>
                  <Td className="text-right text-xs tabular-nums text-[var(--dash-muted)]">
                    {category.sortOrder}
                  </Td>

                  <Td>
                    <div className="flex items-center gap-3">
                      <CategoryMark category={category} />
                      <div className="min-w-0">
                        <Link
                          className="font-medium text-[var(--dash-fg)] hover:text-[var(--dash-primary)]"
                          href={`/admin/categories/${category.id}/edit`}
                        >
                          {category.name}
                        </Link>
                        <span className="block text-xs text-[var(--dash-muted)]">
                          /products/category/{category.slug}
                        </span>
                      </div>
                    </div>
                  </Td>

                  <Td className="hidden max-w-[30rem] lg:table-cell">
                    <span className="text-xs text-[var(--dash-muted)]">{category.blurb}</span>
                  </Td>

                  <Td className="text-right tabular-nums">{category.productCount}</Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link className={ACTION} href={`/admin/categories/${category.id}/edit`}>
                        <Pencil aria-hidden className="size-3.5" /> Edit
                      </Link>
                      <DeleteRowButton action={deleteCategory} id={category.id} name={category.name} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <EmptyState filtered={categories.length > 0}>
          No categories yet. Add the first product family.
        </EmptyState>
      )}
    </div>
  );
}
