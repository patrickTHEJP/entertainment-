import type { Product } from "@/types";
import productData from "./products.json";

type ProductSeed = Product & { stock?: number };

export const fallbackProducts: ProductSeed[] = productData;

export default fallbackProducts;

