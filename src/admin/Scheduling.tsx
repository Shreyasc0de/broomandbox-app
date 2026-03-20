import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Clock,
  MapPin,
  MoreVertical,
  Zap,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Job {
  id: number;
  customer_name: string;
  service: string;
  date: string;
  time: string | null;
  staff_name: string | null;
  location: string | null;
  price: number;
  status: string;
}

interface Staff {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const serviceColors: Record<string, string> = {
  'Deep Cleaning': 'bg-purple-100 text-purple-700',
  'Standard Cleaning': 'bg-emerald-100 text-emerald-700',
  'Office Cleaning': 'bg-blue-100 text-blue-700',
  'Move In/Out Cleaning': 'bg-amber-100 text-amber-700',
};

const staffColors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];

interface DraggableJobProps {
  job: Job;
  isOverlay?: boolean;
  onDelete?: (id: number) => void;
}

const DraggableJob = ({ job, isOverlay = false, onDelete }: DraggableJobProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `job-${job.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colorClass = serviceColors[job.service] || 'bg-slate-100 text-slate-700';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete && confirm(`Delete job for ${job.customer_name}?`)) {
      onDelete(job.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${isOverlay ? 'shadow-xl border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${colorClass}`}>
          {job.service.replace(' Cleaning', '')}
        </span>
        {onDelete && (
          <button 
            onPointerDown={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all text-slate-400 hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <h4 className="text-sm font-bold text-slate-900 mb-1">{job.customer_name}</h4>
      <div className="space-y-1">
        {job.time && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <Clock className="w-3 h-3" />
            {job.time}
          </div>
        )}
        {job.location && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <MapPin className="w-3 h-3" />
            {job.location}
          </div>
        )}
      </div>
    </div>
  );
};

interface DroppableSlotProps {
  staffName: string;
  time: string;
  job: Job | null;
  children?: React.ReactNode;
}

const DroppableSlot = ({ staffName, time, job }: DroppableSlotProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${staffName}-${time}`,
    data: { staffName, time }
  });

  const colorClass = job ? (serviceColors[job.service] || 'bg-slate-50 border-slate-200') : '';

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-2 min-h-[80px] transition-colors relative ${isOver ? 'bg-emerald-50' : 'hover:bg-slate-50/50'}`}
    >
      {job && (
        <div className={`absolute inset-2 ${colorClass.split(' ')[0].replace('100', '50')} border ${colorClass.split(' ')[0].replace('100', '200')} rounded-xl p-3 shadow-sm z-10`}>
          <p className="text-[10px] font-bold text-slate-900 mb-1">{job.customer_name}</p>
          <p className="text-[9px] text-slate-600 font-medium">{job.service}</p>
        </div>
      )}
      {isOver && !job && (
        <div className="absolute inset-2 border-2 border-dashed border-emerald-400 rounded-xl bg-emerald-50/50 flex items-center justify-center">
          <span className="text-xs font-medium text-emerald-600">Drop here</span>
        </div>
      )}
    </div>
  );
};

