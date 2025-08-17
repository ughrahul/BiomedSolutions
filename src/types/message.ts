// Message and contact form type definitions

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'responded' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'email' | 'phone' | 'social';
  tags?: string[];
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  response_sent_at?: string;
  resolved_at?: string;
}

export interface CreateContactMessage {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  source?: 'website' | 'email' | 'phone' | 'social';
}

export interface UpdateContactMessage {
  status?: 'unread' | 'read' | 'responded' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  notes?: string;
  assigned_to?: string;
}

export interface MessageResponse {
  id: string;
  message_id: string;
  content: string;
  response_type: 'email' | 'phone' | 'internal_note';
  sent_by: string;
  sent_by_name?: string;
  sent_at: string;
  email_sent: boolean;
  email_sent_at?: string;
}

export interface MessageStats {
  total: number;
  unread: number;
  read: number;
  responded: number;
  resolved: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  today: number;
  this_week: number;
  this_month: number;
}

export interface MessageFilter {
  status?: 'unread' | 'read' | 'responded' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  source?: 'website' | 'email' | 'phone' | 'social';
  date_from?: string;
  date_to?: string;
  assigned_to?: string;
  search?: string;
}

export interface MessageSort {
  field: 'created_at' | 'updated_at' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}
