'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trophy,
  Plus,
  MessageSquare,
  TrendingUp,
  Target,
  Star,
  Play
} from 'lucide-react'

interface InterviewPrepTrackerProps {
  applications: any[]
}

const QUESTION_BANK = [
  { id: '1', question: 'Walk me through a DCF analysis', category: 'technical', difficulty: 'medium' },
  { id: '2', question: 'How does depreciation affect the three financial statements?', category: 'technical', difficulty: 'medium' },
  { id: '3', question: 'Tell me about a time you demonstrated leadership', category: 'behavioral', difficulty: 'easy' },
  { id: '4', question: 'Why investment banking?', category: 'fit', difficulty: 'easy' },
  { id: '5', question: 'What\'s your view on the current market?', category: 'market', difficulty: 'hard' },
  { id: '6', question: 'Walk me through an LBO model', category: 'technical', difficulty: 'hard' },
  { id: '7', question: 'Tell me about a deal you followed', category: 'deal', difficulty: 'medium' },
  { id: '8', question: 'How do you value a company with negative cash flows?', category: 'technical', difficulty: 'hard' },
]

export function InterviewPrepTracker({ applications }: InterviewPrepTrackerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'mock'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [practicedQuestions, setPracticedQuestions] = useState<Set<string>>(new Set())
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)

  const categories = ['all', 'technical', 'behavioral', 'market', 'fit', 'deal']
  
  const filteredQuestions = selectedCategory === 'all' 
    ? QUESTION_BANK 
    : QUESTION_BANK.filter(q => q.category === selectedCategory)

  const progress = {
    total: QUESTION_BANK.length,
    practiced: practicedQuestions.size,
    percentage: Math.round((practicedQuestions.size / QUESTION_BANK.length) * 100)
  }

  const upcomingInterviews = applications.filter((a: any) => 
    ['phone-screen', 'first-round', 'second-round', 'superday'].includes(a.status)
  )

  const handlePractice = (questionId: string) => {
    setPracticedQuestions(prev => new Set([...prev, questionId]))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Interview Prep
          </h2>
          <p className="text-slate-400 mt-1">Master your technicals and behavioral answers</p>
        </div>
        <div className="flex gap-2">
          {['overview', 'questions', 'mock'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Prep Progress
                </h3>
                <span className="text-2xl font-bold text-emerald-400">{progress.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                />
              </div>
              <p className="text-sm text-slate-400 mt-3">
                {progress.practiced} of {progress.total} questions practiced
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Upcoming Interviews
              </h3>
              {upcomingInterviews.length === 0 ? (
                <p className="text-slate-500 text-sm">No upcoming interviews scheduled</p>
              ) : (
                <div className="space-y-2">
                  {upcomingInterviews.slice(0, 3).map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                      <span className="text-sm text-slate-200">{app.firm}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        {app.status.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Achievements
              </h3>
              <div className="space-y-2">
                <Achievement 
                  title="First Practice" 
                  description="Practice your first question" 
                  unlocked={progress.practiced >= 1}
                  icon={Star}
                />
                <Achievement 
                  title="Getting Warm" 
                  description="Practice 5 questions" 
                  unlocked={progress.practiced >= 5}
                  icon={Target}
                />
                <Achievement 
                  title="Interview Ready" 
                  description="Practice 10 questions" 
                  unlocked={progress.practiced >= 10}
                  icon={Trophy}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickActionButton
                icon={Brain}
                label="Practice Technicals"
                onClick={() => { setSelectedCategory('technical'); setActiveTab('questions') }}
              />
              <QuickActionButton
                icon={MessageSquare}
                label="Behavioral Prep"
                onClick={() => { setSelectedCategory('behavioral'); setActiveTab('questions') }}
              />
              <QuickActionButton
                icon={Play}
                label="Mock Interview"
                onClick={() => setActiveTab('mock')}
              />
              <QuickActionButton
                icon={TrendingUp}
                label="View Progress"
                onClick={() => setActiveTab('overview')}
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'questions' && (
        <div className="glass-card p-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredQuestions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  practicedQuestions.has(q.id)
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                }`}
                onClick={() => { setSelectedQuestion(q); setShowQuestionModal(true) }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        q.category === 'technical' ? 'bg-blue-500/20 text-blue-400' :
                        q.category === 'behavioral' ? 'bg-purple-500/20 text-purple-400' :
                        q.category === 'market' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-600 text-slate-300'
                      }`}>
                        {q.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                        q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-200">{q.question}</p>
                  </div>
                  <div className="ml-4">
                    {practicedQuestions.has(q.id) ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mock' && (
        <div className="glass-card p-6 text-center py-16">
          <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Mock Interview Mode</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Practice with a simulated interview experience. Record yourself and review your answers.
          </p>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-all"
            onClick={() => alert('Mock interview mode coming soon!')}
          >
            Start Mock Interview
          </button>
        </div>
      )}

      {/* Question Detail Modal */}
      {showQuestionModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  selectedQuestion.category === 'technical' ? 'bg-blue-500/20 text-blue-400' :
                  selectedQuestion.category === 'behavioral' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {selectedQuestion.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                  selectedQuestion.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {selectedQuestion.difficulty}
                </span>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-6">{selectedQuestion.question}</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Your Notes</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                placeholder="Write your answer outline here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handlePractice(selectedQuestion.id)
                  setShowQuestionModal(false)
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all"
              >
                Mark as Practiced
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function Achievement({ 
  title, 
  description, 
  unlocked, 
  icon: Icon 
}: { 
  title: string
  description: string
  unlocked: boolean
  icon: React.ElementType
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${
      unlocked ? 'bg-emerald-500/10' : 'bg-slate-800/30'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        unlocked ? 'bg-emerald-500/20' : 'bg-slate-700'
      }`}>
        <Icon className={`w-5 h-5 ${unlocked ? 'text-emerald-400' : 'text-slate-500'}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${unlocked ? 'text-white' : 'text-slate-500'}`}>{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      {unlocked && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
    </div>
  )
}

function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: React.ElementType
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>
      <span className="text-sm font-medium text-slate-300 group-hover:text-white">{label}</span>
    </button>
  )
}
