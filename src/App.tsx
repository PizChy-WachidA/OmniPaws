import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PetPassport from "./pages/PetPassport";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Messaging from "./pages/Messaging";
import EmergencyMap from "./pages/EmergencyMap";
import Insurance from "./pages/Insurance";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/passport/:petId" element={<PetPassport />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book/:providerId" element={<Booking />} />
          <Route path="/messages/:bookingId" element={<Messaging />} />
          <Route path="/emergency" element={<EmergencyMap />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
