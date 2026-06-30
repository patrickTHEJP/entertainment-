async function seedProducts() {
  const dotenv = await import("dotenv");
  dotenv.config();

  const { PrismaClient } = await import("@prisma/client");
  const { fallbackProducts } = await import("./data/products");

  const prisma = new PrismaClient();

  try {
    console.log("Seeding products...");

    for (const product of fallbackProducts) {
      await prisma.product.upsert({
        where: { name: product.name },
        update: {
          description: product.description,
          price: product.price,
          image: product.imageUrl,
          category: product.category,
          stock: product.stock ?? 0,
        },
        create: {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.imageUrl,
          category: product.category,
          stock: product.stock ?? 0,
        },
      });

      console.log(`✓ Seeded product: ${product.name}`);
    }

    console.log("✔️ Products seeding completed!");
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
