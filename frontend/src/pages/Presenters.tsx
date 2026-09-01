import { useQuery } from '@tanstack/react-query';
import { fetchPresenters } from '../api';
import { Link } from 'react-router-dom';

export default function Presenters() {
  const { data: presenters, isLoading, error } = useQuery({
    queryKey: ['presenters'],
    queryFn: fetchPresenters
  });

  if (isLoading) return <div className="container py-12 flex justify-center"><div className="animate-pulse flex space-x-4"><div className="rounded-full bg-slate-200 h-10 w-10"></div><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div></div></div></div></div>;
  if (error) return <div className="container py-12 text-destructive text-center">Failed to load presenters.</div>;

  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Our Presenters</h1>
        <p className="text-muted-foreground text-lg">Meet the voices behind our station.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {presenters?.map((presenter: any) => (
          <Link to={`/presenters/${presenter.slug}`} key={presenter.id} className="group flex flex-col items-center space-y-4 rounded-xl border p-6 bg-card text-card-foreground shadow-sm hover:shadow-md transition-all">
            <div className="relative w-32 h-32 overflow-hidden rounded-full ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
              {presenter.profileImageUrl ? (
                <img src={presenter.profileImageUrl} alt={presenter.name} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground/50">
                  {presenter.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">{presenter.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{presenter.bio || "Radio Presenter"}</p>
            </div>
          </Link>
        ))}
        {presenters?.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No presenters found.
          </div>
        )}
      </div>
    </div>
  );
}
