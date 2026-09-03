import { hash } from "bcryptjs";
import { prisma } from "../src/lib/db";
import { adminAccountsFromEnv } from "../src/lib/admin-accounts";

/**
 * Create or update the dashboard's users from the environment.
 *
 * Accounts live in `.env.local` rather than in the database's history, so
 * adding somebody is an edit and a re-run rather than a manual insert, and the
 * same file drives every environment. Re-running is safe: an existing address
 * has its password and name reset and is reactivated, so this doubles as the
 * password reset.
 */
async function main() {
  const accounts = adminAccountsFromEnv(process.env);

  if (!accounts.length) {
    throw new Error(
      "No admin accounts configured. Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD, " +
        'or ADMIN_USERS="Name:email:password,Name:email:password".',
    );
  }

  for (const account of accounts) {
    const passwordHash = await hash(account.password, 12);
    await prisma.user.upsert({
      where: { email: account.email },
      update: { passwordHash, name: account.name, isActive: true, role: "ADMIN" },
      create: { email: account.email, passwordHash, name: account.name, role: "ADMIN" },
    });
    console.log(`admin ready: ${account.email}`);
  }

  const configured = new Set(accounts.map((account) => account.email));
  const others = await prisma.user.findMany({ where: { email: { notIn: [...configured] } } });
  for (const user of others) {
    console.log(`note: ${user.email} exists in the database but not in the environment`);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
