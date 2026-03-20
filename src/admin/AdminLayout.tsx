import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  UserSquare2,
  BarChart3,
  Package,
  ShieldCheck,
  Settings,
  Bell,
  Search,
  Calculator,
  Menu,
  X,
  LogOut,
  MapPin,
  Camera,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../components/ui/Logo';
import AdminLogin from './AdminLogin';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: string; title: string; message: string; type: string; time: string}>>([]);
  const location = useLocation();

  useEffect(() => {
    // Fetch notifications from various sources
    const fetchNotifications = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      
      try {
        const notifs: Array<{id: string; title: string; message: string; type: string; time: string}> = [];
        
        // Get expiring compliance docs
        const complianceRes = await fetch('/api/compliance/documents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (complianceRes.ok) {
          const docs = await complianceRes.json();
          docs.forEach((doc: any) => {
            if (doc.expiry_date) {
              const daysLeft = Math.ceil((new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              if (daysLeft <= 30 && daysLeft > 0) {
                notifs.push({
                  id: `compliance-${doc.id}`,
                  title: 'Document Expiring Soon',
                  message: `${doc.name} expires in ${daysLeft} days`,
                  type: 'warning',
                  time: 'Compliance'
                });
              } else if (daysLeft <= 0) {
                notifs.push({
                  id: `compliance-${doc.id}`,
                  title: 'Document Expired',
                  message: `${doc.name} has expired`,
                  type: 'error',
                  time: 'Compliance'
                });
              }
            }
          });
        }

        // Get pending quotes
        const quotesRes = await fetch('/api/quotes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (quotesRes.ok) {
          const quotes = await quotesRes.json();
          const pending = quotes.filter((q: any) => q.status === 'Pending').slice(0, 3);
          pending.forEach((quote: any) => {
            notifs.push({
              id: `quote-${quote.id}`,
              title: 'New Quote Request',
              message: `${quote.customer_name || 'Customer'} requested a quote`,
              type: 'info',
              time: 'Quotes'
            });
          });
        }

        setNotifications(notifs);
      } catch (e) {
        console.error('Failed to fetch notifications:', e);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
      // Refresh every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isAuthenticated]);

  useEffect(() => {
    // Verify token with server on mount
    const verifyAuth = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired, clear storage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminAuth');
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
      }
      
      setIsCheckingAuth(false);
    };

    verifyAuth();
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem('adminToken');
    
    // Notify server (optional, for audit logging)
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => {}); // Ignore errors
    }
    
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Scheduling', icon: Calendar, path: '/admin/schedule' },
    { name: 'Jobs', icon: Briefcase, path: '/admin/jobs' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Staff', icon: UserSquare2, path: '/admin/staff' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Quotes', icon: Calculator, path: '/admin/quotes' },
    { name: 'Inventory', icon: Package, path: '/admin/inventory' },
    { name: 'Service Areas', icon: MapPin, path: '/admin/service-areas' },
    { name: 'Service Content', icon: FileText, path: '/admin/services-content' },
    { name: 'Transformations', icon: Camera, path: '/admin/transformations' },
    { name: 'Compliance', icon: ShieldCheck, path: '/admin/compliance' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  if (isCheckingAuth) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'
          } lg:static lg:block hidden`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 mb-10 px-2">
            <Logo className="h-10 w-auto object-contain" />
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all group
                  ${isActive
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isSidebarOpen ? '' : 'mx-auto'}`} />
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 w-full text-slate-400 hover:text-white transition-colors group"
            >
              <LogOut className={`w-5 h-5 flex-shrink-0 ${isSidebarOpen ? '' : 'mx-auto'}`} />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:block hidden"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="relative lg:w-96 w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs, customers, zip codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">Notifications</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notif.type === 'error' ? 'bg-red-100 text-red-600' :
                              notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-100">
                      <button 
                        onClick={() => { setNotifications([]); setShowNotifications(false); }}
                        className="w-full text-center text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right lg:block hidden">
                <p className="text-sm font-bold text-slate-900 leading-none">Admin User</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
