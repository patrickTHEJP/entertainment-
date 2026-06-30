"use client";

import React from "react";
import type { Product } from "@/types";
import { useCart } from "@/app/providers";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering any parent click handlers
    addToCart(product);
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-100 hover:border-green-100">
      {/* Product Image Placeholder */}
      <div className="relative w-full h-48 bg-black flex items-center justify-center">
        <span className="text-white text-sm font-medium">Product Image</span>
      </div>

      {/* Product Details */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2">
            {product.category}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {product.description ||
            `High-quality ${product.category.toLowerCase()} product for your pet.`}
        </p>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-1"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
