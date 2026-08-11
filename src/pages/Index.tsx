import { useNavigate } from 'react-router-dom';
import {
  Zap, QrCode, Stethoscope, AlertTriangle, ShieldCheck, Activity,
  CheckCircle, ArrowRight, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/features/HeroSection';
import { TESTIMONIALS } from '@/constants/mockData';

const FEATURES = [
  {
    icon: Zap,
    title: 'AI Smart Matching',
    description: "Our AI analyses your pet's personality, health profile, and location to recommend the perfect carer or vet.",
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: QrCode,
    title: 'Digital Pet Passport',
    description: 'QR-enabled health records accessible by any vet, anywhere in Australia. Never lose a vaccination record again.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Stethoscope,
    title: 'Online Vet Network',
    description: 'Telehealth consultations and in-clinic bookings with 200+ certified vets across all Australian states.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency GPS',
    description: '24/7 emergency vet locator with live GPS tracking and direct clinic routing. Peace of mind, always.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Providers',
    description: 'Multi-layer background checks, credentials verification, and real-time availability for all providers.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Activity,
    title: 'Pet Insurance',
    description: "Integrated with Australia's top insurers. Compare plans, file claims, and track coverage in-app.",
    color: 'bg-amber-100 text-amber-600',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Pet Profile',
    description: 'Add your pet with health history, vaccinations, and personality traits. Your Digital Passport is ready in minutes.',
  },
  {
    step: '02',
    title: 'AI Finds Best Matches',
    description: "Our algorithm analyses 50+ compatibility factors to surface providers perfectly suited to your pet's needs.",
  },
  {
    step: '03',
    title: 'Book & Track Everything',
    description: 'Confirm bookings, track GPS in real-time, and access health records — all from one seamless platform.',
  },
];

const STATS = [
  { value: '50,000+', label: 'Pet Owners' },
  { value: '10,000+', label: 'Verified Providers' },
  { value: '200+', label: 'Partner Clinics' },
  { value: '4.9★', label: 'App Rating' },
];

const Index = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                Everything Included
              </span>
              <h2 className="text-4xl font-extrabold text-foreground mb-4">
                Everything Your Pet Deserves
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                One subscription. Every service. The most comprehensive pet care platform ever built for Australia.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, description, color }) => (
                <div
                  key={title}
                  className="group p-7 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-200 bg-white hover:-translate-y-1 cursor-default"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-gradient-to-br from-teal-50/60 to-emerald-50/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-foreground mb-4">Up and Running in Minutes</h2>
              <p className="text-lg text-muted-foreground">Three simple steps to complete pet care.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
              {HOW_IT_WORKS.map(({ step, title, description }) => (
                <div key={step} className="relative text-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                    <span className="text-2xl font-extrabold text-white">{step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 font-semibold px-10 h-13 rounded-xl shadow-lg shadow-primary/30"
                onClick={handleGetStarted}
              >
                Start for Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">{value}</div>
                  <div className="text-primary-foreground/70 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-foreground mb-4">
                Loved by Pet Owners Across Australia
              </h2>
              <p className="text-lg text-muted-foreground">Real stories from real pet families.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(({ id, name, location, pet, avatar, text, rating }) => (
                <div key={id} className="bg-slate-50 rounded-2xl p-7 border border-border hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-4">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed mb-6 text-sm">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">{location} · {pet}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-slate-900" id="insurance">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
              Ready to Give Your Pet the Best?
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Join 50,000+ Australian pet owners. Free to get started — premium plans from $9.99/month.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-10 h-13 text-base font-semibold rounded-xl shadow-lg shadow-primary/40"
                onClick={handleGetStarted}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-slate-600 text-white hover:border-white hover:bg-white/5 px-10 h-13 text-base font-medium rounded-xl"
                onClick={() => navigate('/services')}
              >
                Browse Services
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-slate-400 text-sm">
              {['No credit card required', 'Cancel any time', 'ACCC compliant'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
