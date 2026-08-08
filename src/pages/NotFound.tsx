import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PawPrint, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50/40 to-white px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PawPrint className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold text-foreground mb-3">404</h1>
        <p className="text-xl font-bold text-foreground mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8">
          Looks like this page went for a walk and got lost. Let us take you home!
        </p>
        <Button
          asChild
          className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 h-12 rounded-xl"
        >
          <a href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
