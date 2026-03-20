import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  ShoppingCart,
  Zap,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOutletContext } from 'react-router-dom';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  min_stock: number;
  status: string;
}

const Inventory = () => {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Chemicals',
    stock: 0,
    unit: 'Liters',
    min_stock: 10
  });

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewItem({ name: '', category: 'Chemicals', stock: 0, unit: 'Liters', min_stock: 10 });
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to add inventory item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
    }
  };

  const safeInventory = Array.isArray(inventory) ? inventory : [];

  const filteredInventory = safeInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = safeInventory.filter(i => i.stock < i.min_stock && i.stock > 0).length;
  const outOfStockCount = safeInventory.filter(i => i.stock <= 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-sm text-slate-500">Track stock levels, supplies, and restock requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Items', value: safeInventory.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Out of Stock', value: outOfStockCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Units in Stock', value: safeInventory.reduce((acc, curr) => acc + (curr.stock || 0), 0), icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            Stock Levels
          </h3>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{filteredInventory.length} Items</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No inventory found</h3>
            <p className="text-slate-500 mt-2">
              {searchQuery ? `No items match "${searchQuery}"` : "Add your first inventory item to start tracking supplies."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Item Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Stock Level</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const isLow = item.stock < item.min_stock && item.stock > 0;
                  const isOut = item.stock <= 0;
                  const status = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">ID: {item.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-bold text-slate-900">{item.stock} {item.unit}</p>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${status === 'In Stock' ? 'bg-emerald-500' :
                                  status === 'Low Stock' ? 'bg-amber-500' :
                                    'bg-red-500'
                                }`}
                              style={{ width: `${Math.min((item.stock / (item.min_stock * 2)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                            status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add Inventory Item</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Item Name</label>
                  <input
                    required
                    type="text"
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Multi-Surface Cleaner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                    <select
                      value={newItem.category}
                      onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 outline-none"
                    >
                      <option>Chemicals</option>
                      <option>Supplies</option>
                      <option>Equipment</option>
                      <option>Safety</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Unit</label>
                    <select
                      value={newItem.unit}
                      onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 outline-none"
                    >
                      <option>Liters</option>
                      <option>Units</option>
                      <option>Packs</option>
                      <option>Pairs</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Initial Stock</label>
                    <input
                      required
                      type="number"
                      value={newItem.stock}
                      onChange={e => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Min Stock (Alert)</label>
                    <input
                      required
                      type="number"
                      value={newItem.min_stock}
                      onChange={e => setNewItem({ ...newItem, min_stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={isSubmitting}
                    className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Inventory Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
