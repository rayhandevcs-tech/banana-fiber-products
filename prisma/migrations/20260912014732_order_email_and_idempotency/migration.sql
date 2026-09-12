-- Guest checkout needs somewhere to keep an optional email, and a way to tell
-- a retried submission apart from a second order.
--
-- Written by hand rather than taken from `prisma migrate diff`, which also
-- emitted `ALTER TABLE "products" ALTER COLUMN "effectivePricePoisha" DROP
-- DEFAULT`. That column is `GENERATED ALWAYS AS ... STORED` (see the
-- add_effective_price_column migration); Prisma reads it as an ordinary
-- nullable Int and mistakes it for a column carrying a default. Postgres
-- rejects the statement, and applying it would fail the migration, so only
-- the two intended changes are here.
ALTER TABLE "orders"
  ADD COLUMN "customerEmail" TEXT,
  ADD COLUMN "idempotencyKey" TEXT;

-- Unique, so a repeated submission of the same checkout attempt collides
-- instead of creating a second order. Nullable columns may repeat NULL in
-- Postgres, so orders created without a key (admin or phone orders later) are
-- unaffected.
CREATE UNIQUE INDEX "orders_idempotencyKey_key" ON "orders"("idempotencyKey");
