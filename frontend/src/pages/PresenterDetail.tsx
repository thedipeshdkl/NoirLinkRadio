import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { fetchPresenter, fetchPrograms } from '../api';
import { Button } from '../components/ui/button';
import { Play, Globe, MessageCircle } from 'lucide-react';

export default function PresenterDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: presenter, isLoading, error } = useQuery({
    queryKey: ['presenter', slug],
    queryFn: () => fetchPresenter(slug!),
    enabled: !!slug
  });

  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms
  });

  if (isLoading) return <div className="container py-12 flex justify-center">Loading...</div>;
  if (error || !presenter) return <div className="container py-12 text-destructive text-center">Presenter not found.</div>;

  // Filter programs for this presenter
  // Note: the schema currently uses presenter name string, so we'll match on that for now
  // Ideally, programs should have a presenterId foreign key.
  const presenterPrograms = programs?.filter((p: any) => p.presenter === presenter.name) || [];

  let socialLinks = {};
  try {
    if (presenter.socialLinks) {
      socialLinks = typeof presenter.socialLinks === 'string' ? JSON.parse(presenter.socialLinks) : presenter.socialLinks;
    }
  } catch (e) {
    console.error("Failed to parse social links", e);
  }

  return (
    <div className="container py-12 space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/presenters"><Play className="mr-2 h-4 w-4 rotate-180"/> Back to Presenters</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
          <div className="relative w-48 h-48 md:w-64 md:h-64 overflow-hidden rounded-xl shadow-lg ring-4 ring-muted">
            {presenter.profileImageUrl ? (
              <img src={presenter.profileImageUrl} alt={presenter.name} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-6xl font-bold text-muted-foreground/50">
                {presenter.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex gap-4 pt-4">
            {(socialLinks as any).twitter && (
              <a href={(socialLinks as any).twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
            {(socialLinks as any).instagram && (
              <a href={(socialLinks as any).instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
            {(socialLinks as any).website && (
              <a href={(socialLinks as any).website} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">{presenter.name}</h1>
          </div>
          
          <div className="prose dark:prose-invert max-w-none text-lg">
            {presenter.bio ? (
              <p className="whitespace-pre-wrap leading-relaxed">{presenter.bio}</p>
            ) : (
              <p className="text-muted-foreground italic">No biography available yet.</p>
            )}
          </div>

          <div className="pt-8 border-t">
            <h2 className="text-2xl font-semibold mb-6">Programs</h2>
            {presenterPrograms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {presenterPrograms.map((program: any) => (
                  <Link to={`/programs/${program.id}`} key={program.id} className="block p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors">
                    <h3 className="font-semibold text-lg">{program.title}</h3>
                    {program.category && <p className="text-sm text-muted-foreground mt-1">{program.category}</p>}
                    {(program.startTime && program.endTime) && (
                      <p className="text-sm mt-2">{program.startTime} - {program.endTime}</p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">This presenter does not have any assigned programs currently.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
