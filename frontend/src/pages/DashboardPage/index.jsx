import { useState, useEffect } from 'react';
import { Sidebar, Topbar } from './components';
import { Dashboard } from './Dashboard';
import { Analytics } from './Analytics';
import { PYQs } from './PYQs';
import { Leaderboard } from './Leaderboard';
import { Settings } from './Settings';
import { QuestionView } from './QuestionView';
import { userData } from './userData';
import { API_BASE_URL } from '@/config/constants';

export function DashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedQuestionSlug, setSelectedQuestionSlug] = useState('two-sum');
  const [user, setUser] = useState(userData);
  const [platforms, setPlatforms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const headers = { Authorization: `Bearer ${token}` };
        const [userRes, platRes, analyticsRes, compRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/me`, { headers }),
          fetch(`${API_BASE_URL}/platform-connections`, { headers }),
          fetch(`${API_BASE_URL}/daily-activity/analytics`, { headers }),
          fetch(`${API_BASE_URL}/companies`, { headers })
        ]);

        let hasError = false;
        if (!userRes.ok) { hasError = true; console.error('User fetch failed:', userRes.status); }
        if (!platRes.ok) { hasError = true; console.error('Platforms fetch failed:', platRes.status); }
        if (!analyticsRes.ok) { hasError = true; console.error('Analytics fetch failed:', analyticsRes.status); }
        if (!compRes.ok) { hasError = true; console.error('Companies fetch failed:', compRes.status); }

        if (hasError) {
          setError("Failed to fetch some dashboard data. Please try again later.");
        }

        if (userRes.ok) setUser(await userRes.json());
        if (platRes.ok) setPlatforms(await platRes.json());
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        if (compRes.ok) setCompanies(await compRes.json());
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
        setError("Network error occurred while fetching dashboard data.");
      }
    };
    
    fetchData();
  }, []);

  const handleSelectQuestion = (slug) => {
    setSelectedQuestionSlug(slug);
    setActiveSection('problems');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard user={user} platforms={platforms} analytics={analytics} />;
      case 'problems':
        return <QuestionView titleSlug={selectedQuestionSlug} />;
      case 'analytics':
        return <Analytics analytics={analytics} />;
      case 'pyqs':
        return <PYQs companies={companies} onSelectQuestion={handleSelectQuestion} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'settings':
        return <Settings platforms={platforms} />;
      default:
        return <Dashboard user={user} platforms={platforms} analytics={analytics} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0D1117]">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 ml-20 flex flex-col h-screen overflow-hidden">
        <Topbar user={user} onSectionChange={setActiveSection} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6 flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400 font-bold">×</button>
              </div>
            )}
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}