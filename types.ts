
export interface LeadReminder {
  dateTime: string;
  type: 'call' | 'whatsapp' | 'message';
  note?: string;
  completed: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: string;
  createdAt: number;
  reminder?: LeadReminder;
}

export interface DownlineMember {
  id: string;
  name: string;
  phone: string;
  rank: string;
  joinedAt: string;
}

export interface IncomeEntry {
  id: string;
  amount: number;
  source: string;
  date: string;
}

export type TemplateType = 'WhatsApp Text' | 'Audio Script' | 'Video Script';

export interface MessageTemplate {
  id: string;
  user_id?: string;
  templateName: string; // mapped from template_name
  templateType: TemplateType; // mapped from template_type
  content: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SuccessStory {
  id: string;
  name: string;
  company: string;
  position: string;
  imageUrl?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'contacted' | 'archived';
  created_at: string;
}

export type PlanType = 'Free' | 'Starter' | 'Advance' | 'Business';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  plan: PlanType;
  isPaid: boolean;
  expiresAt?: string;
}

export type ViewState = 'landing' | 'login' | 'signup' | 'forgot' | 'dashboard' | 'admin' | 'privacy' | 'terms' | 'contact' | 'pricing';
export type DashboardTab = 'overview' | 'ai-coach' | 'content-gen' | 'leads' | 'team' | 'income' | 'tasks' | 'templates' | 'profile' | 'contact' | 'success-stories' | 'billing' | 'video-studio';

export type ActiveTab = 'chat' | 'leads' | 'tasks' | 'templates';
