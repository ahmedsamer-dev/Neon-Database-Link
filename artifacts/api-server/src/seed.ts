import {
  db,
  productsTable,
  variantsTable,
  pool,
} from "@workspace/db";

async function main() {
  const existing = await db.select().from(productsTable);
  if (existing.length > 0) {
    console.log("Already seeded; skipping.");
    await pool.end();
    return;
  }

  const products = [
    {
      name: "Calm Oversized Tee",
      description:
        "An everyday tee in heavyweight organic cotton, cut for an easy oversized drape. Pre-washed for a soft hand and a settled feel.",
      basePrice: "48.00",
      images: ["/seed/calm-tee-cream.png", "/seed/calm-tee-sage.png"],
      variants: [
        { size: "S", color: "Cream", price: "48.00", stock: 8 },
        { size: "M", color: "Cream", price: "48.00", stock: 12 },
        { size: "L", color: "Cream", price: "48.00", stock: 6 },
        { size: "S", color: "Sage", price: "48.00", stock: 5 },
        { size: "M", color: "Sage", price: "48.00", stock: 10 },
        { size: "L", color: "Sage", price: "48.00", stock: 4 },
      ],
    },
    {
      name: "Intent Hoodie",
      description:
        "A grounded, mid-weight hoodie with a relaxed silhouette. Brushed inside, quiet outside.",
      basePrice: "94.00",
      images: ["/seed/intent-hoodie.png"],
      variants: [
        { size: "S", color: "Stone", price: "94.00", stock: 4 },
        { size: "M", color: "Stone", price: "94.00", stock: 7 },
        { size: "L", color: "Stone", price: "94.00", stock: 5 },
        { size: "XL", color: "Stone", price: "94.00", stock: 3 },
      ],
    },
    {
      name: "Stillness Linen Trousers",
      description:
        "Wide, drapey linen trousers with a relaxed waist. Made for slow afternoons.",
      basePrice: "112.00",
      images: ["/seed/stillness-pants.png"],
      variants: [
        { size: "S", color: "Sand", price: "112.00", stock: 4 },
        { size: "M", color: "Sand", price: "112.00", stock: 6 },
        { size: "L", color: "Sand", price: "112.00", stock: 3 },
      ],
    },
    {
      name: "Quiet Knit Beanie",
      description:
        "A soft merino-blend beanie with a slouchy fold. Made to take everywhere.",
      basePrice: "32.00",
      images: ["/seed/quiet-beanie.png"],
      variants: [
        { size: "OS", color: "Off-white", price: "32.00", stock: 15 },
        { size: "OS", color: "Sage", price: "32.00", stock: 9 },
      ],
    },
  ];

  for (const p of products) {
    const [inserted] = await db
      .insert(productsTable)
      .values({
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        images: p.images,
        isActive: true,
      })
      .returning();
    if (!inserted) continue;
    await db.insert(variantsTable).values(
      p.variants.map((v) => ({ ...v, productId: inserted.id })),
    );
  }

  console.log("Seeded.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
