import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, X, ChevronDown, ChevronUp, Loader2,
  Calculator, ArrowRight, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { usePets } from '@/hooks/usePets';
import { InsurancePlan } from '@/types';
import { toast } from 'sonner';

const TIER_COLORS = {
  basic: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700', btn: 'bg-slate-700 hover:bg-slate-800' },
  standard: { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-600 text-white', btn: 'bg-blue-600 hover:bg-blue-700' },
  premium: { bg: 'bg-primary/5', border: 'border-primary', badge: 'bg-primary text-white', btn: 'bg-primary hover:bg-primary/90' },
};

const AGE_MULTIPLIERS: Record<string, number> = {
  'Puppy/Kitten (< 1yr)': 0.85,
  'Young (1-3 yrs)': 1.0,
  'Adult (4-7 yrs)': 1.2,
  'Senior (8+ yrs)': 1.65,
};

const BREED_MULTIPLIERS: Record<string, number> = {
  'Mixed Breed': 1.0,
  'Labrador / Golden Retriever': 1.1,
  'French Bulldog / Pug': 1.4,
  'German Shepherd': 1.15,
  'British Shorthair / Persian': 1.2,
  'Maine Coon': 1.25,
};

function calcPremium(basePrice: number, ageKey: string, breedKey: string): number {
  const a = AGE_MULTIPLIERS[ageKey] || 1.0;
  const b = BREED_MULTIPLIERS[breedKey] || 1.0;
  return Math.round(basePrice * a * b);
}

const Insurance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pets } = usePets();
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState<string | null>('standard');
  const [ageKey, setAgeKey] = useState('Young (1-3 yrs)');
  const [breedKey, setBreedKey] = useState('Mixed Breed');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolledPlanId, setEnrolledPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (user) fetchEnrollment();
  }, [user]);

  const fetchPlans = async () => {
    const { data, error } = await supabase.from('insurance_plans').select('*').order('monthly_price');
    if (!error && data) {
      setPlans(data.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        tier: p.tier as InsurancePlan['tier'],
        name: p.name as string,
        monthlyPrice: p.monthly_price as number,
        features: (p.features as string[]) || [],
        coverageLimit: p.coverage_limit as number,
        excess: p.excess as number,
      })));
    }
    setLoading(false);
  };

  const fetchEnrollment = async () => {
    if (!user) return;
    const { data } = await supabase.from('insurance_enrollments').select('plan_id').eq('owner_id', user.id).maybeSingle();
    if (data) setEnrolledPlanId(data.plan_id as string);
  };

  const handleEnroll = async (plan: InsurancePlan) => {
    if (!user) { navigate('/auth'); return; }
    if (!selectedPetId && pets.length > 0) {
      toast.error('Please select a pet first.');
      return;
    }
    setEnrolling(plan.id);
    const premium = calcPremium(plan.monthlyPrice, ageKey, breedKey);
    const { error } = await supabase.from('insurance_enrollments').upsert({
      owner_id: user.id,
      pet_id: selectedPetId || (pets[0]?.id ?? null),
      plan_id: plan.id,
      status: 'active',
      monthly_premium: premium,
    }, { onConflict: 'owner_id,pet_id' });
    if (error) {
      toast.error('Enrollment failed. Please try again.');
    } else {
      setEnrolledPlanId(plan.id);
      toast.success(`Enrolled in ${plan.name}! Your cover is now active.`);
    }
    setEnrolling(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-28 pb-16 bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/30">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <ShieldCheck className="w-4 h-4" />
              OmniPaws Insurance
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
              Protect What Matters Most
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Comprehensive pet insurance for Australian families. Compare plans, calculate your premium, and enrol in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {['No waiting period on accidents', 'APRA regulated cover', 'Claim online in 2 minutes'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-12 bg-white border-y border-border">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Premium Calculator</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {pets.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Your Pet</label>
                  <select value={selectedPetId} onChange={e => setSelectedPetId(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select pet…</option>
                    {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Pet Age</label>
                <select value={ageKey} onChange={e => setAgeKey(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring">
                  {Object.keys(AGE_MULTIPLIERS).map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Breed / Species</label>
                <select value={breedKey} onChange={e => setBreedKey(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring">
                  {Object.keys(BREED_MULTIPLIERS).map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold text-foreground text-center mb-10">Choose Your Plan</h2>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map(plan => {
                  const colors = TIER_COLORS[plan.tier];
                  const monthly = calcPremium(plan.monthlyPrice, ageKey, breedKey);
                  const isEnrolled = enrolledPlanId === plan.id;
                  const isPopular = plan.tier === 'standard';
                  const isExpanded = expandedPlan === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl border-2 p-6 transition-all ${colors.bg} ${colors.border} ${isPopular ? 'shadow-xl scale-[1.02]' : 'shadow-sm'}`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />Most Popular
                          </span>
                        </div>
                      )}
                      {isEnrolled && (
                        <div className="absolute -top-3 right-4">
                          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">✓ Active</span>
                        </div>
                      )}

                      <div className="mb-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${colors.badge}`}>
                          {plan.tier}
                        </span>
                        <h3 className="text-xl font-extrabold text-foreground mt-2 mb-1">{plan.name}</h3>
                        <div className="flex items-end gap-1">
                          <span className="text-3xl font-extrabold text-primary">A${(monthly / 100).toFixed(2)}</span>
                          <span className="text-muted-foreground text-sm mb-1">/month</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Coverage up to A${(plan.coverageLimit / 100).toLocaleString('en-AU')} · Excess A${(plan.excess / 100).toFixed(0)}
                        </p>
                      </div>

                      {/* Features toggle */}
                      <button
                        onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                        className="flex items-center gap-1 text-sm text-primary font-semibold mb-3"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? 'Hide' : 'Show'} features ({plan.features.length})
                      </button>

                      {isExpanded && (
                        <ul className="space-y-2 mb-4">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      <Button
                        className={`w-full h-11 font-semibold rounded-xl text-white mt-2 ${colors.btn}`}
                        onClick={() => handleEnroll(plan)}
                        disabled={!!enrolling || isEnrolled}
                      >
                        {enrolling === plan.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isEnrolled ? 'Currently Enrolled' : 'Get This Plan'}
                        {!isEnrolled && !enrolling && <ArrowRight className="w-4 h-4 ml-1" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Not included */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-lg font-bold text-foreground mb-4">What's Not Covered</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {['Pre-existing conditions', 'Cosmetic procedures', 'Breeding costs', 'Intentional injury'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              OmniPaws Insurance is underwritten by OmniPaws Insurance Pty Ltd (ABN 00 000 000 000). This is a simulation for demonstration purposes. Always read the Product Disclosure Statement (PDS) before purchasing insurance.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Insurance;
