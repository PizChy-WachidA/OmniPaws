import { Link } from 'react-router-dom';
import { PawPrint, Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  const columns = [
    {
      title: 'Platform',
      links: [
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'Find Services', href: '/services' },
        { label: 'Pet Insurance', href: '/#insurance' },
        { label: 'Become a Provider', href: '#' },
      ],
    },
    {
      title: 'Pet Care',
      links: [
        { label: 'Veterinarians', href: '/services' },
        { label: 'Pet Sitters', href: '/services' },
        { label: 'Groomers', href: '/services' },
        { label: 'Dog Trainers', href: '/services' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'ABN 12 345 678 901', href: '#' },
      ],
    },
  ];

  const socials = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Omni<span className="text-primary">Paws</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Australia's most complete pet care platform, powered by AI.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {year} OmniPaws Pty Ltd. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Made with ❤️ for pet lovers across Australia 🇦🇺
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
