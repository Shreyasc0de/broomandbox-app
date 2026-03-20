import React, { useState, useMemo, useEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  User,
  Calendar,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOutletContext } from 'react-router-dom';

interface Job {
  id: string;
  customer_name: string;
  service: string;
  status: string;
  date: string;
  time: string;
  staff_name: string;
  location: string;
  price: number;
}

const columnHelper = createColumnHelper<Job>();

const Jobs = () => {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newJob, setNewJob] = useState({
    customer_name: '',
    service: 'Deep Cleaning',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    staff_name: '',
    location: '',
    price: 150
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const jobs = await res.json();
      setData(Array.isArray(jobs) ? jobs : []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewJob({
          customer_name: '',
          service: 'Deep Cleaning',
          date: new Date().toISOString().split('T')[0],
          time: '09:00 AM',
          staff_name: '',
          location: '',
          price: 150
        });
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'Job ID',
      cell: info => <span className="font-bold text-slate-900">{(info.getValue() || '').slice(0, 8)}</span>,
    }),
    columnHelper.accessor('customer_name', {
      header: 'Customer',
      cell: info => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs text-uppercase">
            {info.getValue()?.split(' ').map(n => n[0]).join('') || '?'}
          </div>
          <span className="font-medium text-slate-700">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('service', {
      header: 'Service',
      cell: info => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const colors: Record<string, string> = {
          'Completed': 'bg-emerald-100 text-emerald-700',
          'In Progress': 'bg-blue-100 text-blue-700',
          'Scheduled': 'bg-amber-100 text-amber-700',
          'Cancelled': 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
            {status}
          </span>
        );
      },
    }),
    columnHelper.accessor('date', {
      header: 'Date & Time',
      cell: info => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-700">{info.getValue()}</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{info.row.original.time}</span>
        </div>
      ),
    }),
    columnHelper.accessor('staff_name', {
      header: 'Staff',
      cell: info => <span className="text-slate-600 font-medium">{info.getValue() || 'Unassigned'}</span>,
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => <span className="font-bold text-slate-900">${Number(info.getValue() || 0).toFixed(2)}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (props) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDeleteJob(props.row.original.id)}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ], []);

  const safeData = Array.isArray(data) ? data : [];

  const filteredData = useMemo(() => {
    return safeData.filter(job =>
      job.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [safeData, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs Management</h1>
          <p className="text-sm text-slate-500">View and manage all cleaning jobs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Create New Job
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No jobs found</h3>
            <p className="text-slate-500 mt-2">
              {searchQuery ? `No jobs match "${searchQuery}"` : "Create your first cleaning job to start tracking services."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-100">
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-900">{table.getRowModel().rows.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Job Modal */}
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
                <h2 className="text-xl font-bold text-slate-900">Create New Job</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Customer Name</label>
                  <input
                    required
                    type="text"
                    value={newJob.customer_name}
                    onChange={e => setNewJob({ ...newJob, customer_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Alice Johnson"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Service Type</label>
                  <select
                    value={newJob.service}
                    onChange={e => setNewJob({ ...newJob, service: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 outline-none"
                  >
                    <option>Deep Cleaning</option>
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Move-in/Move-out</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                    <input
                      required
                      type="date"
                      value={newJob.date}
                      onChange={e => setNewJob({ ...newJob, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Time</label>
                    <input
                      required
                      type="text"
                      value={newJob.time}
                      onChange={e => setNewJob({ ...newJob, time: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="09:00 AM"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Location (City)</label>
                  <input
                    required
                    type="text"
                    value={newJob.location}
                    onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Dallas, TX"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Staff Name</label>
                    <input
                      required
                      type="text"
                      value={newJob.staff_name}
                      onChange={e => setNewJob({ ...newJob, staff_name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Maria G."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price ($)</label>
                    <input
                      required
                      type="number"
                      value={newJob.price}
                      onChange={e => setNewJob({ ...newJob, price: parseInt(e.target.value) || 0 })}
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
                    Create Job
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

export default Jobs;
