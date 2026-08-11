import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, PawPrint, Calendar, ShieldCheck, AlertTriangle,
  Loader2, Trash2, CheckCircle2, Ban, TrendingUp, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type AdminTab = 'overview' | 'users' | 'providers' | 'bookings' | 'insurance';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, pets: 0, bookings: 0, providers: 0, revenue: 0, enrollments: 0 });
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [providers, setProviders] = useState<Record<string, unknown>[]>([]);
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, unknown>[]>([]);
  const [searchUsers, setSearchUsers] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (!authLoading && user && user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [usersRes, petsRes, bookingsRes, providersRes, enrollRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('pets').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('*, profiles!bookings_owner_id_fkey(name,email), providers(business_name,type), pets(name)').order('created_at', { ascending: false }),
      supabase.from('providers').select('*, profiles(name,email)').order('created_at', { ascending: false }),
      supabase.from('insurance_enrollments').select('*, profiles!insurance_enrollments_owner_id_fkey(name), insurance_plans(name,tier), pets(name)').order('enrolled_at', { ascending: false }),
    ]);

    const usersData = (usersRes.data as Record<string, unknown>[]) || [];
    const bookingsData = (bookingsRes.data as Record<string, unknown>[]) || [];
    const providersData = (providersRes.data as Record<string, unknown>[]) || [];
    const enrollData = (enrollRes.data as Record<string, unknown>[]) || [];

    setUsers(usersData);
    setBookings(bookingsData);
    setProviders(providersData);
    setEnrollments(enrollData);

    const revenue = bookingsData.filter(b => b.status === 'completed').reduce((s, b) => s + ((b.total as number) || 0), 0);
    setStats({
      users: usersData.length,
      pets: petsRes.count || 0,
      bookings: bookingsData.length,
      providers: providersData.length,
      revenue,
      enrollments: enrollData.length,
    });
    setLoading(false);
  };

  const updateUserRole = async (userId: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) { toast.error('Failed to update role'); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    toast.success(`Role updated to ${role}`);
  };

  const verifyProvider = async (providerId: string, verified: boolean) => {
    const { error } = await supabase.from('providers').update({ verified }).eq('id', providerId);
    if (error) { toast.error('Failed to update'); return; }
    setProviders(prev => prev.map(p => p.id === providerId ? { ...p, verified } : p));
    toast.success(verified ? 'Provider verified!' : 'Verification removed');
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) { toast.error('Failed to update'); return; }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    toast.success(`Booking marked ${status}`);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user? This is irreversible.')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) { toast.error('Delete failed'); return; }
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('User deleted');
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const filteredUsers = users.filter(u =>
    !searchUsers ||
    (u.name as string)?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    (u.email as string)?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: `Users (${stats.users})`, icon: Users },
    { id: 'providers', label: `Providers (${stats.providers})`, icon: Building2 },
    { id: 'bookings', label: `Bookings (${stats.bookings})`, icon: Calendar },
    { id: 'insurance', label: `Insurance (${stats.enrollments})`, icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 lg:p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-extrabold">Admin Control Panel</h1>
          </div>
          <p className="text-slate-400 text-sm">Full system management — changes take effect immediately</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === id ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'Total Pets', value: stats.pets, icon: PawPrint, color: 'bg-teal-50 text-primary' },
                { label: 'Total Bookings', value: stats.bookings, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
                { label: 'Providers', value: stats.providers, icon: Building2, color: 'bg-amber-50 text-amber-600' },
                { label: 'Revenue (Completed)', value: `A$${stats.revenue}`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Insurance Enrollments', value: stats.enrollments, icon: ShieldCheck, color: 'bg-rose-50 text-rose-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <Input
              placeholder="Search by name or email…"
              value={searchUsers}
              onChange={e => setSearchUsers(e.target.value)}
              className="max-w-sm rounded-xl border-border h-11"
            />
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>
                      {['User', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id as string} className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={(u.avatar as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-medium text-foreground">{u.name as string || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email as string}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role as string}
                            onChange={e => updateUserRole(u.id as string, e.target.value)}
                            className="h-8 px-2 rounded-lg border border-border text-xs bg-white focus:outline-none"
                          >
                            <option value="owner">owner</option>
                            <option value="provider">provider</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {u.verified ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Ban className="w-4 h-4 text-muted-foreground" />}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(u.created_at as string).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteUser(u.id as string)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Providers */}
        {activeTab === 'providers' && (
          <div className="space-y-3">
            {providers.map(p => {
              const profile = p.profiles as Record<string, unknown> | null;
              return (
                <div key={p.id as string} className="bg-white rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <img src={p.photo as string || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground">{p.business_name as string}</h3>
                        {p.verified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{p.type as string} · {p.suburb as string}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email as string}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-xs border-0 ${p.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {p.available ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-8 text-xs ${p.verified ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                      onClick={() => verifyProvider(p.id as string, !p.verified)}
                    >
                      {p.verified ? 'Unverify' : 'Verify'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    {['Owner', 'Provider', 'Pet', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => {
                    const owner = b.profiles as Record<string, unknown> | null;
                    const provider = b.providers as Record<string, unknown> | null;
                    const pet = b.pets as Record<string, unknown> | null;
                    return (
                      <tr key={b.id as string} className="border-b border-border last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-foreground">{owner?.name as string || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{provider?.business_name as string || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{pet?.name as string || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(b.date as string).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground">A${b.total as number}</td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs border-0 ${
                            b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700'
                            : b.status === 'completed' ? 'bg-slate-100 text-slate-600'
                            : b.status === 'cancelled' ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-700'
                          }`}>{b.status as string}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={b.status as string}
                            onChange={e => updateBookingStatus(b.id as string, e.target.value)}
                            className="h-8 px-2 rounded-lg border border-border text-xs bg-white focus:outline-none"
                          >
                            <option value="upcoming">upcoming</option>
                            <option value="confirmed">confirmed</option>
                            <option value="completed">completed</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Insurance */}
        {activeTab === 'insurance' && (
          <div className="space-y-3">
            {enrollments.map(e => {
              const profile = e.profiles as Record<string, unknown> | null;
              const plan = e.insurance_plans as Record<string, unknown> | null;
              const pet = e.pets as Record<string, unknown> | null;
              return (
                <div key={e.id as string} className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">{profile?.name as string || '—'}</p>
                      <Badge className={`text-xs border-0 capitalize ${
                        plan?.tier === 'premium' ? 'bg-primary/10 text-primary'
                        : plan?.tier === 'standard' ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                      }`}>{plan?.tier as string || '—'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{plan?.name as string} · Pet: {pet?.name as string || '—'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Enrolled: {new Date(e.enrolled_at as string).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-emerald-600 text-sm">A${((e.monthly_premium as number) / 100).toFixed(2)}/mo</span>
                    <Badge className={`text-xs border-0 ${e.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {e.status as string}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {enrollments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-border">
                <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground">No enrollments yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
