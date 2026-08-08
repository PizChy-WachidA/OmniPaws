import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, Menu, X, Bell, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Services', href: '/services' },
    { label: 'Insurance', href: '/#insurance' },
  ];

  const handleGetStarted = () => {
    login();
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold text-foreground">
              Omni<span className="text-primary">Paws</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                </Button>
                <Link to="/dashboard">
                  <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleGetStarted}>
                  Log In
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90 font-semibold px-5"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-2">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-foreground py-2.5 hover:text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button className="w-full bg-primary text-white" onClick={() => setMobileOpen(false)}>
                    My Dashboard
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full" onClick={handleGetStarted}>
                  Log In
                </Button>
                <Button className="w-full bg-primary text-white" onClick={handleGetStarted}>
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
