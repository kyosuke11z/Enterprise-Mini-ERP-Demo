"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/services/api";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import NeonTrail from "@/components/NeonTrail";

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  imageUrl: string;
  description: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function SalesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const data = await apiRequest("/api/products");
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to load products catalog", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        // Enforce stock bounds
        if (existing.quantity >= product.stock) return prevCart;
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      if (product.stock <= 0) return prevCart;
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: number, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock) return item; // Stock bound
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Computations
  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };
  const getTax = () => Math.round(getSubtotal() * 0.07 * 100) / 100;
  const getTotal = () => getSubtotal() + getTax();

  // Category & search filter
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setCheckoutError(null);
    setCheckoutSuccess(false);

    const payload = {
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    try {
      await apiRequest("/api/sales/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCheckoutSuccess(true);
      setCart([]); // Reset basket
      fetchProducts(); // Refresh catalog stocks
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to process sales order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen relative selection:bg-primary/30 selection:text-primary">
      <NeonTrail />
      <div className="scanlines fixed inset-0 z-10 w-full h-full opacity-30 mix-blend-overlay pointer-events-none" />

      {/* TopNavBar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearchChange={setSearchQuery} />

      <div className="flex h-screen pt-[3.75rem]">
        {/* SideNavBar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main POS Workspace */}
        <main className="flex-1 md:pl-64 flex flex-col md:flex-row bg-background overflow-hidden">
          {/* Catalog Area (Left) */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 shrink-0">
              <div>
                <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">แคตตาล็อกสินค้า</h1>
                <p className="font-body text-sm text-on-surface-variant mt-1">
                  เลือกสินค้าที่ต้องการเพื่อทำรายการจำหน่ายสินค้า (Select items to add to order)
                </p>
              </div>
              <div className="flex gap-2 font-label text-xs uppercase">
                {["All", "Drinks", "Tech", "Peripherals", "Accessories"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-DEFAULT border transition-colors hover:border-secondary hover:text-secondary ${
                      selectedCategory === cat
                        ? "bg-secondary/10 border-secondary text-secondary"
                        : "bg-surface-container-high border-outline-variant text-on-surface"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-8">
              {loading ? (
                <div className="h-64 flex flex-col justify-center items-center gap-4 text-on-surface-variant font-label">
                  <span className="material-symbols-outlined text-4xl animate-spin text-secondary">sync</span>
                  <span className="animate-pulse tracking-widest uppercase text-xs text-secondary neon-text-secondary">LOADING CATALOG...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-on-surface-variant font-label">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                  <span className="mt-2 text-sm uppercase">ไม่พบสินค้าในระบบ</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    return (
                      <div
                        key={product.id}
                        className={`bg-surface-container-high rounded-xl overflow-hidden border transition-all duration-300 group flex flex-col ${
                          isOutOfStock
                            ? "opacity-60 border-outline/30"
                            : "border-outline-variant/50 hover:border-secondary/50 hover:shadow-[0_0_20px_rgba(0,255,204,0.1)]"
                        }`}
                      >
                        <div className="aspect-square w-full relative overflow-hidden bg-surface-dim">
                          {product.imageUrl ? (
                            <img
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                              src={product.imageUrl}
                              alt={product.name}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <span className="material-symbols-outlined text-4xl">image</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur text-secondary font-label text-xs px-2 py-1 rounded border border-secondary/30 neon-text-secondary font-bold">
                            ฿{product.price.toLocaleString()}
                          </div>
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="px-3 py-1 bg-error/25 border border-error text-error text-xs font-label uppercase tracking-widest rounded">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <h3 className="font-headline font-semibold text-on-surface text-sm line-clamp-1 group-hover:text-secondary transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex justify-between items-center mt-2">
                              <span className="font-body text-xs text-on-surface-variant">
                                {product.category} / {product.code}
                              </span>
                              <span className={`font-label text-xs ${product.stock < 10 ? 'text-tertiary font-bold' : 'text-on-surface-variant'}`}>
                                Stock: {product.stock}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={isOutOfStock}
                            className="w-full py-2 bg-background border border-outline text-on-surface font-label text-xs uppercase rounded hover:border-primary hover:text-primary transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">
                              add_shopping_cart
                            </span>
                            เพิ่ม (Add)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cart Sidebar (Right) */}
          <aside className="w-full md:w-[380px] bg-surface-container-lowest border-t md:border-t-0 md:border-l border-primary/20 shadow-[-10px_0_30px_rgba(0,0,0,0.6)] flex flex-col shrink-0 overflow-hidden relative h-[50vh] md:h-full">
            <div className="absolute left-0 top-0 w-[1px] h-full bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0 hidden md:block" />
            
            <div className="p-6 border-b border-outline-variant/30 bg-surface-container shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="font-headline font-bold text-lg text-primary neon-text-primary tracking-tight">
                  ตะกร้าสินค้า <span className="text-xs text-on-surface-variant font-label ml-2">CART</span>
                </h2>
                <span className="bg-surface-dim border border-outline-variant text-on-surface text-xs font-label px-2 py-1 rounded">
                  POS ACTIVE
                </span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-on-surface-variant font-label">
                  <span className="material-symbols-outlined text-4xl">shopping_cart</span>
                  <span className="mt-2 text-xs uppercase">ยังไม่มีสินค้าในตะกร้า</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-surface-container-high border border-outline-variant/50 p-3 rounded-lg flex gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 w-1 h-full bg-secondary/0 group-hover:bg-secondary transition-colors" />
                    <div className="w-12 h-12 bg-surface-dim rounded overflow-hidden shrink-0 border border-outline-variant flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <img className="w-full h-full object-cover opacity-80" src={item.product.imageUrl} alt="" />
                      ) : (
                        <span className="material-symbols-outlined text-outline">image</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h4 className="font-headline text-xs font-semibold text-on-surface line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-outline hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2 bg-surface-dim rounded border border-outline-variant px-1.5 py-0.5">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="text-on-surface-variant hover:text-secondary material-symbols-outlined text-[14px]"
                          >
                            remove
                          </button>
                          <span className="font-label text-xs text-on-surface w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="text-on-surface-variant hover:text-secondary material-symbols-outlined text-[14px]"
                          >
                            add
                          </button>
                        </div>
                        <span className="font-label text-sm text-secondary font-bold">
                          ฿{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Checkout */}
            <div className="bg-surface-container p-6 border-t border-outline-variant/30 mt-auto shrink-0">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="font-body text-on-surface-variant">
                    ยอดรวม <span className="text-[10px] uppercase font-label ml-1">Subtotal</span>
                  </span>
                  <span className="font-label text-on-surface">฿{getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-body text-on-surface-variant">
                    ภาษี <span className="text-[10px] uppercase font-label ml-1">Tax (7%)</span>
                  </span>
                  <span className="font-label text-on-surface">฿{getTax().toLocaleString()}</span>
                </div>
                <div className="h-[1px] w-full bg-outline-variant/50 my-2" />
                <div className="flex justify-between items-end">
                  <span className="font-headline font-bold text-on-surface text-base">
                    ยอดสุทธิ <span className="text-xs text-primary neon-text-primary uppercase font-label ml-1 block">Total</span>
                  </span>
                  <span className="font-label font-bold text-2xl text-secondary neon-text-secondary tracking-tight">
                    ฿{getTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || submitting}
                className="w-full py-4 bg-background border border-primary text-primary font-headline font-bold text-sm uppercase tracking-widest rounded-lg neon-border-primary neon-btn-primary transition-all duration-300 relative overflow-hidden group disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2 neon-text-primary">
                  {submitting ? "กำลังทำรายการ..." : "ชำระเงิน (Checkout)"}
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </span>
              </button>
            </div>
          </aside>
        </main>
      </div>

      {/* Success Modal */}
      {checkoutSuccess && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-sm rounded-xl p-6 border-secondary/50 text-center relative overflow-hidden shadow-[0_0_30px_rgba(0,255,204,0.3)]">
            <span className="material-symbols-outlined text-6xl text-secondary neon-text-secondary animate-bounce">check_circle</span>
            <h3 className="font-headline font-bold text-xl text-on-surface mt-4 uppercase">ชำระเงินสำเร็จ</h3>
            <p className="font-body text-sm text-on-surface-variant mt-2">
              บันทึกการขายและตัดยอดสต๊อกในระบบเรียบร้อยแล้ว (Transaction ACID Committed)
            </p>
            <button
              onClick={() => setCheckoutSuccess(false)}
              className="mt-6 px-6 py-2 bg-background border border-secondary text-secondary font-label text-xs uppercase tracking-widest rounded-DEFAULT neon-border-secondary neon-btn-secondary transition-all"
            >
              ตกลง (OK)
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {checkoutError && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-xl p-6 border-error/50 text-center relative overflow-hidden shadow-[0_0_30px_rgba(255,68,68,0.3)]">
            <span className="material-symbols-outlined text-6xl text-error animate-pulse">error</span>
            <h3 className="font-headline font-bold text-xl text-on-surface mt-4 uppercase">การทำรายการล้มเหลว</h3>
            <p className="font-body text-sm text-error/90 mt-2">
              {checkoutError}
            </p>
            <p className="font-body text-xs text-on-surface-variant mt-1">
              (Database Interactive Transaction Rolled Back)
            </p>
            <button
              onClick={() => setCheckoutError(null)}
              className="mt-6 px-6 py-2 bg-background border border-error text-error font-label text-xs uppercase tracking-widest rounded-DEFAULT hover:bg-error/15 transition-all"
            >
              ปิด (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
