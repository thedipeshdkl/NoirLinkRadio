import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Components
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { AudioPlayer } from './components/AudioPlayer'
import { BreakingNewsBanner } from './components/BreakingNewsBanner'
import { AIAssistant } from './components/AIAssistant'
import { Toaster } from 'sonner'

// Pages
import Home from './pages/Home'
import LiveRadio from './pages/LiveRadio'
import Podcasts from './pages/Podcasts'
import News from './pages/News'
import LiveVideo from './pages/LiveVideo'
import Programs from './pages/Programs'
import ProgramDetail from './pages/ProgramDetail'
import Schedule from './pages/Schedule'
import Presenters from './pages/Presenters'
import PresenterDetail from './pages/PresenterDetail'
import Search from './pages/Search'
import Request from './pages/Request'
import Favorites from './pages/Favorites'
import Events from './pages/Events'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Navigate } from 'react-router-dom'

import Login from './pages/admin/Login'

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  
  return <>{children}</>;
};

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AudioPlayerProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
              <BreakingNewsBanner />
              <Navbar />
              
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/radio" element={<LiveRadio />} />
                  <Route path="/video" element={<LiveVideo />} />
                  <Route path="/podcasts" element={<Podcasts />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/programs" element={<Programs />} />
                  <Route path="/programs/:id" element={<ProgramDetail />} />
                  <Route path="/presenters" element={<Presenters />} />
                  <Route path="/presenters/:slug" element={<PresenterDetail />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/request" element={<Request />} />
                  <Route path="/library" element={<Favorites />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  <Route path="/admin/login" element={<Login />} />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                </Routes>
              </main>

              <AIAssistant />
              <Footer />
              <AudioPlayer />
              <Toaster />
            </div>
          </BrowserRouter>
          </AudioPlayerProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App;
