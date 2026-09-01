import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { fetchPrograms, fetchPresenters } from '../api';
import { Button } from '../components/ui/button';
import { ArrowLeft, Radio, Calendar } from 'lucide-react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const { playLive } = useAudioPlayer();

  const { data: programs, isLoading, error } = useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms
  });

  const { data: presenters } = useQuery({
    queryKey: ['presenters'],
    queryFn: fetchPresenters
  });

  const program = programs?.find((p: any) => p.id.toString() === id);
  const presenter = presenters?.find((p: any) => p.name === program?.presenter);

  if (isLoading) return <div className="container py-12 flex justify-center">Loading...</div>;
  if (error || !program) return <div className="container py-12 text-destructive text-center">Program not found.</div>;

  return (
    <div className="container py-12 space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/programs"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Programs</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-square overflow-hidden rounded-xl shadow-lg ring-4 ring-muted">
            <img 
              src={program.imageUrl || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80"} 
              alt={program.title}
              className="object-cover w-full h-full"
            />
          </div>
          
          <Button 
            size="lg" 
            className="w-full rounded-full"
            onClick={() => playLive({ title: program.title, presenter: program.presenter, imageUrl: program.imageUrl })}
          >
            <Radio className="w-5 h-5 mr-2" /> Listen Live
          </Button>
        </div>
        
        <div className="w-full md:w-2/3 space-y-6">
          <div>
            <div className="text-sm font-semibold text-primary mb-2 tracking-wider uppercase">
              {program.category || 'Radio Show'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">{program.title}</h1>
          </div>
          
          <div className="flex items-center space-x-4 bg-muted/50 p-4 rounded-xl border">
            {presenter ? (
               <Link to={`/presenters/${presenter.slug}`} className="flex items-center space-x-4 hover:bg-accent p-2 -m-2 rounded-lg transition-colors">
                  <img src={presenter.profileImageUrl || '/dipesh.jpg'} alt={presenter.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="text-sm text-muted-foreground">Presented by</div>
                    <div className="font-semibold">{presenter.name}</div>
                  </div>
               </Link>
            ) : (
              <div className="flex items-center space-x-4">
                  <img src={program.presenterImage || '/dipesh.jpg'} alt={program.presenter} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="text-sm text-muted-foreground">Presented by</div>
                    <div className="font-semibold">{program.presenter}</div>
                  </div>
               </div>
            )}
            
            <div className="ml-auto pl-4 border-l">
               <div className="flex items-center text-sm font-medium text-foreground/80">
                  <Calendar className="w-4 h-4 mr-2 text-primary" /> 
                  {program.startTime && program.endTime ? `${program.startTime} - ${program.endTime}` : 'Schedule TBD'}
               </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-lg">
            <p className="whitespace-pre-wrap leading-relaxed">{program.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
