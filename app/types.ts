// Types for RecruitTracker

export interface Contact {
  id: string
  user_id?: string
  name: string
  firm: string
  title: string
  email: string
  phone?: string
  linkedin_url?: string
  tags: string[]
  notes_count?: number
  last_contacted?: string
  created_at?: string
  updated_at?: string
}

export interface Application {
  id: string
  user_id?: string
  firm: string
  role: string
  location?: string
  status: ApplicationStatus
  applied_date?: string
  deadline_date?: string
  offer_deadline?: string
  compensation?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export type ApplicationStatus = 
  | 'applied' 
  | 'phone-screen' 
  | 'first-round' 
  | 'second-round' 
  | 'superday' 
  | 'offer' 
  | 'rejected' 
  | 'withdrawn' 
  | 'accepted'

export interface CalendarEvent {
  id: string
  user_id?: string
  google_event_id?: string
  title: string
  description?: string
  firm?: string
  event_type: EventType
  start_time: string
  end_time: string
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  contact_ids?: string[]
  created_at?: string
}

export type EventType = 
  | 'coffee' 
  | 'info-session' 
  | 'phone-screen' 
  | 'first-round' 
  | 'superday' 
  | 'follow-up'

export interface Note {
  id: string
  user_id?: string
  title: string
  content?: string
  parent_id?: string | null
  contact_id?: string | null
  event_id?: string | null
  application_id?: string | null
  firm?: string | null
  is_folder?: boolean
  created_at?: string
  updated_at?: string
}

export interface Activity {
  id: string
  user_id?: string
  type: 'contact' | 'application' | 'event' | 'note'
  action: 'created' | 'updated' | 'deleted' | 'status_changed'
  title: string
  description?: string
  entity_id: string
  metadata?: Record<string, any>
  created_at?: string
}

export interface DashboardStats {
  totalContacts: number
  totalApplications: number
  activeApplications: number
  upcomingEvents: number
  offersReceived: number
  interviewsThisWeek: number
  // Analytics
  conversionRate: number
  avgTimeToOffer: number
  responseRate: number
  topFirms: { firm: string; count: number }[]
  stageDistribution: Record<ApplicationStatus, number>
}

export interface InterviewPrep {
  id: string
  user_id?: string
  application_id: string
  round_type: 'behavioral' | 'technical' | 'superday' | 'case' | 'fit'
  status: 'not_started' | 'in_progress' | 'ready' | 'completed'
  questions: InterviewQuestion[]
  notes?: string
  mock_interviews: MockInterview[]
  created_at?: string
  updated_at?: string
}

export interface InterviewQuestion {
  id: string
  question: string
  category: 'technical' | 'behavioral' | 'market' | 'fit' | 'deal'
  difficulty: 'easy' | 'medium' | 'hard'
  answer_notes?: string
  practiced_count: number
  last_practiced?: string
}

export interface MockInterview {
  id: string
  date: string
  partner_name?: string
  feedback?: string
  rating?: number
}

export interface FirmResearch {
  id: string
  user_id?: string
  firm: string
  culture_score?: number
  deal_exposure?: string
  work_life_balance?: string
  compensation_notes?: string
  pros?: string[]
  cons?: string[]
  key_contacts: string[]
  interview_insights?: string
  recent_deals?: string
  created_at?: string
  updated_at?: string
}

export interface DeadlineReminder {
  id: string
  user_id?: string
  type: 'application' | 'offer_deadline' | 'follow_up' | 'interview_prep'
  title: string
  entity_id: string
  due_date: string
  is_urgent: boolean
  completed: boolean
  created_at?: string
}

export interface RecentActivity {
  id: string
  type: 'contact' | 'application' | 'event' | 'note'
  action: 'created' | 'updated' | 'completed'
  title: string
  entityName: string
  timestamp: string
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  'applied': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'phone-screen': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'first-round': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'second-round': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'superday': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'offer': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
  'withdrawn': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  'accepted': 'bg-green-500/20 text-green-300 border-green-500/30',
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  'applied': 'Applied',
  'phone-screen': 'Phone Screen',
  'first-round': 'First Round',
  'second-round': 'Second Round',
  'superday': 'Superday',
  'offer': 'Offer',
  'rejected': 'Rejected',
  'withdrawn': 'Withdrawn',
  'accepted': 'Accepted',
}

export const STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'phone-screen',
  'first-round',
  'second-round',
  'superday',
  'offer',
  'rejected',
  'withdrawn',
  'accepted'
]

export const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  'coffee': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  'info-session': { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  'phone-screen': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  'first-round': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  'superday': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  'follow-up': { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' },
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  'coffee': 'Coffee Chat',
  'info-session': 'Info Session',
  'phone-screen': 'Phone Screen',
  'first-round': 'First Round',
  'superday': 'Superday',
  'follow-up': 'Follow-up',
}

export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  'coffee': '☕',
  'info-session': 'ℹ️',
  'phone-screen': '📞',
  'first-round': '🎯',
  'superday': '💼',
  'follow-up': '🔄',
}
