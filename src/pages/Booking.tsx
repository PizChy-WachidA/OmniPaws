import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Calendar, Clock, PawPrint, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/layout/Navbar';
import { MOCK_PROVIDERS } from '@/constants/mockData';
import { usePets } from '@/hooks/usePets';
import { useAuth } from '@/hooks/useAuth';
import { Booking } from '@/types';
import { toast } from 'sonner';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

const BookingPage = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { pets } = usePets();
  const { user, login } = useAuth();

  const provider = MOCK_PROVIDERS.find(p => p.id === providerId);

  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4">Provider not found</p>
          <Button onClick={() => navigate('/services')}>Browse Services</Button>
        </div>
      </div>
    );
  }

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const minDate = new Date().toISOString().split('T')[0];

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time slot.');
      return;
    }
    if (!user) login();

    const booking: Booking = {
      id: `book-${Date.now()}`,
      providerId: provider.id,
      providerName: provider.businessName,
      providerType: provider.type,
      petId: selectedPetId,
      petName: selectedPet?.name ?? '',
      date: selectedDate,
      time: selectedTime,
      status: 'upcoming',
      total: provider.priceFrom,
      notes,
    };

    const existing: Booking[] = JSON.parse(localStorage.getItem('omnipaws_bookings') ?? '[]');
    localStorage.setItem('omnipaws_bookings', JSON.stringify([booking, ...existing]));
    setIsBooked(true);
  };

  if (isBooked) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-24 pb-16 text-center">
          <div className="bg-white rounded-3xl border border-border p-10 shadow-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-8">Your booking has been placed and the provider has been notified.</p>

            <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-semibold">{provider.businessName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pet</span>
                <span className="font-semibold">{selectedPet?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-semibold">
                  {selectedDate && new Date(selectedDate).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-semibold">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-extrabold text-primary text-base">A${provider.priceFrom}</span>
              </div>
            </div>

            <Button
              className="w-full bg-primary text-white font-semibold rounded-xl h-12"
              onClick={() => navigate('/dashboard')}
            >
              View in Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground mb-1">Book Appointment</h1>
              <p className="text-muted-foreground text-sm">Fill in the details below to confirm your booking.</p>
            </div>

            {/* Pet Selection */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-primary" /> Select Pet
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {pets.map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedPetId === pet.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <img src={pet.photo} alt={pet.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">{pet.breed}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Select Date
              </h3>
              <input
                type="date"
                min={minDate}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white"
              />
            </div>

            {/* Time Slots */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Select Time
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      selectedTime === time
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary/40 text-foreground'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-3">Additional Notes (optional)</h3>
              <Textarea
                placeholder="Any special requirements or information about your pet..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="rounded-xl border-border resize-none min-h-[90px]"
              />
            </div>

            <Button
              className="w-full bg-primary text-white font-semibold rounded-xl h-13 text-base shadow-lg shadow-primary/30 hover:bg-primary/90"
              onClick={handleConfirm}
            >
              Confirm Booking — A${provider.priceFrom}
            </Button>
          </div>

          {/* Provider Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border p-5 sticky top-24">
              <img
                src={provider.photo}
                alt={provider.name}
                className="w-full h-40 object-cover rounded-xl mb-4"
              />
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">{provider.businessName}</h3>
                {provider.verified && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{provider.name}</p>
              <div className="flex items-center gap-3 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{provider.rating}</span>
                  <span className="text-muted-foreground">({provider.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{provider.distance}km away</span>
                </div>
              </div>

              {provider.aiMatchScore !== undefined && (
                <div className="bg-primary/10 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">Your AI Match Score</span>
                  <span className="text-2xl font-extrabold text-primary">{provider.aiMatchScore}%</span>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="font-semibold">A${provider.priceFrom}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <span>{provider.priceUnit}</span>
                  <span>GST included</span>
                </div>
                <div className="flex justify-between font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary text-lg">A${provider.priceFrom}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
