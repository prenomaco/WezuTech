/**
 * Dashboard accounts, read from the environment.
 *
 * Two forms, both optional and both additive:
 *
 *   ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD   a single account, as before
 *   ADMIN_USERS="Name:email:password,..."  any number of them
 *
 * A colon-separated triple keeps the file readable and lets an address be
 * added without touching code or the database. Passwords are only ever read
 * here and hashed before they are stored; nothing keeps the plaintext.
 */
export interface AdminAccount {
  readonly email: string;
  readonly password: string;
  readonly name: string | null;
}

function parseList(value: string | undefined): AdminAccount[] {
  if (!value?.trim()) return [];

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      /* Split from the left twice only, so a password may contain colons. */
      const separator = entry.indexOf(":");
      const second = entry.indexOf(":", separator + 1);
      if (separator === -1 || second === -1) {
        throw new Error(`ADMIN_USERS entry "${entry}" is not "name:email:password".`);
      }
      const name = entry.slice(0, separator).trim();
      const email = entry.slice(separator + 1, second).trim().toLowerCase();
      const password = entry.slice(second + 1);
      if (!email.includes("@") || !password) {
        throw new Error(`ADMIN_USERS entry "${entry}" is missing an email or a password.`);
      }
      return { email, password, name: name || null };
    });
}

export function adminAccountsFromEnv(source: NodeJS.ProcessEnv): AdminAccount[] {
  const accounts = parseList(source.ADMIN_USERS);

  const email = source.ADMIN_EMAIL?.trim().toLowerCase();
  const password = source.ADMIN_INITIAL_PASSWORD;
  if (email && password && !accounts.some((account) => account.email === email)) {
    accounts.push({ email, password, name: source.ADMIN_NAME?.trim() || null });
  }

  return accounts;
}
