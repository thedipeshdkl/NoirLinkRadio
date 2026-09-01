import { Info, MapPin, Target, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="flex flex-col space-y-16">
        
        {/* Hero Section */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center md:justify-start mb-6">
            <Info className="w-10 h-10 mr-4 text-primary" />
            नोइरलिंक रेडियोको बारेमा
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl leading-relaxed">
            २०६३ देखि, नोइरलिंक रेडियो १०७.२ मेगाहर्ट्ज ताजा समाचार, उत्कृष्ट टक शो र उत्कृष्ट सांगीतिक हिटहरूका लागि प्रमुख गन्तव्य बनेको छ। हामी तपाईंलाई महत्त्वपूर्ण कथाहरू र तपाईंलाई मनपर्ने मनोरञ्जन दिनको २४ घण्टा, हप्ताको ७ दिन नै प्रदान गर्न समर्पित छौं।
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-border/50 bg-secondary/20">
            <CardContent className="p-8">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-3">हाम्रो लक्ष्य</h2>
              <p className="text-muted-foreground leading-relaxed">
                हाम्रो समुदायको विविधता र गतिशीलता झल्काउने उच्च गुणस्तरको प्रसारण मार्फत हाम्रा श्रोताहरूलाई सुचित, संलग्न र मनोरन्जन गर्नु। हामी समाचारको सबैभन्दा विश्वसनीय स्रोत र संगीत प्रेमीहरूको लागि अन्तिम साथी बन्न प्रयासरत छौं।
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-secondary/20">
            <CardContent className="p-8">
              <Radio className="w-10 h-10 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-3">हाम्रो दृष्टिकोण</h2>
              <p className="text-muted-foreground leading-relaxed">
                परम्परागत प्रसारणलाई आधुनिक, अन्तरक्रियात्मक डिजिटल प्लेटफर्महरूसँग निर्बाध रूपमा मिश्रण गरेर, ध्वनिको शक्ति मार्फत जोडिएको विश्वव्यापी समुदाय सिर्जना गर्दै डिजिटल रेडियो अनुभवमा क्रान्ति ल्याउनु।
              </p>
            </CardContent>
          </Card>
        </div>



        {/* Broadcasting Info */}
        <section className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-2/3 space-y-4">
              <h2 className="text-3xl font-extrabold flex items-center">
                <MapPin className="w-8 h-8 mr-3 text-primary" />
                प्रसारण जानकारी
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                नोइरलिंक रेडियो हाम्रो काठमाडौं २२, काठमाडौं, नेपालमा रहेको अत्याधुनिक स्टुडियोबाट प्रत्यक्ष प्रसारण हुन्छ। तपाईं स्थानीय रूपमा १०७.२ मेगाहर्ट्जमा सुन्न सक्नुहुन्छ, वा हाम्रो उच्च-गुणस्तरको डिजिटल स्ट्रिम र मोबाइल अनुप्रयोगहरू मार्फत विश्वव्यापी रूपमा सुन्न सक्नुहुन्छ।
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center md:justify-end">
              <div className="text-center p-6 bg-card rounded-2xl shadow-xl border border-border/50">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">फ्रिक्वेन्सी</p>
                <p className="text-5xl font-extrabold text-primary">107.2 <span className="text-2xl text-foreground">MHz</span></p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