const Scheduling = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);

  const [newJob, setNewJob] = useState({
    customer_name: '',
    service: 'Standard Cleaning',
    time: '09:00 AM',
    location: '',
    price: 0
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Date range helpers
  const getWeekDates = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDay();
    const diff = date.getDate() - day; // Start from Sunday
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(diff + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getMonthDates = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
      firstDay,
      lastDay
    };
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      let jobsUrl = '/api/jobs';
      if (viewMode === 'day') {
        jobsUrl += `?date=${selectedDate}`;
      } else if (viewMode === 'week') {
        const weekDates = getWeekDates(selectedDate);
        jobsUrl += `?startDate=${weekDates[0]}&endDate=${weekDates[6]}`;
      } else if (viewMode === 'month') {
        const { start, end } = getMonthDates(selectedDate);
        jobsUrl += `?startDate=${start}&endDate=${end}`;
      }
      
      const [jobsRes, staffRes] = await Promise.all([
        fetch(jobsUrl, { headers }),
        fetch('/api/staff', { headers })
      ]);
      const [jobsData, staffData] = await Promise.all([
        jobsRes.json(),
        staffRes.json()
      ]);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setJobs([]);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, viewMode]);

  const unassignedJobs = jobs.filter(j => !j.staff_name);
  const filteredUnassigned = unassignedJobs.filter(j => 
    j.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getJobForSlot = (staffName: string, time: string): Job | null => {
    return jobs.find(j => j.staff_name === staffName && j.time === time) || null;
  };

  const getStaffJobCount = (staffName: string): number => {
    return jobs.filter(j => j.staff_name === staffName).length;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const overId = over.id.toString();
    if (!overId.startsWith('slot-')) return;

    const jobId = active.id.toString().replace('job-', '');
    const [, staffName, time] = overId.split('-').reduce((acc: string[], part, idx, arr) => {
      if (idx === 0) return acc;
      if (idx === 1) return [part];
      if (idx === arr.length - 2) return [...acc, arr.slice(1, -1).join('-')];
      return acc;
    }, [] as string[]);

    // Parse slot ID properly
    const slotParts = overId.replace('slot-', '').split('-');
    const slotTime = slotParts.pop() + ' ' + slotParts.pop();
    const slotStaffName = slotParts.join(' ');
    const finalTime = slotTime.split(' ').reverse().join(' ');

    try {
      const res = await fetch(`/api/jobs/${jobId}/assign`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ staff_name: slotStaffName })
      });

      if (res.ok) {
        // Also update the time
        await fetch(`/api/jobs/${jobId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...jobs.find(j => j.id === parseInt(jobId)),
            staff_name: slotStaffName,
            time: finalTime
          })
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to assign job:', error);
    }
  };

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    try {
      const res = await fetch('/api/jobs/auto-assign', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date: selectedDate })
      });
      const data = await res.json();
      if (data.assigned > 0) {
        fetchData();
      }
    } catch (error) {
      console.error('Auto-assign failed:', error);
    } finally {
      setAutoAssigning(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newJob,
          date: selectedDate,
          status: 'Scheduled'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setNewJob({ customer_name: '', service: 'Standard Cleaning', time: '09:00 AM', location: '', price: 0 });
        fetchData();
      } else {
        console.error('Failed to create job:', data);
        alert('Failed to create job: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create job. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (id: number) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const changeDate = (direction: number) => {
    const date = new Date(selectedDate + 'T00:00:00');
    if (viewMode === 'day') {
      date.setDate(date.getDate() + direction);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + (direction * 7));
    } else if (viewMode === 'month') {
      date.setMonth(date.getMonth() + direction);
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDateDisplay = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    if (viewMode === 'day') {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const weekDates = getWeekDates(selectedDate);
      const start = new Date(weekDates[0] + 'T00:00:00');
      const end = new Date(weekDates[6] + 'T00:00:00');
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const getJobsForDate = (dateStr: string) => jobs.filter(j => j.date === dateStr);

  const activeJob = activeId ? jobs.find(j => `job-${j.id}` === activeId) : null;

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Scheduling</h1>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('day')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'day' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Day
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'week' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'month' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Month
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-100 rounded transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-900 min-w-[140px] text-center">
              {formatDateDisplay()}
            </span>
            <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-100 rounded transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleAutoAssign}
            disabled={autoAssigning || unassignedJobs.length === 0 || staff.length === 0}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {autoAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Auto-Assign
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Job
          </button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Unassigned Jobs Sidebar */}
          <div className="w-80 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-slate-900 flex items-center justify-between mb-4">
                Unassigned Queue
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{unassignedJobs.length}</span>
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search queue..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              ) : filteredUnassigned.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">No unassigned jobs</p>
                </div>
              ) : (
                <SortableContext 
                  items={filteredUnassigned.map(j => `job-${j.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {filteredUnassigned.map((job) => (
                      <DraggableJob key={job.id} job={job} onDelete={handleDeleteJob} />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>

          {/* Calendar Grid - Day View */}
          {viewMode === 'day' && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-200">
                <div className="w-24 p-4 border-r border-slate-200 bg-slate-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 flex divide-x divide-slate-200">
                  {staff.length === 0 && !loading ? (
                    <div className="flex-1 p-4 flex items-center justify-center bg-slate-50">
                      <p className="text-sm text-slate-400">No staff members. Add staff first.</p>
                    </div>
                  ) : (
                    staff.map((s, idx) => (
                      <div key={s.id} className="flex-1 p-4 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${staffColors[idx % staffColors.length]} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                            {s.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{s.name}</p>
                            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">{getStaffJobCount(s.name)} Jobs Today</p>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                          <MoreVertical className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {timeSlots.map((time) => (
                  <div key={time} className="flex border-b border-slate-100 min-h-[80px]">
                    <div className="w-24 p-4 border-r border-slate-200 flex items-start justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{time}</span>
                    </div>
                    <div className="flex-1 flex divide-x divide-slate-100">
                      {staff.map((s) => (
                        <DroppableSlot
                          key={`${s.name}-${time}`}
                          staffName={s.name}
                          time={time}
                          job={getJobForSlot(s.name, time)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50">
                <div className="w-20 p-3 border-r border-slate-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-400">Staff</span>
                </div>
                {getWeekDates(selectedDate).map((date) => {
                  const d = new Date(date + 'T00:00:00');
                  const isToday = date === new Date().toISOString().split('T')[0];
                  return (
                    <div 
                      key={date} 
                      className={`flex-1 p-3 text-center border-r border-slate-200 last:border-r-0 ${isToday ? 'bg-emerald-50' : ''}`}
                    >
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <p className={`text-lg font-bold ${isToday ? 'text-emerald-600' : 'text-slate-900'}`}>{d.getDate()}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                  </div>
                ) : staff.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-slate-400">No staff members. Add staff first.</p>
                  </div>
                ) : (
                  staff.map((s, idx) => (
                    <div key={s.id} className="flex border-b border-slate-100">
                      <div className="w-20 p-3 border-r border-slate-200 flex items-center gap-2">
                        <div className={`w-6 h-6 ${staffColors[idx % staffColors.length]} rounded-full flex items-center justify-center text-white font-bold text-[10px]`}>
                          {s.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs font-medium text-slate-700 truncate">{s.name.split(' ')[0]}</span>
                      </div>
                      {getWeekDates(selectedDate).map((date) => {
                        const dayJobs = getJobsForDate(date).filter(j => j.staff_name === s.name);
                        const isToday = date === new Date().toISOString().split('T')[0];
                        return (
                          <div 
                            key={date} 
                            className={`flex-1 p-2 border-r border-slate-100 last:border-r-0 min-h-[80px] ${isToday ? 'bg-emerald-50/30' : ''}`}
                          >
                            {dayJobs.map((job) => (
                              <div 
                                key={job.id}
                                className={`mb-1 p-2 rounded-lg text-[10px] ${serviceColors[job.service]?.split(' ')[0] || 'bg-slate-100'} border ${serviceColors[job.service]?.split(' ')[0].replace('100', '200') || 'border-slate-200'}`}
                              >
                                <p className="font-bold truncate">{job.customer_name}</p>
                                <p className="text-slate-500">{job.time}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                    <span className="text-xs font-bold text-slate-400 uppercase">{day}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-7 auto-rows-fr">
                    {(() => {
                      const { firstDay, lastDay } = getMonthDates(selectedDate);
                      const startPadding = firstDay.getDay();
                      const totalDays = lastDay.getDate();
                      const today = new Date().toISOString().split('T')[0];
                      const cells = [];
                      
                      // Padding for days before month starts
                      for (let i = 0; i < startPadding; i++) {
                        cells.push(
                          <div key={`pad-${i}`} className="p-2 border-r border-b border-slate-100 bg-slate-50/50 min-h-[100px]" />
                        );
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= totalDays; day++) {
                        const dateStr = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayJobs = getJobsForDate(dateStr);
                        const isToday = dateStr === today;
                        
                        cells.push(
                          <div 
                            key={day} 
                            className={`p-2 border-r border-b border-slate-100 min-h-[100px] cursor-pointer hover:bg-slate-50 transition-colors ${isToday ? 'bg-emerald-50' : ''}`}
                            onClick={() => { setSelectedDate(dateStr); setViewMode('day'); }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-bold ${isToday ? 'text-emerald-600' : 'text-slate-900'}`}>{day}</span>
                              {dayJobs.length > 0 && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                                  {dayJobs.length}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1">
                              {dayJobs.slice(0, 3).map((job) => (
                                <div 
                                  key={job.id}
                                  className={`p-1 rounded text-[9px] truncate ${serviceColors[job.service]?.split(' ')[0] || 'bg-slate-100'}`}
                                >
                                  {job.customer_name}
                                </div>
                              ))}
                              {dayJobs.length > 3 && (
                                <p className="text-[9px] text-slate-400 font-medium">+{dayJobs.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      
                      return cells;
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeJob && <DraggableJob job={activeJob} isOverlay />}
        </DragOverlay>
      </DndContext>

      {/* New Job Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900">New Job</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleCreateJob} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer Name</label>
                  <input
                    required
                    type="text"
                    value={newJob.customer_name}
                    onChange={(e) => setNewJob({ ...newJob, customer_name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Service</label>
                    <select
                      value={newJob.service}
                      onChange={(e) => setNewJob({ ...newJob, service: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Standard Cleaning">Standard Cleaning</option>
                      <option value="Deep Cleaning">Deep Cleaning</option>
                      <option value="Office Cleaning">Office Cleaning</option>
                      <option value="Move In/Out Cleaning">Move In/Out Cleaning</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Time</label>
                    <select
                      value={newJob.time}
                      onChange={(e) => setNewJob({ ...newJob, time: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    >
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Location</label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder="123 Main St, Irving, TX"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newJob.price}
                    onChange={(e) => setNewJob({ ...newJob, price: parseFloat(e.target.value) || 0 })}
                    placeholder="150"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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

export default Scheduling;
