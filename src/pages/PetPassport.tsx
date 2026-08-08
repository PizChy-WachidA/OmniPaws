import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Shield, Phone, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import HealthScoreRing from '@/components/features/HealthScoreRing';
import QRCodeDisplay from '@/components/features/QRCodeDisplay';
import { usePets } from '@/hooks/usePets';

const statusStyles: Record<string, { color: string; icon: React.ElementType }> = {
  current: { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  due_soon: { color: 'text-amber-600 bg-amber-50', icon: Clock },
  overdue: { color: 'text-red-600 bg-red-50', icon: AlertTriangle },
};

const PetPassport = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { getPetById } = usePets();
  const pet = getPetById(petId ?? '');

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4">Pet not found</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const speciesEmoji: Record<string, string> = {
    dog: '🐶', cat: '🐱', bird: '🦜', rabbit: '🐰', reptile: '🦎',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Pet Header */}
        <div className="bg-gradient-to-r from-primary to-teal-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={pet.photo}
              alt={pet.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-lg shrink-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-extrabold">{pet.name}</h1>
                <span className="text-2xl">{speciesEmoji[pet.species]}</span>
              </div>
              <p className="text-teal-100 mb-3">{pet.breed} · {pet.age} yrs · {pet.weight}kg · {pet.color}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {pet.personality.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">{tag}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <HealthScoreRing score={pet.healthScore} size={90} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Digital Passport Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Digital Passport</h2>
              <div className="flex justify-center mb-4">
                <QRCodeDisplay />
              </div>
              <p className="text-center text-xs text-muted-foreground mb-5">Scan to access health records</p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Microchip ID</p>
                    <p className="font-mono font-semibold text-xs text-foreground">{pet.microchip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Insurance</p>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs capitalize mt-0.5">
                      {pet.insuranceStatus}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p className="font-semibold text-xs text-foreground">{pet.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Records */}
          <div className="lg:col-span-3 space-y-6">
            {/* Vaccinations */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Vaccinations</h2>
              <div className="space-y-3">
                {pet.vaccinations.map((vax, i) => {
                  const { color, icon: Icon } = statusStyles[vax.status];
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{vax.name}</p>
                        <p className="text-xs text-muted-foreground">{vax.clinic}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Next due</p>
                        <p className="text-xs font-semibold text-foreground">
                          {new Date(vax.nextDue).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health Records */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Health Records</h2>
              <div className="space-y-4">
                {pet.healthRecords.map((record, i) => (
                  <div key={i} className="border-l-4 border-primary pl-4 py-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground text-sm">{record.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{record.description}</p>
                    <p className="text-xs text-primary mt-1 font-medium">{record.vet} · {record.clinic}</p>
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

export default PetPassport;
