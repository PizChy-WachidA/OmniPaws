import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Star, DollarSign, MessageSquare, Settings,
  CheckCircle2, Clock, Loader2, PawPrint, TrendingUp, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Booking } from '@/types';
import { toast } from 'sonner';

const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [provider, setProvider] = useState<Record<string, unknown> | null>(null);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'availability' | 'earnings' | 'reviews' | 'profile'>('bookings');
  const [availDates, setAvailDates] = useState<Record<string, string[]>>({});
  const [savingSlots, setSavingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (!authLoading && user && user.role !== 'provider' && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || (user.role !== 'provider' && user.role !== 'admin')) return;
    fetchProviderData();
  }, [user]);

  const fetchProviderData = async () => {
    if (!user) return;
    setLoadingData(true);

    // Get provider profile
    const { data: provData } = await supabase.from('providers').select('*').eq('profile_id', user.id).maybeSingle();
    setProvider(provData as Record<string, unknown> | null);

    if (provData) {
      const { data: bookData } = await supabase
        .from('bookings')
        .select('*, pets(name, photo, breed), profiles!bookings_owner_id_fkey(name, avatar)')
        .eq('provider_id', provData.id as string)
        .order('date', { ascending: false });

      if (bookData) {
        const mapped: Booking[] = bookData.map((b: Record<string, unknown>) => {
          const pet = b.pets as Record<string, unknown> | null;
          const owner = b.profiles as Record<string, unknown> | null;
          return {
            id: b.id as string,
            providerId: provData.id as string,
            providerName: (provData.business_name as string) || '',
            providerType: (provData.type as Booking['providerType']),
            petId: b.pet_id as string,
            petName: pet ? (pet.name as string) : '',
            date: b.date as string,
            time: b.time as string,
            status: b.status as Booking['status'],
            total: b.total as number,
            notes: b.notes as string | undefined,
            ownerId: owner ? (owner.name as string) : '',
          };
        });
        setBookings(mapped);
      }

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*, profiles!reviews_owner_id_fkey(name, avatar)')
        .eq('provider_id', provData.id as string)
        .order('created_at', { ascending: false });
      setReviews((reviewData as Record<string, unknown>[]) || []);

      // Load availability
      const { data: availData } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', provData.id as string);
      if (availData) {
        const map: Record<string, string[]> = {};
        (availData as Record<string, unknown>[]).forEach((a) => {
          map[a.date as string] = (a.slots as string[]) || [];
        });
        setAvailDates(map);
      }
    }
    setLoadingData(false);
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) { toast.error('Update failed'); return; }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    toast.success(`Booking ${status}`);
  };

  const saveAvailability = async () => {
    if (!provider || !selectedDate) return;
    setSavingSlots(true);
    const { error } = await supabase.from('provider_availability').upsert({
      provider_id: provider.id as string,
      date: selectedDate,
      slots: selectedSlots,
      blocked: selectedSlots.length === 0,
    }, { onConflict: 'provider_id,date' });
    if (error) { toast.error('Failed to save availability'); }
    else {
      setAvailDates(prev => ({ ...prev, [selectedDate]: selectedSlots }));
      toast.success('Availability saved!');
    }
    setSavingSlots(false);
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  const earnings = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total, 0);
  const upcoming = bookings.filter(b => b.status === 'upcoming' || b.status === 'confirmed');
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + ((r.rating as number) || 0), 0) / reviews.length).toFixed(1)
    : '—';

  if (authLoading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const TABS = [
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'profile', label: 'Profile', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 lg:p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {provider?.photo ? (
                <img src={provider.photo as string} alt="profile" className="w-16 h-16 rounded-xl object-cover border-2 border-white/20" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-white/60" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-extrabold">{provider ? (provider.business_name as string) : user?.name}</h1>
                <p className="text-slate-300 text-sm capitalize">{provider ? (provider.type as string) : 'Provider'} · {provider?.suburb as string || user?.location}</p>
                {provider?.verified && <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1"><CheckCircle2 className="w-3 h-3" />Verified Provider</span>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Upcoming', value: upcoming.length },
                { label: 'Earnings', value: `$${earnings}` },
                { label: 'Reviews', value: reviews.length },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-extrabold">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === id ? 'bg-primary text-white shadow-sm' : 'bg-white border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-border">
                <PawPrint className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground">No bookings yet</p>
                <p className="text-sm text-muted-foreground">Bookings from pet owners will appear here.</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground">{booking.petName}</h3>
                      <Badge className={`text-xs border-0 ${statusColors[booking.status]}`}>{booking.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Owner: {booking.ownerId}</p>
                    <p className="text-sm text-primary font-medium mt-1">
                      {new Date(booking.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })} · {booking.time}
                    </p>
                    {booking.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{booking.notes}"</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl font-extrabold text-foreground">${booking.total}</span>
                    {booking.status === 'upcoming' && (
                      <>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs" onClick={() => updateBookingStatus(booking.id, 'confirmed')}>Confirm</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateBookingStatus(booking.id, 'cancelled')}>Cancel</Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white h-8 text-xs" onClick={() => updateBookingStatus(booking.id, 'completed')}>Mark Done</Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-primary" onClick={() => navigate(`/messages/${booking.id}`)}>
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />Chat
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Set Your Availability</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setSelectedSlots(availDates[e.target.value] || []);
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {selectedDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {availDates[selectedDate]?.length > 0 ? `${availDates[selectedDate].length} slots set` : 'No slots set — date will be blocked'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Available Time Slots</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      disabled={!selectedDate}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-40 ${
                        selectedSlots.includes(slot) ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/40 text-foreground'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                className="bg-primary text-white font-semibold px-8 h-11 rounded-xl"
                onClick={saveAvailability}
                disabled={!selectedDate || savingSlots}
              >
                {savingSlots ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Availability
              </Button>
              {selectedSlots.length > 0 && (
                <Button variant="outline" className="h-11 rounded-xl" onClick={() => setSelectedSlots([])}>Clear All</Button>
              )}
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Upcoming Availability</h3>
              <div className="space-y-2">
                {Object.entries(availDates).filter(([date]) => new Date(date) >= new Date()).slice(0, 5).map(([date, slots]) => (
                  <div key={date} className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">
                      {new Date(date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-muted-foreground">{slots.length} slots</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Earned', value: `A$${earnings}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Completed Jobs', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle2, color: 'text-primary bg-primary/10' },
                { label: 'Avg Rating', value: avgRating, icon: Star, color: 'text-amber-600 bg-amber-50' },
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
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Completed Bookings</h2>
              </div>
              <div className="space-y-3">
                {bookings.filter(b => b.status === 'completed').map(b => (
                  <div key={b.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{b.petName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(b.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className="font-bold text-emerald-600">+A${b.total}</span>
                  </div>
                ))}
                {bookings.filter(b => b.status === 'completed').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No completed bookings yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-border">
                <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground">No reviews yet</p>
                <p className="text-sm text-muted-foreground">Reviews from completed bookings will appear here.</p>
              </div>
            ) : (
              reviews.map(r => {
                const owner = r.profiles as Record<string, unknown> | null;
                return (
                  <div key={r.id as string} className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-start gap-3">
                      <img src={owner?.avatar as string || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.owner_id}`} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground text-sm">{owner?.name as string || 'Pet Owner'}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < (r.rating as number) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.comment as string}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(r.created_at as string).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Provider Profile</h2>
            {provider ? (
              <div className="space-y-4">
                {[
                  { label: 'Business Name', value: provider.business_name as string },
                  { label: 'Service Type', value: (provider.type as string)?.charAt(0).toUpperCase() + (provider.type as string)?.slice(1) },
                  { label: 'Location', value: provider.location as string },
                  { label: 'Price From', value: `A$${provider.price_from} ${provider.price_unit}` },
                  { label: 'Response Time', value: provider.response_time as string },
                  { label: 'Phone', value: provider.phone as string },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-semibold text-foreground">{value || '—'}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">To update your profile details, contact OmniPaws support.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No provider profile found. Contact support to set up your provider account.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
