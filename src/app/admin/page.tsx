import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminProductForm } from "@/components/admin-product-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateLead } from "@/app/admin/actions";
import { SignOutButton } from "@/components/sign-out-button";
import "@/app/admin/admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/admin/login");
  const [products, leads] = await Promise.all([
    prisma.product.findMany({ include: { media: { where: { kind: "CARD" }, take: 1 } }, orderBy: { sortOrder: "asc" } }),
    prisma.lead.findMany({ include: { sourceProduct: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return <main className="admin-shell"><div className="admin-nav"><div><p className="eyebrow">WEZU ADMIN</p><h1>Products &amp; potential clients</h1></div><SignOutButton /></div><AdminProductForm />{products.map((product) => <AdminProductForm key={product.id} product={product} media={product.media[0]} />)}<section className="admin-card"><h2>Potential clients</h2><div className="admin-list">{leads.length ? leads.map((lead) => <article className="admin-row" key={lead.id}><div><strong>{lead.name}</strong> <span className="status">{lead.status}</span><p>{lead.email}{lead.company ? ` · ${lead.company}` : ""}{lead.sourceProduct ? ` · ${lead.sourceProduct.name}` : ""}</p><p>{lead.subject}</p><p>{lead.message}</p><small>{lead.createdAt.toLocaleString()}</small></div><form action={updateLead}><input type="hidden" name="id" value={lead.id} /><select name="status" defaultValue={lead.status}>{["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"].map(status => <option key={status}>{status}</option>)}</select><textarea name="internalNotes" defaultValue={lead.internalNotes ?? ""} placeholder="Internal notes" /><button className="button">Update</button></form></article>) : <p>No enquiries yet.</p>}</div></section></main>;
}
