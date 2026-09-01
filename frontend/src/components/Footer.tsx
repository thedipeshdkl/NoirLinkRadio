import { Link } from 'react-router-dom';
import { Radio, Mail, Phone, MapPin, Share2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export function Footer() {
  const { data: settings } = useSettings();
  return (
    <footer className="bg-card border-t border-border mt-20 pt-16 pb-32 md:pb-16 text-card-foreground">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* About */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <Radio className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {settings?.general?.siteName ? (
                <span>{settings.general.siteName}</span>
              ) : (
                <>NoirLink<span className="text-primary">Radio</span></>
              )}
            </span>
          </Link>
          <div className="text-muted-foreground text-sm leading-relaxed mt-4 space-y-4">
            <p className="font-semibold text-foreground">समाचार • सूचना • सत्य</p>
            <p>ताजा समाचार, विश्वसनीय सूचना र तथ्यमा आधारित पत्रकारिता जहाँ समाचार केवल सुनिँदैन, बुझिन्छ।</p>
            <p>देशदेखि विदेशसम्मका महत्वपूर्ण घटनाक्रम, राजनीति, अर्थतन्त्र, समाज, प्रविधि र समसामयिक विषयका <span className="font-semibold text-foreground">विश्वसनीय समाचार</span> अब एउटै स्थानमा।</p>
            <p className="font-medium text-primary">तथ्यसँग जोडिनुहोस्। समयसँग अघि बढ्नुहोस्</p>
          </div>
          <div className="flex space-x-4 pt-2">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Share2 className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li><Link to="/radio" className="text-muted-foreground hover:text-primary transition-colors text-sm">Listen Live</Link></li>
            <li><Link to="/video" className="text-muted-foreground hover:text-primary transition-colors text-sm">Watch Live</Link></li>
            <li><Link to="/schedule" className="text-muted-foreground hover:text-primary transition-colors text-sm">Program Schedule</Link></li>
            <li><Link to="/presenters" className="text-muted-foreground hover:text-primary transition-colors text-sm">Our Presenters</Link></li>
            <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">About Us</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-bold text-lg mb-4">Categories</h3>
          <ul className="space-y-3">
            <li><Link to="/news?category=politics" className="text-muted-foreground hover:text-primary transition-colors text-sm">Politics</Link></li>
            <li><Link to="/news?category=entertainment" className="text-muted-foreground hover:text-primary transition-colors text-sm">Entertainment</Link></li>
            <li><Link to="/news?category=sports" className="text-muted-foreground hover:text-primary transition-colors text-sm">Sports</Link></li>
            <li><Link to="/podcasts" className="text-muted-foreground hover:text-primary transition-colors text-sm">Interviews</Link></li>
            <li><Link to="/news?category=technology" className="text-muted-foreground hover:text-primary transition-colors text-sm">Technology</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-lg mb-4">Contact Us</h3>
          <ul className="space-y-4">
            <li className="flex items-start space-x-3 text-sm text-muted-foreground">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{settings?.contact?.address || 'Kathmandu 22, Kathmandu, Nepal'}</span>
            </li>
            <li className="flex items-center space-x-3 text-sm text-muted-foreground">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{settings?.contact?.phone || '+977 1-4123456'}</span>
            </li>
            <li className="flex items-center space-x-3 text-sm text-muted-foreground">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{settings?.contact?.email || 'studio@noirlinkradio.com'}</span>
            </li>
          </ul>
        </div>

      </div>
      
      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-12 pt-8 border-t border-border flex flex-col items-center justify-center text-xs text-muted-foreground space-y-4">
        <div className="flex space-x-4">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
        <p className="text-center">
          &copy; {new Date().getFullYear()} All rights reserved <a href="https://dipeshdhakal1522.com.np/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Dipesh Dhakal</a>
        </p>
      </div>
    </footer>
  );
}
