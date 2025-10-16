"use client";

import { ActionButton, EmptyState, ListItem, PageHeader } from "@/components/common";
import { apiClient } from "@/lib/api";
import { AdditionalItem, Product } from "@/lib/types";
import { Coffee, Edit, Package, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
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
      <EmptyState
        icon={Coffee}
        title="Loading..."
        description="Please wait while we load your data"
        className="min-h-screen"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Menu Management"
        backHref="/admin/dashboard"
        rightElement={
          <ActionButton
            icon={Plus}
            label={activeTab === "products" ? "Add Product" : "Add Item"}
            variant="primary"
            onClick={() => 
              activeTab === "products" 
                ? setShowProductForm(true)
                : setShowAdditionalForm(true)
            }
          />
        }
      />

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
                    <ActionButton
                      icon={Plus}
                      label={submitting ? "Saving..." : editingProduct ? "Update" : "Create"}
                      variant="primary"
                      onClick={() => {}} // submit will be handled by the form
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    />
                    <ActionButton
                      icon={Trash2}
                      label="Cancel"
                      variant="secondary"
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
                    />
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <EmptyState
                icon={Coffee}
                title="Loading products..."
                description="Please wait while we fetch the menu items"
              />
            ) : products.length === 0 ? (
              <EmptyState
                icon={Coffee}
                title="No products yet"
                description="Add your first product to get started"
                action={{
                  label: "Add First Product",
                  onClick: () => setShowProductForm(true)
                }}
              />
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <ListItem
                    key={product._id}
                    title={product.name}
                    subtitle={`${product.price} ₸`}
                    description={product.additionalItems?.length ? 
                      `${product.additionalItems.length} additional items` : 
                      undefined}
                    leftElement={
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    }
                    rightElement={
                      <div className="flex gap-2">
                        <ActionButton
                          icon={Edit}
                          label="Edit"
                          variant="secondary"
                          onClick={() => startEditProduct(product)}
                        />
                        <ActionButton
                          icon={Trash2}
                          label="Delete"
                          variant="danger"
                          onClick={() => handleDeleteProduct(product._id)}
                        />
                      </div>
                    }
                    className="bg-white rounded-xl shadow-sm"
                  />
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
                    <ActionButton
                      icon={Plus}
                      label={submitting ? "Saving..." : editingAdditional ? "Update" : "Create"}
                      variant="primary"
                      onClick={() => {}} // submit will be handled by the form
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    />
                    <ActionButton
                      icon={Trash2}
                      label="Cancel"
                      variant="secondary"
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
                    />
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <EmptyState
                icon={Package}
                title="Loading additional items..."
                description="Please wait while we fetch the items"
              />
            ) : additionalItems.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No additional items yet"
                description="Add customization options for your products"
                action={{
                  label: "Add First Item",
                  onClick: () => setShowAdditionalForm(true)
                }}
              />
            ) : (
              <div className="space-y-3">
                {additionalItems.map((item) => (
                  <ListItem
                    key={item._id}
                    title={item.name}
                    subtitle={`+${item.price} ₸`}
                    description={item.productId ? 
                      `For: ${products.find((p) => p._id === item.productId)?.name || "Unknown product"}` : 
                      undefined}
                    leftIcon={Package}
                    rightElement={
                      <div className="flex gap-2">
                        <ActionButton
                          icon={Edit}
                          label="Edit"
                          variant="secondary"
                          onClick={() => startEditAdditional(item)}
                        />
                        <ActionButton
                          icon={Trash2}
                          label="Delete"
                          variant="danger"
                          onClick={() => handleDeleteAdditional(item._id)}
                        />
                      </div>
                    }
                    className="bg-white rounded-xl shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
