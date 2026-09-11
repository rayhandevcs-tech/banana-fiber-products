-- The price a customer actually pays, computed by the database.
--
-- Written by hand rather than taking Prisma's generated `ADD COLUMN ... NOT
-- NULL` (which cannot be applied to a table that already has rows): a STORED
-- generated column backfills every existing row and keeps recomputing itself
-- on every future insert and update, so it can never disagree with the two
-- columns it is derived from.
--
-- It exists so the shop's price filter and price sort operate on the price
-- shown on the product card. Prisma can neither filter nor order by an
-- expression, and sorting by the list price alone puts a discounted TK 550
-- product below an undiscounted TK 560 one.
--
-- Never write to this column: Postgres rejects any INSERT or UPDATE that
-- supplies a value for it.
ALTER TABLE "products"
  ADD COLUMN "effectivePricePoisha" INTEGER
  GENERATED ALWAYS AS ("pricePoisha" - "discountPoisha") STORED;

-- The storefront predicate: every shop query filters on isActive + deletedAt,
-- and the default listing orders by price.
CREATE INDEX "products_isActive_deletedAt_effectivePricePoisha_idx"
  ON "products"("isActive", "deletedAt", "effectivePricePoisha");
