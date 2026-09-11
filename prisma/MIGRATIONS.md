# Working with migrations on this project

The database is Neon, and `DATABASE_URL` points at the **production** branch.
There is no separate development database, which makes two ordinary Prisma
commands destructive here.

## Never pass `DATABASE_URL` as a shadow database

```
# DESTRUCTIVE. Prisma DROPS EVERYTHING in a shadow database before using it.
npx prisma migrate diff --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "$DATABASE_URL"      # <- wipes production
```

This was run once, on 2026-09-12, and emptied all eight tables. The data came
back from `npm run db:backup` and nothing was lost, but the migration history
table was gone and had to be rebuilt.

To compare the live database against the schema you do not need a shadow
database at all:

```
npx prisma migrate diff --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma --script
```

Empty output means they agree. If you genuinely need to verify that the
migration *files* reproduce the schema, create a throwaway Neon branch and
pass that branch's URL as the shadow database, never the main one.

## `migrate dev` is also unsafe here

`prisma migrate dev` resets the database whenever it finds drift, so it must
not be pointed at production either. The working pattern for a schema change
on this project:

1. `npm run db:backup`
2. Edit `prisma/schema.prisma`.
3. Generate the delta and **read it** before applying:
   ```
   mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_my_change
   npx prisma migrate diff --from-url "$DATABASE_URL" \
     --to-schema-datamodel prisma/schema.prisma --script \
     > prisma/migrations/<that folder>/migration.sql
   ```
   Check it for `DROP` and `TRUNCATE` outside `ON DELETE CASCADE` clauses.
4. `npx prisma db execute --file <that file> --schema prisma/schema.prisma`
5. `npx prisma migrate resolve --applied <that folder name>`
6. `npx prisma generate`

## Backups

- `npm run db:backup` writes a full JSON snapshot per table to
  `.backups/<timestamp>/`. Gitignored: the `Lead` table holds names and email
  addresses.
- `npm run db:restore` restores the newest snapshot, or
  `npm run db:restore -- <folder>` a named one. Rows are upserted by id, so a
  restore repairs what the snapshot covers and leaves anything created since
  alone.
- `_prisma_migrations` is **not** in the snapshot. If it is ever lost, rebuild
  it by running `npx prisma migrate resolve --applied <name>` once per folder
  in `prisma/migrations`, oldest first. That also re-records each checksum
  from the current file, which is how the pre-existing drift on
  `20260909000000_product_details_and_testimonials` was finally cleared.
