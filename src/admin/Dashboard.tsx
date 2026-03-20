import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  TrendingUp,
  Package,
  Activity,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import StatCard from '../components/admin/StatCard';
import { showToast } from '../lib/toast';
import { apiRequest } from '../lib/api';

interface DashboardStats {
  todayJobs: number;
  revenue: number;
  activeStaff: number;
  alerts: number;
  trends?: {
    jobs: string;
    revenue: string;
    staff: string;
    alerts: string;
  };
}

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

interface AvailabilityCheck {
  id: number;
  zip_code: string;
  available: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [availabilityChecks, setAvailabilityChecks] = useState<AvailabilityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [openJobMenu, setOpenJobMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes, checksRes] = await Promise.all([
          apiRequest<DashboardStats>('/api/stats'),
          apiRequest<Job[]>('/api/jobs'),
          apiRequest<AvailabilityCheck[]>('/api/availability-checks')
        ]);

        if (statsRes.error) {
          showToast.error('Failed to load dashboard stats');
        } else {
          setStats(statsRes.data);
        }

        setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
        setAvailabilityChecks(Array.isArray(checksRes.data) ? checksRes.data : []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        showToast.error('Failed to load dashboard data');
        setJobs([]);
        setAvailabilityChecks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job =>
    job.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChecks = (Array.isArray(availabilityChecks) ? availabilityChecks : []).filter(check =>
    check.zip_code.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5" />
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Today's Jobs"
          value={stats?.todayJobs || 0}
          icon={Calendar}
          color="text-blue-600"
          bgColor="bg-blue-50"
          trend={stats?.trends?.jobs || '0%'}
          delay={0}
        />
        <StatCard
          label="Revenue (Week)"
          value={`$${stats?.revenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          trend={stats?.trends?.revenue || '0%'}
          delay={1}
        />
        <StatCard
          label="Active Staff"
          value={stats?.activeStaff || 0}
          icon={Users}
          color="text-purple-600"
          bgColor="bg-purple-50"
          trend={stats?.trends?.staff || '0'}
          delay={2}
        />
        <StatCard
          label="Compliance Alerts"
          value={stats?.alerts || 0}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
          trend={stats?.trends?.alerts || '0'}
          delay={3}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Latest Cleaning Jobs
            </h3>
            <button 
              onClick={() => navigate('/admin/schedule')}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              View Schedule <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Customer & Service</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date/Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      {searchQuery ? `No jobs found for "${searchQuery}"` : "No jobs scheduled yet."}
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs">
                            {job.customer_name?.split(' ').map(n => n[0]).join('') || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{job.customer_name}</p>
                            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{job.service}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${job.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          job.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">{job.date}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{job.time}</p>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setOpenJobMenu(openJobMenu === job.id ? null : job.id)}
                          className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all text-slate-400 hover:text-emerald-500">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openJobMenu === job.id && (
                          <div className="absolute right-6 top-12 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 min-w-[140px]">
                            <button
                              onClick={() => { navigate('/admin/schedule'); setOpenJobMenu(null); }}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" /> View Details
                            </button>
                            <button
                              onClick={() => { navigate('/admin/schedule'); setOpenJobMenu(null); }}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Users className="w-4 h-4" /> Assign Staff
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('adminToken');
                                  await fetch(`/api/jobs/${job.id}`, { 
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  setJobs(jobs.filter(j => j.id !== job.id));
                                  showToast.success('Job deleted');
                                } catch (e) {
                                  showToast.error('Failed to delete job');
                                }
                                setOpenJobMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Availability Checks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              Live Availability Checks
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time visitor queries</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
            {filteredChecks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No checks recorded yet.</p>
              </div>
            ) : (
              filteredChecks.map((check) => (
                <div key={check.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${check.available ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {check.available ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Zip: {check.zip_code}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(check.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${check.available ? 'text-emerald-600' : 'text-red-500'}`}>
                    {check.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => window.location.href = '/admin/service-areas'}
              className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
            >
              Manage Service Areas
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
