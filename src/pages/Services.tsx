import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Clock, CheckCircle2,
  Stethoscope, Home, Scissors, Zap, Building2, SlidersHorizontal, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase';
import { ServiceType, ServiceProvider } from '@/types';
import { useAuth } from '@/hooks/useAuth';

type FilterType = ServiceType | 'all';

const TYPE_TABS: { value: FilterType; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: SlidersHorizontal },
  { value: 'vet', label: 'Vets', icon: Stethoscope },
  { value: 'sitter', label: 'Sitters', icon: Home },
  { value: 'groomer', label: 'Groomers', icon: Scissors },
  { value: 'trainer', label: 'Trainers', icon: Zap },
  { value: 'boarding', label: 'Boarding', icon: Building2 },
];

const TYPE_COLORS: Record<ServiceType, string> = {
  vet: 'text-blue-600 bg-blue-50',
  sitter: 'text-teal-600 bg-teal-50',
  groomer: 'text-purple-600 bg-purple-50',
  trainer: 'text-amber-600 bg-amber-50',
  boarding: 'text-green-600 bg-green-50',
};

const TYPE_ICONS: Record<ServiceType, React.ElementType> = {
  vet: Stethoscope, sitter: Home, groomer: Scissors, trainer: Zap, boarding: Building2,
};

const getMatchColor = (score: number) => {
  if (score >= 90) return 'bg-emerald-100 text-emerald-700';
  if (score >= 80) return 'bg-teal-100 text-teal-700';
  if (score >= 70) return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
};

// AI match scores (simulated per user session)
const AI_SCORES: Record<string, number> = {
  'Bondi Vet Clinic': 98, 'Pawsome Sitters': 94, 'Coastal Paws Grooming': 87,
  'Sydney Cat Clinic': 96, 'K9 Elite Training': 82, 'Happy Tails Boarding': 79,
  'Eastern Animal Emergency': 91, 'North Sydney Vets': 85,
};

function dbRowToProvider(p: Record<string, unknown>): ServiceProvider {
  return {
    id: p.id as string,
    name: p.name as string,
    businessName: p.business_name as string,
    type: p.type as ServiceType,
    rating: Number(p.rating) || 5,
    reviewCount: (p.review_count as number) || 0,
    location: (p.location as string) || '',
    suburb: (p.suburb as string) || '',
    distance: 0,
    lat: p.lat as number | undefined,
    lng: p.lng as number | undefined,
    priceFrom: (p.price_from as number) || 50,
    priceUnit: (p.price_unit as string) || 'per visit',
    photo: (p.photo as string) || '',
    verified: (p.verified as boolean) || false,
    available: (p.available as boolean) ?? true,
    aiMatchScore: AI_SCORES[p.business_name as string],
    tags: (p.tags as string[]) || [],
    description: (p.description as string) || '',
    responseTime: (p.response_time as string) || '< 2 hours',
    isEmergency: (p.is_emergency as boolean) || false,
    openNow: (p.open_now as boolean) ?? true,
    phone: (p.phone as string) || '',
  };
}

const ServiceCard = ({ provider }: { provider: ServiceProvider }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const Icon = TYPE_ICONS[provider.type];

  const handleBook = () => {
    if (!user) { navigate('/auth'); return; }
    navigate(`/book/${provider.id}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <img src={provider.photo} alt={provider.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-foreground text-base truncate">{provider.businessName}</h3>
              {provider.verified && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
              {provider.isEmergency && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">24/7</span>}
            </div>
            <p className="text-sm text-muted-foreground truncate">{provider.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[provider.type]}`}>
                <Icon className="w-3 h-3" />
                {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
              </span>
              {!provider.available && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">Unavailable</span>}
              {provider.openNow ? (
                <span className="text-xs text-emerald-600 font-medium">● Open</span>
              ) : (
                <span className="text-xs text-red-500 font-medium">● Closed</span>
              )}
            </div>
          </div>
          {provider.aiMatchScore !== undefined && (
            <div className={`shrink-0 px-3 py-1.5 rounded-xl text-center ${getMatchColor(provider.aiMatchScore)}`}>
              <p className="text-lg font-extrabold leading-none">{provider.aiMatchScore}%</p>
              <p className="text-[10px] font-semibold mt-0.5">AI Match</p>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{provider.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {provider.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-foreground">{provider.rating}</span>
              <span className="text-muted-foreground">({provider.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{provider.suburb}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{provider.responseTime}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-primary">A${provider.priceFrom}</span>
            <span className="text-xs text-muted-foreground block">{provider.priceUnit}</span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        <Button className="w-full bg-primary text-white hover:bg-primary/90 font-semibold rounded-xl" disabled={!provider.available} onClick={handleBook}>
          {provider.available ? 'Book Now' : 'Currently Unavailable'}
        </Button>
      </div>
    </div>
  );
};

const Services = () => {
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'price'>('match');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    const { data, error } = await supabase.from('providers').select('*').order('rating', { ascending: false });
    if (!error && data) {
      setProviders((data as Record<string, unknown>[]).map(dbRowToProvider));
    }
    setLoading(false);
  };

  const filtered = providers
    .filter(p => activeType === 'all' || p.type === activeType)
    .filter(p =>
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.suburb.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'match') return (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0);
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.priceFrom - b.priceFrom;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-3">
            <Zap className="w-3.5 h-3.5" />AI-Powered Matching Active
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Find Pet Care Near You</h1>
          <p className="text-muted-foreground">Showing providers matched to your pets in Bondi Beach, NSW</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, suburb..." className="pl-9 rounded-xl border-border h-11" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="h-11 px-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="match">Sort: AI Match Score</option>
            <option value="rating">Sort: Highest Rated</option>
            <option value="price">Sort: Lowest Price</option>
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {TYPE_TABS.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setActiveType(value)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeType === value ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">{filtered.length} provider{filtered.length !== 1 ? 's' : ''} found{activeType !== 'all' ? ` for ${activeType}s` : ''}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(provider => <ServiceCard key={provider.id} provider={provider} />)}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-2xl mb-2">🔍</p>
                <p className="font-semibold text-foreground mb-1">No providers found</p>
                <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Services;
