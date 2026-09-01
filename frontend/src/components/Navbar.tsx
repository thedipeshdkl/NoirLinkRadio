import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Radio, Menu, X, Play, Video, LogOut, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { playLive, isPlaying, currentTrack } = useAudioPlayer();
  const { user, logout } = useAuth();
  const { data: settings } = useSettings();

  const { t, i18n } = useTranslation();

  const isLivePlaying = isPlaying && currentTrack?.isLive;

  const mainLinks = [
    { name: t('navbar.home'), path: '/' },
    { name: t('navbar.liveRadio'), path: '/radio' },
    { name: t('navbar.news'), path: '/news' },
    { name: t('navbar.podcasts'), path: '/podcasts' },
    { name: t('navbar.events'), path: '/programs' },
  ];

  const moreLinks = [
    { name: t('navbar.liveVideo'), path: '/video' },
    { name: 'Request Song', path: '/request' },
    { name: 'Library', path: '/library' },
    { name: 'Events', path: '/events' },
    { name: 'Presenters', path: '/presenters' },
    { name: 'Schedule', path: '/schedule' },
    { name: t('navbar.about'), path: '/about' },
    { name: t('navbar.contact'), path: '/contact' },
  ];

  if (user) {
    moreLinks.push({ name: 'Admin', path: '/admin' });
  }

  const allLinks = [...mainLinks, ...moreLinks];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/95 border-b border-border shadow-sm text-foreground">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Radio className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight hidden sm:block">
            {settings?.general?.siteName ? (
              <span>{settings.general.siteName}</span>
            ) : (
              <>NoirLink<span className="text-primary">Radio</span></>
            )}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-1">
          {mainLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.path ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground/70 transition-colors hover:text-primary outline-none">
              More <ChevronDown className="w-4 h-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {moreLinks.map((link) => (
                <DropdownMenuItem key={link.path} asChild>
                  <Link 
                    to={link.path}
                    className={`w-full cursor-pointer ${location.pathname === link.path ? 'text-primary font-bold' : ''}`}
                  >
                    {link.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors p-2">
            <Search className="w-5 h-5" />
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}
            className="font-bold text-muted-foreground hover:text-primary"
          >
            {i18n.language === 'en' ? 'NP' : 'EN'}
          </Button>

          <ThemeToggle />
          
          {user && (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden sm:flex text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          )}

          <Link to="/video" className="hidden sm:block">
            <Button size="sm" className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Video className="w-4 h-4" /> Watch Live
            </Button>
          </Link>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => playLive()}
            className={`font-bold flex items-center gap-2 ${isLivePlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'} text-white shadow-lg shadow-primary/20`}
          >
            {isLivePlaying ? (
              <><Radio className="w-4 h-4 animate-pulse" /> ON AIR</>
            ) : (
              <><Play className="w-4 h-4" /> Listen Live</>
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-[#0b1121]/95 backdrop-blur-xl border-b border-white/10 shadow-xl p-4 flex flex-col space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {allLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                location.pathname === link.path ? 'bg-primary text-primary-foreground' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/video" onClick={() => setIsOpen(false)} className="mt-4">
            <Button className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Video className="w-4 h-4 mr-2" /> Watch Live
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
