"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Product } from "../../types";
import ProductCard from "../../components/ProductCard";
import Dropdown from "../../components/Dropdown";
import PriceRangeFilter from "../../components/PriceRangeFilter";

const defaultCategories = [{ value: "All", label: "All Categories" }];

const ProductsPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] =
    useState(defaultCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const products: Product[] = await response.json();
        setAllProducts(products);

        // Sync category dropdown with available product categories.
        const uniqueCategories = Array.from(
          new Set(
            products
              .map((product) => product.category?.trim())
              .filter(Boolean) as string[]
          )
        ).sort();
        setCategoryOptions([
          defaultCategories[0],
          ...uniqueCategories.map((category) => ({
            value: category,
            label: category,
          })),
        ]);

        // Update price range based on fetched products
        if (products.length > 0) {
          const min = Math.min(...products.map((p: Product) => p.price));
          const max = Math.max(...products.map((p: Product) => p.price));
          setPriceRange({ min, max });
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice =
        product.price >= priceRange.min && product.price <= priceRange.max;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, priceRange, allProducts]);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Our Products
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our premium selection of pet care products designed to keep
            your furry friends happy and healthy.
          </p>
        </div>

        {/* Search Bar and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <label className="flex flex-col w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    🔍
                  </div>
                  <input
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              {/* Category Filter */}
              <div className="w-48">
                <Dropdown
                  options={categoryOptions}
                  selectedValue={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Category"
                />
              </div>

              {/* Price Range Filter */}
              <div className="w-64">
                <PriceRangeFilter
                  minPrice={priceRange.min}
                  maxPrice={priceRange.max}
                  onPriceChange={(min, max) => setPriceRange({ min, max })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
