import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Shield, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-pets.jpg';

const HeroSection = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const trustItems = [
    { icon: CheckCircle2, label: '50,000+ Pet Owners' },
    { icon: Shield, label: '10,000+ Verified Providers' },
    { icon: Star, label: '4.9★ Average Rating' },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              Australia's #1 Pet Care Platform
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-foreground">
                Complete Pet Care,{' '}
                <span className="text-primary block">Powered by AI</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                AI-matched carers, digital health passports, online vet access, and 24/7 emergency GPS — one platform built for Australian pet lovers.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 text-base font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
                onClick={handleGetStarted}
              >
                Get Started Free →
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 h-13 text-base font-medium rounded-xl border-2 border-border hover:border-primary hover:text-primary transition-all"
                asChild
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero Image with Floating Cards */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 aspect-[4/3]">
              <img
                src={heroImage}
                alt="Happy pets in a modern Australian home"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=600&fit=crop&auto=format&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
            </div>

            {/* Floating Card — AI Match */}
            <div className="absolute -top-5 -left-5 bg-white rounded-2xl px-4 py-3 shadow-xl border border-border min-w-[180px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">AI Match Found!</p>
                  <p className="text-xs text-muted-foreground">Sophie A. — 94% match</p>
                </div>
              </div>
            </div>

            {/* Floating Card — Health Score */}
            <div className="absolute -bottom-5 left-8 bg-white rounded-2xl px-4 py-3 shadow-xl border border-border min-w-[170px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 font-extrabold text-sm">92</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Mango's Health</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-1.5 w-5 rounded-full ${i < 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card — Emergency Vet */}
            <div className="absolute top-1/2 -right-5 -translate-y-1/2 bg-white rounded-2xl px-4 py-3 shadow-xl border border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Emergency Vet</p>
                  <p className="text-xs text-muted-foreground">Available · 0.8km</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
