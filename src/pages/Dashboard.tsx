import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PawPrint, Calendar, Bell, ShieldCheck, ArrowRight,
  Stethoscope, Scissors, AlertTriangle, Phone, Plus, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import HealthScoreRing from '@/components/features/HealthScoreRing';
import { useAuth } from '@/hooks/useAuth';
import { usePets } from '@/hooks/usePets';
import { MOCK_BOOKINGS, MOCK_HEALTH_ALERTS } from '@/constants/mockData';
import { toast } from 'sonner';
import { Booking, HealthAlert } from '@/types';

const typeIcons: Record<string, React.ElementType> = {
  vet: Stethoscope,
  sitter: PawPrint,
  groomer: Scissors,
  trainer: PawPrint,
  boarding: PawPrint,
};

const urgencyStyles: Record<string, string> = {
  high: 'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low: 'bg-blue-50 border-blue-200 text-blue-600',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { pets } = usePets();

  useEffect(() => {
    if (!user) {
      login();
    }
  }, [user, login]);

  const bookings: Booking[] = (() => {
    const stored = localStorage.getItem('omnipaws_bookings');
    return stored ? JSON.parse(stored) as Booking[] : MOCK_BOOKINGS;
  })();

  const alerts: HealthAlert[] = MOCK_HEALTH_ALERTS;
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');

  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const quickStats = [
    { label: 'My Pets', value: String(pets.length), icon: PawPrint, color: 'bg-teal-50 text-primary border-teal-100' },
    { label: 'Upcoming', value: String(upcomingBookings.length), icon: Calendar, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Alerts', value: String(alerts.length), icon: Bell, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Insurance', value: 'Active', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  ];

  const displayName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary via-teal-500 to-emerald-500 rounded-2xl p-6 lg:p-8 text-white mb-8 shadow-lg shadow-primary/25">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold mb-1">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-teal-100 text-sm">{today}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0 font-semibold"
                onClick={() => navigate('/services')}
              >
                <Search className="w-4 h-4 mr-2" />
                Find Services
              </Button>
              <Button
                className="bg-white text-primary hover:bg-white/90 font-semibold"
                onClick={() => toast.info('Pet Emergency line: 1800 OMNIPAWS (1800 666 472)')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Emergency
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl border p-4 flex items-center gap-4 bg-white ${color.split(' ').slice(2).join(' ')}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color.split(' ').slice(0, 2).join(' ')}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Pets */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-foreground">My Pets</h2>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-semibold text-sm gap-1">
                <Plus className="w-4 h-4" /> Add Pet
              </Button>
            </div>

            {pets.map(pet => (
              <div
                key={pet.id}
                className="bg-white rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:shadow-md transition-shadow"
              >
                <img
                  src={pet.photo}
                  alt={pet.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">{pet.name}</h3>
                    <Badge
                      variant="secondary"
                      className={
                        pet.insuranceStatus === 'active'
                          ? 'bg-emerald-100 text-emerald-700 border-0 text-xs'
                          : 'bg-gray-100 text-gray-600 border-0 text-xs'
                      }
                    >
                      {pet.insuranceStatus === 'active' ? 'Insured' : 'No Insurance'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {pet.breed} · {pet.age} yrs · {pet.weight}kg
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pet.personality.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center gap-4">
                  <HealthScoreRing score={pet.healthScore} size={80} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
                    onClick={() => navigate(`/passport/${pet.id}`)}
                  >
                    View Passport
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Bookings */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Bookings</h2>
              <div className="space-y-3">
                {upcomingBookings.map(booking => {
                  const Icon = typeIcons[booking.providerType] || PawPrint;
                  return (
                    <div key={booking.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{booking.providerName}</p>
                          <p className="text-xs text-muted-foreground">{booking.petName}</p>
                          <p className="text-xs text-primary font-medium mt-1">
                            {new Date(booking.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} · {booking.time}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-foreground shrink-0">${booking.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-primary font-semibold hover:bg-primary/5"
                onClick={() => navigate('/services')}
              >
                Book More Services <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Health Alerts */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Health Alerts</h2>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-4 ${urgencyStyles[alert.urgency]}`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold mb-0.5">{alert.petName}</p>
                        <p className="text-xs leading-relaxed">{alert.message}</p>
                        <p className="text-xs opacity-70 mt-1">Due: {new Date(alert.dueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
