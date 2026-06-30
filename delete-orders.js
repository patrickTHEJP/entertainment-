async function deleteAllOrders() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    // First, delete all order items
    await prisma.orderItem.deleteMany({});
    console.log("All order items deleted successfully");

    // Then, delete all orders
    await prisma.order.deleteMany({});
    console.log("All orders deleted successfully");

    console.log("All purchase histories have been deleted");
  } catch (error) {
    console.error("Error deleting orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllOrders();
