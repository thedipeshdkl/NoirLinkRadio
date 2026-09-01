import { fetchApi, fetchAuthApi } from './api/client';

// Helper to extract data from the structured response
const extractData = <T = any>(res: any): T => {
  if (res && res.success) {
    return res.data;
  }
  return res as T; // Fallback in case some endpoints don't use structured yet
};

// --- News ---
export const fetchNews = async () => extractData(await fetchApi('/news'));
export const createNews = async (data: any) => extractData(await fetchAuthApi('/news', { method: 'POST', body: JSON.stringify(data) }));
export const updateNews = async (id: number, data: any) => extractData(await fetchAuthApi(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
export const deleteNews = async (id: number) => extractData(await fetchAuthApi(`/news/${id}`, { method: 'DELETE' }));

// --- Schedule ---
export const fetchSchedule = async () => extractData(await fetchApi('/schedule'));
export const createSchedule = async (data: any) => extractData(await fetchAuthApi('/schedule', { method: 'POST', body: JSON.stringify(data) }));
export const updateSchedule = async (id: number, data: any) => extractData(await fetchAuthApi(`/schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
export const deleteSchedule = async (id: number) => extractData(await fetchAuthApi(`/schedule/${id}`, { method: 'DELETE' }));

// --- Programs ---
export const fetchPrograms = async () => extractData(await fetchApi('/programs'));
export const createProgram = async (data: any) => extractData(await fetchAuthApi('/programs', { method: 'POST', body: JSON.stringify(data) }));
export const updateProgram = async (id: number, data: any) => extractData(await fetchAuthApi(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
export const deleteProgram = async (id: number) => extractData(await fetchAuthApi(`/programs/${id}`, { method: 'DELETE' }));

// --- Podcasts ---
export const fetchPodcasts = async () => extractData(await fetchApi('/podcasts'));
export const createPodcast = async (data: any) => extractData(await fetchAuthApi('/podcasts', { method: 'POST', body: JSON.stringify(data) }));
export const updatePodcast = async (id: number, data: any) => extractData(await fetchAuthApi(`/podcasts/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
export const deletePodcast = async (id: number) => extractData(await fetchAuthApi(`/podcasts/${id}`, { method: 'DELETE' }));
export const fetchPodcastEpisodes = async (podcastId: number) => extractData(await fetchApi(`/podcasts/${podcastId}/episodes`));

// --- Live Video Events ---
export const fetchLiveVideo = async () => extractData(await fetchApi('/live-video'));

// --- Presenters ---
export const fetchPresenters = async () => extractData(await fetchApi('/presenters'));
export const fetchPresenter = async (slug: string) => extractData(await fetchApi(`/presenters/${slug}`));
export const createPresenter = async (data: any) => extractData(await fetchAuthApi('/presenters', { method: 'POST', body: JSON.stringify(data) }));
export const updatePresenter = async (id: number, data: any) => extractData(await fetchAuthApi(`/presenters/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
export const deletePresenter = async (id: number) => extractData(await fetchAuthApi(`/presenters/${id}`, { method: 'DELETE' }));

// --- Song Requests ---
export const fetchRequests = async () => extractData(await fetchAuthApi('/requests'));
export const createRequest = async (data: any) => extractData(await fetchApi('/requests', { method: 'POST', body: JSON.stringify(data) }));
export const updateRequest = async (id: number, data: any) => extractData(await fetchAuthApi(`/requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
export const deleteRequest = async (id: number) => extractData(await fetchAuthApi(`/requests/${id}`, { method: 'DELETE' }));

// --- Breaking News ---
export const fetchBreakingNews = async () => extractData(await fetchAuthApi('/breaking-news'));
export const fetchActiveBreakingNews = async () => extractData(await fetchApi('/breaking-news/active'));
export const createBreakingNews = async (data: any) => extractData(await fetchAuthApi('/breaking-news', { method: 'POST', body: JSON.stringify(data) }));
export const updateBreakingNews = async (id: number, data: any) => extractData(await fetchAuthApi(`/breaking-news/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
export const deleteBreakingNews = async (id: number) => extractData(await fetchAuthApi(`/breaking-news/${id}`, { method: 'DELETE' }));

// --- Analytics ---
export const trackEvent = async (data: any) => await fetchApi('/analytics', { method: 'POST', body: JSON.stringify(data) });
export const heartbeatSession = async (data: any) => extractData(await fetchApi('/sessions/heartbeat', { method: 'POST', body: JSON.stringify(data) }));
export const fetchAnalyticsStats = async () => extractData(await fetchAuthApi('/analytics/stats'));

// --- Favorites & History ---
export const fetchFavorites = async () => extractData(await fetchAuthApi('/favorites'));
export const toggleFavorite = async (data: any) => extractData(await fetchAuthApi('/favorites', { method: 'POST', body: JSON.stringify(data) }));
export const fetchHistory = async () => extractData(await fetchAuthApi('/history'));
export const syncPlaybackProgress = async (data: any) => extractData(await fetchAuthApi('/playback-progress', { method: 'POST', body: JSON.stringify(data) }));

// --- Polls ---
export const fetchPolls = async () => extractData(await fetchApi('/polls'));
export const createPoll = async (data: any) => extractData(await fetchAuthApi('/polls', { method: 'POST', body: JSON.stringify(data) }));
export const updatePoll = async (id: number, data: any) => extractData(await fetchAuthApi(`/polls/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
export const deletePoll = async (id: number) => extractData(await fetchAuthApi(`/polls/${id}`, { method: 'DELETE' }));
export const votePoll = async (id: number, optionId: number, userId?: number) => extractData(await fetchApi(`/polls/${id}/vote`, { method: 'POST', body: JSON.stringify({ optionId, userId }) }));

// --- Events ---
export const fetchEvents = async () => extractData(await fetchApi('/events'));
export const createEvent = async (data: any) => extractData(await fetchAuthApi('/events', { method: 'POST', body: JSON.stringify(data) }));
export const updateEvent = async (id: number, data: any) => extractData(await fetchAuthApi(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
export const deleteEvent = async (id: number) => extractData(await fetchAuthApi(`/events/${id}`, { method: 'DELETE' }));

// --- AI Features ---
export const sendAIChatMessage = async (message: string) => extractData(await fetchApi('/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }));

// --- System Health ---
export const fetchSystemHealth = async () => extractData(await fetchAuthApi('/system/health'));

// --- Auth ---
export const login = async (credentials: any) => await fetchAuthApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const logout = async () => await fetchAuthApi('/auth/logout', { method: 'POST' });
export const getMe = async () => await fetchAuthApi('/auth/me');

// --- Others ---
export const fetchSearch = async (query: string) => extractData(await fetchApi(`/search?q=${encodeURIComponent(query)}`));
export const subscribeNewsletter = async (email: string) => await fetchApi('/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
export const submitContactForm = async (data: any) => await fetchApi('/contact', { method: 'POST', body: JSON.stringify(data) });
export const fetchAuditLogs = async () => extractData(await fetchAuthApi('/audit-logs'));
