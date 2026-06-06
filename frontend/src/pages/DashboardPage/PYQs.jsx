import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { companies as mockCompanies, interviewSets, companyQuestions as mockQuestions } from './userData';
import { API_BASE_URL } from '@/config/constants';

export function PYQs({ companies, onSelectQuestion }) {
  const displayCompanies = companies?.length > 0 ? companies : mockCompanies;
  const [selectedCompany, setSelectedCompany] = useState(displayCompanies[0]?.slug || 'adobe');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [currentCompanyDetails, setCurrentCompanyDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [detailsRes, questionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/companies/${selectedCompany}`, { headers }),
          fetch(`${API_BASE_URL}/companies/${selectedCompany}/questions`, { headers })
        ]);
        
        let hasError = false;
        if (!detailsRes.ok) {
          const errText = await detailsRes.text();
          console.error('Failed to fetch company details:', errText);
          hasError = true;
        } else {
          const json = await detailsRes.json();
          setCurrentCompanyDetails(json.company);
        }
        
        if (!questionsRes.ok) {
          const errText = await questionsRes.text();
          console.error('Failed to fetch company questions:', errText);
          hasError = true;
        } else {
          const json = await questionsRes.json();
          // Map backend questions to frontend format
          const mappedQuestions = json.companyQuestions.map(cq => ({
            id: cq.question.id,
            title: cq.question.title,
            difficulty: cq.question.difficulty,
            frequency: cq.frequency || 'Occasional',
            solved: cq.solved || false,
            leetcodeUrl: cq.question.leetcodeUrl,
            tags: [] 
          }));
          setQuestions(mappedQuestions);
        }

        if (hasError) {
          setError('Failed to load real data. Falling back to mock data.');
        }
      } catch(e) {
        console.error(e);
        setError('Network error occurred. Falling back to mock data.');
      }
    };
    
    if (selectedCompany) fetchCompanyData();
  }, [selectedCompany]);

  const currentSet = currentCompanyDetails?.interviewSets?.[0] || interviewSets['adobe'];
  const displayQuestions = questions.length > 0 ? questions : mockQuestions['adobe'] || [];

  // Apply filters
  const filteredQuestions = displayQuestions.filter((question) => {
    const matchesDifficulty = difficultyFilter === 'all' || 
      question.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
    
    const matchesFrequency = frequencyFilter === 'all' || 
      question.frequency?.toLowerCase().replace(' ', '-') === frequencyFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'solved' ? question.solved : !question.solved);
    
    return matchesDifficulty && matchesFrequency && matchesStatus;
  });

  const difficultyColors = {
    EASY: 'text-[#10B981]',
    MEDIUM: 'text-[#FBBF24]',
    HARD: 'text-[#EF4444]',
  };

  const frequencyColors = {
    'Very High': 'text-[#FBBF24]',
    'High': 'text-[#FBBF24]',
    'Occasional': 'text-[#6B7280]',
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400 font-bold">×</button>
        </div>
      )}
      <div>
        <h1 className="text-[#E5E7EB] text-4xl font-bold font-Spline-Sans">Company Archives</h1>
      </div>

      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {displayCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company.slug || company.id)}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedCompany === (company.slug || company.id)
                  ? 'bg-[#FBBF24]/10 border-[#FBBF24]'
                  : 'bg-[#161B22] border-[#1F2937] hover:border-[#FBBF24]/20'
              }`}
            >
              <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-[#0D1117] font-bold text-xl font-Spline-Sans">
                  {company.name[0]}
                </span>
              </div>
              <h3 className="text-[#E5E7EB] font-bold text-sm font-Spline-Sans mb-1">{company.name}</h3>
              <p className="text-[#6B7280] text-xs font-JetBrains-Mono">{company.questionCount} Questions</p>
            </button>
          ))}
        </div>
      </div>

      {currentSet && (
        <div className="bg-[#161B22] rounded-xl p-8 border border-[#1F2937]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg flex items-center justify-center">
                <span className="text-[#0D1117] font-bold text-xl font-Spline-Sans">
                  {displayCompanies.find(c => (c.slug || c.id) === selectedCompany)?.name[0]}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[#E5E7EB] font-bold text-lg font-Spline-Sans">{currentSet.name}</h3>
                  <Badge variant="primary" className="!bg-[#FBBF24] !text-[#0D1117]">
                    {currentSet.tag}
                  </Badge>
                </div>
                <p className="text-[#6B7280] text-sm font-JetBrains-Mono">{currentSet.lastUpdated}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-2 font-JetBrains-Mono">EASY</p>
              <p className="text-[#10B981] text-2xl font-bold font-Spline-Sans">
                {currentSet.easy.count} <span className="text-[#6B7280] text-lg">/ {currentSet.easy.total}</span>
              </p>
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-2 font-JetBrains-Mono">MEDIUM</p>
              <p className="text-[#FBBF24] text-2xl font-bold font-Spline-Sans">
                {currentSet.medium.count} <span className="text-[#6B7280] text-lg">/ {currentSet.medium.total}</span>
              </p>
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-2 font-JetBrains-Mono">HARD</p>
              <p className="text-[#EF4444] text-2xl font-bold font-Spline-Sans">
                {currentSet.hard.count} <span className="text-[#6B7280] text-lg">/ {currentSet.hard.total}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#161B22] rounded-xl p-8 border border-[#1F2937]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setDifficultyFilter('all')}
              variant={difficultyFilter === 'all' ? 'accent' : 'outline'}
              size="sm"
              className={difficultyFilter === 'all' ? '!bg-[#FBBF24]' : '!bg-[#0D1117] !text-[#9CA3AF] hover:!text-[#E5E7EB] !border-transparent'}
            >
              All
            </Button>
            <Button
              onClick={() => setDifficultyFilter('easy')}
              variant={difficultyFilter === 'easy' ? 'accent' : 'outline'}
              size="sm"
              className={difficultyFilter === 'easy' ? '!bg-[#FBBF24]' : '!bg-[#0D1117] !text-[#9CA3AF] hover:!text-[#E5E7EB] !border-transparent'}
            >
              Easy
            </Button>
            <Button
              onClick={() => setDifficultyFilter('medium')}
              variant={difficultyFilter === 'medium' ? 'accent' : 'outline'}
              size="sm"
              className={difficultyFilter === 'medium' ? '!bg-[#FBBF24]' : '!bg-[#0D1117] !text-[#9CA3AF] hover:!text-[#E5E7EB] !border-transparent'}
            >
              Medium
            </Button>
            <Button
              onClick={() => setDifficultyFilter('hard')}
              variant={difficultyFilter === 'hard' ? 'accent' : 'outline'}
              size="sm"
              className={difficultyFilter === 'hard' ? '!bg-[#FBBF24]' : '!bg-[#0D1117] !text-[#9CA3AF] hover:!text-[#E5E7EB] !border-transparent'}
            >
              Hard
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#1F2937] rounded-lg px-3 py-2 text-[#E5E7EB] text-sm font-JetBrains-Mono focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="all">All Frequency</option>
              <option value="very-high">Very High</option>
              <option value="high">High</option>
              <option value="occasional">Occasional</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#1F2937] rounded-lg px-3 py-2 text-[#E5E7EB] text-sm font-JetBrains-Mono focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>

            <button className="text-[#9CA3AF] hover:text-[#FBBF24] text-sm font-JetBrains-Mono transition-colors px-3 py-2">
              Frequency (High to Low)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-[#0D1117] rounded-lg p-6 border border-[#1F2937] hover:border-[#FBBF24]/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-[#E5E7EB] font-bold font-Spline-Sans">{question.title}</h4>
                    <ExternalLink className="w-4 h-4 text-[#6B7280] hover:text-[#FBBF24] cursor-pointer transition-colors" />
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="!bg-[#1F2937] !text-[#9CA3AF]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className={`text-sm font-bold font-JetBrains-Mono ${difficultyColors[question.difficulty]}`}>
                      {question.difficulty}
                    </p>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <div className="flex items-center gap-1">
                      <span className="text-[#FBBF24]">⚡</span>
                      <p className={`text-sm font-JetBrains-Mono ${frequencyColors[question.frequency]}`}>
                        {question.frequency}
                      </p>
                    </div>
                  </div>

                  {question.solved && (
                    <Badge variant="success" className="!bg-[#10B981]/10 !text-[#10B981]">
                      Solved
                    </Badge>
                  )}

                  <Button 
                    variant="accent" 
                    size="sm" 
                    className="!bg-[#FBBF24] hover:!bg-[#D97706]"
                    onClick={() => {
                      if (onSelectQuestion) {
                        let slug = 'two-sum';
                        if (question.leetcodeUrl) {
                          const match = question.leetcodeUrl.match(/problems\/([^/]+)/);
                          if (match && match[1]) {
                            slug = match[1];
                          }
                        }
                        onSelectQuestion(slug);
                      }
                    }}
                  >
                    Solve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" size="sm" className="!text-[#FBBF24] hover:!text-[#D97706] !border-transparent hover:!border-transparent">
            Load More →
          </Button>
        </div>
      </div>
    </div>
  );
}   
