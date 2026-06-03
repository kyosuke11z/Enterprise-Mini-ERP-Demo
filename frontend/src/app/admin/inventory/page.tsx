"use client";

import React, { useState, useEffect } from "react";
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

interface Order {
  id: number;
  orderNumber: string;
  total: number;
  createdAt: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Tech");
  const [formStock, setFormStock] = useState(0);
  const [formPrice, setFormPrice] = useState(0);
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      const pData = await apiRequest("/api/products");
      if (Array.isArray(pData)) setProducts(pData);
      
      const oData = await apiRequest("/api/sales/orders");
      if (Array.isArray(oData)) setOrders(oData);
    } catch (err) {
      console.error("Failed to load inventory assets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAdd = () => {
    setErrorMsg(null);
    setFormCode("");
    setFormName("");
    setFormCategory("Tech");
    setFormStock(10);
    setFormPrice(100);
    setFormImage("");
    setFormDescription("");
    setShowAddModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      code: formCode,
      name: formName,
      category: formCategory,
      stock: Number(formStock),
      price: Number(formPrice),
      imageUrl: formImage,
      description: formDescription,
    };

    try {
      await apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setShowAddModal(false);
      fetchInventory();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add product");
    }
  };

  const openEdit = (product: Product) => {
    setErrorMsg(null);
    setSelectedProduct(product);
    setFormCode(product.code);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormStock(product.stock);
    setFormPrice(product.price);
    setFormImage(product.imageUrl);
    setFormDescription(product.description);
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setErrorMsg(null);

    const payload = {
      code: formCode,
      name: formName,
      category: formCategory,
      stock: Number(formStock),
      price: Number(formPrice),
      imageUrl: formImage,
      description: formDescription,
    };

    try {
      await apiRequest(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setShowEditModal(false);
      fetchInventory();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update product");
    }
  };

  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await apiRequest(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      setShowDeleteModal(false);
      fetchInventory();
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  // Computations
  const getLowStockCount = () => {
    return products.filter((p) => p.stock < 10).length;
  };

  const getSalesToday = () => {
    // Sum total of orders created today
    const today = new Date().toDateString();
    return orders
      .filter((o) => new Date(o.createdAt).toDateString() === today)
      .reduce((sum, o) => sum + o.total, 0);
  };

  const filteredProducts = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="bg-background text-on-background font-body tech-pattern min-h-screen relative selection:bg-primary/30 selection:text-primary">
      <NeonTrail />
      <div className="scanlines fixed inset-0 z-10 w-full h-full opacity-35 mix-blend-overlay pointer-events-none" />

      {/* TopNavBar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearchChange={setSearchQuery} />

      <div className="flex pt-[3.75rem]">
        {/* SideNavBar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 md:p-10 z-20 relative flex flex-col gap-8 pb-32">
          {/* Header */}
          <header className="mb-4">
            <h1 className="font-headline text-3xl font-bold text-on-surface">การจัดการคลังสินค้า</h1>
            <p className="font-body text-on-surface-variant mt-2 text-sm">
              ภาพรวมและสถานะสินค้าคงคลังแบบเรียลไทม์ (Real-time Inventory Control Room)
            </p>
          </header>

          {/* Bento Grid Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1 */}
            <div className="bg-surface-container border border-primary/20 rounded-xl p-6 shadow-[inset_0_0_20px_rgba(255,45,120,0.05)] relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-secondary">inventory_2</span>
              </div>
              <div className="font-label text-xs text-on-surface-variant mb-2 uppercase tracking-wider">สินค้าในระบบทั้งหมด</div>
              <div className="font-headline text-4xl font-bold text-secondary neon-text-secondary">
                {products.length}
              </div>
              <div className="font-body text-xs text-on-surface-variant mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">trending_up</span>
                <span className="text-secondary font-bold">ACTIVE DATABASE SEED</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-surface-container border border-tertiary/30 rounded-xl p-6 shadow-[inset_0_0_20px_rgba(255,224,74,0.05)] relative overflow-hidden group hover:border-tertiary/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-tertiary">warning</span>
              </div>
              <div className="font-label text-xs text-on-surface-variant mb-2 uppercase tracking-wider">สินค้าคงเหลือน้อย (Stock &lt; 10)</div>
              <div className="font-headline text-4xl font-bold text-tertiary neon-text-tertiary">
                {getLowStockCount()}
              </div>
              <div className="font-body text-xs text-on-surface-variant mt-3 flex items-center gap-1">
                <span className="text-tertiary font-bold">ต้องการการจัดซื้อ/เติมสต๊อก</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-surface-container border border-primary/20 rounded-xl p-6 shadow-[inset_0_0_20px_rgba(255,45,120,0.05)] relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">point_of_sale</span>
              </div>
              <div className="font-label text-xs text-on-surface-variant mb-2 uppercase tracking-wider">ยอดขายประจำวันนี้</div>
              <div className="font-headline text-4xl font-bold text-primary neon-text-primary">
                ฿{getSalesToday().toLocaleString()}
              </div>
              <div className="font-body text-xs text-on-surface-variant mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">analytics</span>
                <span className="text-primary font-bold">ACID ORDER BOOK</span>
              </div>
            </div>
          </div>

          {/* Sales Performance Chart (SVG vector drawing) */}
          <div className="bg-surface-container border border-primary/20 rounded-xl p-6 shadow-[inset_0_0_20px_rgba(255,45,120,0.05)] relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">monitoring</span>
                  สรุปยอดขายรายเดือน
                </h2>
                <p className="font-body text-xs text-on-surface-variant">สถิติผลการดำเนินงานประจำปี (Interactive Graph Matrix)</p>
              </div>
              <div className="flex items-center gap-4 font-label text-xs">
                <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_#ff2d78]" />
                <span className="text-on-surface-variant">ยอดขายรายเดือน (฿)</span>
              </div>
            </div>

            <div className="h-64 w-full relative pt-4">
              <div className="absolute inset-0 flex flex-col justify-between border-b border-l border-outline-variant/30">
                <div className="w-full h-[1px] bg-outline-variant/10" />
                <div className="w-full h-[1px] bg-outline-variant/10" />
                <div className="w-full h-[1px] bg-outline-variant/10" />
                <div className="w-full h-[1px] bg-outline-variant/10" />
              </div>

              {/* Glowing SVG Path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff2d78" />
                    <stop offset="100%" stopColor="#00ffcc" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,150 L83,140 L166,160 L249,120 L332,100 L415,110 L498,70 L581,85 L664,50 L747,65 L830,40 L913,30 L1000,20"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0px 0px 8px #ff2d78)" }}
                />
                <path
                  d="M0,150 L83,140 L166,160 L249,120 L332,100 L415,110 L498,70 L581,85 L664,50 L747,65 L830,40 L913,30 L1000,20 L1000,200 L0,200 Z"
                  fill="url(#lineGrad)"
                  fillOpacity="0.04"
                />
                <circle cx="166" cy="160" r="4.5" fill="#ff2d78" />
                <circle cx="498" cy="70" r="4.5" fill="#ff2d78" />
                <circle cx="830" cy="40" r="4.5" fill="#00ffcc" />
              </svg>
            </div>
            <div className="flex justify-between mt-4 px-2 font-label text-[10px] text-on-surface-variant uppercase tracking-tighter">
              {["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* Product List Table */}
          <div className="bg-surface-container/80 backdrop-blur-sm neon-border-glow rounded-xl overflow-hidden">
            <div className="p-6 border-b border-primary/20 flex justify-between items-center">
              <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">list_alt</span>
                รายการสินค้าคลัง
              </h2>
              <button
                onClick={openAdd}
                className="bg-surface-dim border border-primary text-primary font-label text-xs uppercase tracking-widest px-4 py-2 rounded hover:bg-primary/10 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                เพิ่มสินค้าใหม่
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-dim/50 border-b border-primary/20 font-label text-xs uppercase tracking-wider text-on-surface-variant">
                    <th className="p-4 pl-6">รูปภาพ</th>
                    <th className="p-4">ชื่อสินค้า / รหัส</th>
                    <th className="p-4">หมวดหมู่</th>
                    <th className="p-4">คงเหลือ</th>
                    <th className="p-4">ราคา</th>
                    <th className="p-4 pr-6 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm divide-y divide-primary/10">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-bright/30 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="w-12 h-12 rounded bg-surface border border-outline-variant overflow-hidden flex items-center justify-center">
                          {product.imageUrl ? (
                            <img className="w-full h-full object-cover opacity-80" src={product.imageUrl} alt="" />
                          ) : (
                            <span className="material-symbols-outlined text-outline">image</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-on-surface">{product.name}</div>
                        <div className="text-xs text-on-surface-variant font-label mt-1">{product.code}</div>
                      </td>
                      <td className="p-4 text-on-surface-variant">{product.category}</td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-label ${
                          product.stock === 0
                            ? "bg-error/10 border border-error/30 text-error"
                            : product.stock < 10
                            ? "bg-tertiary/10 border border-tertiary/30 text-tertiary"
                            : "bg-secondary/10 border border-secondary/30 text-secondary"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            product.stock === 0 ? 'bg-error' : product.stock < 10 ? 'bg-tertiary' : 'bg-secondary'
                          }`} />
                          {product.stock} ชิ้น
                        </div>
                      </td>
                      <td className="p-4 text-on-surface">฿{product.price.toLocaleString()}</td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-on-surface-variant hover:text-secondary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => openDelete(product)}
                          className="p-1.5 text-on-surface-variant hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-xl p-6 border-primary/40 shadow-[0_0_30px_rgba(255,45,120,0.2)]">
            <h3 className="font-headline font-bold text-lg text-primary neon-text-primary uppercase mb-4">เพิ่มสินค้าใหม่</h3>
            {errorMsg && <p className="text-error text-xs font-label mb-3">{errorMsg}</p>}
            <form onSubmit={handleAdd} className="space-y-4 font-label text-sm text-on-surface">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">รหัสสินค้า (Product Code)</label>
                <input required value={formCode} onChange={(e) => setFormCode(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" placeholder="เช่น PRD-006" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">ชื่อสินค้า (Product Name)</label>
                <input required value={formName} onChange={(e) => setFormName(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">หมวดหมู่ (Category)</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface">
                  <option value="Tech">Tech</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">จำนวนสต๊อก (Stock)</label>
                  <input required value={formStock} onChange={(e) => setFormStock(Number(e.target.value))} type="number" min="0" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">ราคา (Price ฿)</label>
                  <input required value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} type="number" min="0" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">ลิ้งค์รูปภาพ (Image URL)</label>
                <input value={formImage} onChange={(e) => setFormImage(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">คำอธิบาย (Description)</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" rows={2} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-outline text-on-surface-variant rounded hover:text-on-surface">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-primary/20 border border-primary text-primary rounded hover:bg-primary/30">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-xl p-6 border-secondary/40 shadow-[0_0_30px_rgba(0,255,204,0.2)]">
            <h3 className="font-headline font-bold text-lg text-secondary neon-text-secondary uppercase mb-4">แก้ไขข้อมูลสินค้า</h3>
            {errorMsg && <p className="text-error text-xs font-label mb-3">{errorMsg}</p>}
            <form onSubmit={handleEdit} className="space-y-4 font-label text-sm text-on-surface">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">รหัสสินค้า (Product Code)</label>
                <input required value={formCode} onChange={(e) => setFormCode(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">ชื่อสินค้า (Product Name)</label>
                <input required value={formName} onChange={(e) => setFormName(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">หมวดหมู่ (Category)</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface">
                  <option value="Tech">Tech</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">จำนวนสต๊อก (Stock)</label>
                  <input required value={formStock} onChange={(e) => setFormStock(Number(e.target.value))} type="number" min="0" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">ราคา (Price ฿)</label>
                  <input required value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} type="number" min="0" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">ลิ้งค์รูปภาพ (Image URL)</label>
                <input value={formImage} onChange={(e) => setFormImage(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">คำอธิบาย (Description)</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" rows={2} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-outline text-on-surface-variant rounded hover:text-on-surface">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-secondary/20 border border-secondary text-secondary rounded hover:bg-secondary/30">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-xl p-6 border-error/50 shadow-[0_0_20px_rgba(255,68,68,0.2)] text-center">
            <span className="material-symbols-outlined text-5xl text-error">delete_forever</span>
            <h3 className="font-headline font-bold text-lg text-on-surface mt-3">ยืนยันการลบสินค้า?</h3>
            <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
              คุณต้องการลบสินค้า <span className="text-error font-bold">{selectedProduct.name}</span> หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-center gap-2 mt-6 font-label text-xs">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-outline rounded text-on-surface-variant hover:text-on-surface">ยกเลิก</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-error/20 border border-error text-error rounded hover:bg-error/35">ยืนยันการลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
