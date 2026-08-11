import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, AlertTriangle, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { MOCK_PROVIDERS } from '@/constants/mockData';
import { ServiceProvider } from '@/types';

// Leaflet loaded via CDN to avoid package.json modification
declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const EmergencyMap = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [radius, setRadius] = useState(10);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [userLocation] = useState<[number, number]>([-33.8908, 151.2743]); // Bondi Beach default
  const [filtered, setFiltered] = useState<ServiceProvider[]>([]);

  const emergencyProviders = MOCK_PROVIDERS.filter(p => p.isEmergency || p.type === 'vet');

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstance.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView(userLocation, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // User location marker
    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#0F766E;border:3px solid white;box-shadow:0 0 0 3px rgba(15,118,110,0.3);"></div>`,
      iconAnchor: [8, 8],
      className: '',
    });
    L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup('<b>Your Location</b>');
    mapInstance.current = map;
  }, [leafletLoaded, userLocation]);

  useEffect(() => {
    if (!leafletLoaded || !mapInstance.current) return;
    const L = window.L;
    const map = mapInstance.current as ReturnType<typeof L.map>;

    // Clear old markers
    markersRef.current.forEach((m) => (m as ReturnType<typeof L.marker>).remove());
    markersRef.current = [];

    // Filter by radius (using mock distances)
    const inRange = emergencyProviders.filter(p => (p.distance || 0) <= radius);
    setFiltered(inRange);

    inRange.forEach(provider => {
      const lat = provider.lat ?? userLocation[0] + (Math.random() - 0.5) * 0.05;
      const lng = provider.lng ?? userLocation[1] + (Math.random() - 0.5) * 0.05;
      const isEmergency = provider.isEmergency;
      const color = isEmergency ? '#dc2626' : '#0F766E';
      const icon = L.divIcon({
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;">🏥</div>`,
        iconAnchor: [16, 16],
        className: '',
      });
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:180px">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px">${provider.businessName}</p>
          <p style="color:#666;font-size:12px;margin:0 0 4px">${provider.location}</p>
          <p style="font-size:12px;margin:0 0 6px;color:${provider.openNow ? '#16a34a' : '#dc2626'}">${provider.openNow ? '● Open Now' : '● Closed'}</p>
          <a href="tel:${provider.phone}" style="color:#0F766E;font-size:12px;font-weight:600;">📞 ${provider.phone}</a>
        </div>
      `);
      markersRef.current.push(marker);
    });
  }, [leafletLoaded, radius, emergencyProviders, userLocation]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-3 border border-red-100">
            <AlertTriangle className="w-3.5 h-3.5" />
            Emergency Services
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Nearby Vets & Emergency Clinics</h1>
          <p className="text-muted-foreground">Real-time map of verified veterinary services near Bondi Beach, NSW</p>
        </div>

        {/* Radius Filter */}
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-muted-foreground shrink-0">Radius:</span>
          <div className="flex gap-2 flex-wrap">
            {RADIUS_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  radius === r ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-auto">{filtered.length} found</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: '500px' }}>
              {!leafletLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Click markers for details. Map data © OpenStreetMap contributors.</p>
          </div>

          {/* Provider List */}
          <div className="space-y-3 overflow-y-auto max-h-[540px] pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">🔍</p>
                <p className="font-semibold">No providers within {radius}km</p>
                <p className="text-sm">Try increasing the radius.</p>
              </div>
            ) : (
              filtered.map(provider => (
                <div key={provider.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <img src={provider.photo} alt={provider.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-foreground text-sm truncate">{provider.businessName}</h3>
                        {provider.isEmergency && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full shrink-0">24/7</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{provider.suburb}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold ${provider.openNow ? 'text-emerald-600' : 'text-red-500'}`}>
                          {provider.openNow ? '● Open Now' : '● Closed'}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />{provider.distance}km
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Response: {provider.responseTime}</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${provider.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Now
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 text-xs border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => navigate(`/book/${provider.id}`)}
                    >
                      Book Visit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMap;
