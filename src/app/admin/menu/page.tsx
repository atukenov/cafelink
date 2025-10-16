"use client";

import { apiClient } from "@/lib/api";
import { AdditionalItem, Product } from "@/lib/types";
import { ArrowLeft, Coffee, Edit, Package, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminMenuPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    role: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "additionals">(
    "products"
  );
  const [showProductForm, setShowProductForm] = useState(false);
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingAdditional, setEditingAdditional] =
    useState<AdditionalItem | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    imageUrl: "",
    additionalItems: [] as string[],
  });
  const [additionalForm, setAdditionalForm] = useState({
    name: "",
    price: "",
    productId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/admin/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!["admin", "administrator", "author"].includes(parsedUser.role)) {
      router.push("/admin/login");
      return;
    }

    setUser(parsedUser);
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [productsData, additionalsData] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getAdditionalItems(),
      ]);
      setProducts(productsData);
      setAdditionalItems(additionalsData);
    } catch (err) {
      setError("Failed to load menu data");
      console.error("Error loading menu data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !productForm.name.trim() ||
      !productForm.price ||
      !productForm.imageUrl.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const coffeeShopId = localStorage.getItem("selectedShopId");
    if (!coffeeShopId) {
      setError("No coffee shop selected");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = {
        name: productForm.name.trim(),
        price: parseFloat(productForm.price),
        imageUrl: productForm.imageUrl.trim(),
        additionalItems: productForm.additionalItems,
        coffeeShopId,
      };

      if (editingProduct) {
        await apiClient.updateProduct(editingProduct._id, data);
      } else {
        await apiClient.createProduct(data);
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        price: "",
        imageUrl: "",
        additionalItems: [],
      });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdditionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!additionalForm.name.trim() || !additionalForm.price) {
      setError("Please fill in all required fields");
      return;
    }

    const coffeeShopId = localStorage.getItem("selectedShopId");
    if (!coffeeShopId) {
      setError("No coffee shop selected");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = {
        name: additionalForm.name.trim(),
        price: parseFloat(additionalForm.price),
        productId: additionalForm.productId || undefined,
        coffeeShopId,
      };

      if (editingAdditional) {
        await apiClient.updateAdditionalItem(editingAdditional._id, data);
      } else {
        await apiClient.createAdditionalItem(data);
      }

      setShowAdditionalForm(false);
      setEditingAdditional(null);
      setAdditionalForm({ name: "", price: "", productId: "" });
      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to save additional item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiClient.deleteProduct(id);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleDeleteAdditional = async (id: string) => {
    if (!confirm("Are you sure you want to delete this additional item?"))
      return;

    try {
      await apiClient.deleteAdditionalItem(id);
      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete additional item"
      );
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      additionalItems:
        product.additionalItems?.map((item) =>
          typeof item === "string" ? item : item._id
        ) || [],
    });
    setShowProductForm(true);
  };

  const startEditAdditional = (additional: AdditionalItem) => {
    setEditingAdditional(additional);
    setAdditionalForm({
      name: additional.name,
      price: additional.price.toString(),
      productId: additional.productId || "",
    });
    setShowAdditionalForm(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Menu Management</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "products"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("additionals")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "additionals"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Additional Items
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Products</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {showProductForm && (
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Product name"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₸) *
                    </label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      value={productForm.imageUrl}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg"
                    >
                      {submitting
                        ? "Saving..."
                        : editingProduct
                        ? "Update"
                        : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                        setProductForm({
                          name: "",
                          price: "",
                          imageUrl: "",
                          additionalItems: [],
                        });
                        setError(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No products yet
                </h3>
                <p className="text-gray-600">
                  Add your first product to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl shadow-sm p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-amber-600">
                          {product.price} ₸
                        </p>
                        {product.additionalItems &&
                          product.additionalItems.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {product.additionalItems.length} additional items
                            </p>
                          )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "additionals" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Additional Items
              </h2>
              <button
                onClick={() => setShowAdditionalForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {showAdditionalForm && (
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  {editingAdditional
                    ? "Edit Additional Item"
                    : "Add New Additional Item"}
                </h3>
                <form onSubmit={handleAdditionalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={additionalForm.name}
                      onChange={(e) =>
                        setAdditionalForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional item name"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₸) *
                    </label>
                    <input
                      type="number"
                      value={additionalForm.price}
                      onChange={(e) =>
                        setAdditionalForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Associated Product (Optional)
                    </label>
                    <select
                      value={additionalForm.productId}
                      onChange={(e) =>
                        setAdditionalForm((prev) => ({
                          ...prev,
                          productId: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submitting}
                    >
                      <option value="">General (all products)</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg"
                    >
                      {submitting
                        ? "Saving..."
                        : editingAdditional
                        ? "Update"
                        : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdditionalForm(false);
                        setEditingAdditional(null);
                        setAdditionalForm({
                          name: "",
                          price: "",
                          productId: "",
                        });
                        setError(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading additional items...</p>
              </div>
            ) : additionalItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No additional items yet
                </h3>
                <p className="text-gray-600">
                  Add customization options for your products
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {additionalItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-lg font-bold text-amber-600">
                          +{item.price} ₸
                        </p>
                        {item.productId && (
                          <p className="text-xs text-gray-500">
                            For:{" "}
                            {products.find((p) => p._id === item.productId)
                              ?.name || "Unknown product"}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditAdditional(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdditional(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
