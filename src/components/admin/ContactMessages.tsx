"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClientSupabase } from "@/lib/supabase";
import { 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Eye,
  User
} from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  source: string;
  created_at: string;
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/contact');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Real-time message updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('🔄 Real-time message update:', payload);
    
    switch (payload.eventType) {
      case 'INSERT': {
        const newMessage = payload.new;
        setMessages(prev => [newMessage, ...prev]);
        break;
      }
      case 'UPDATE': {
        const updatedMessage = payload.new;
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ));
        break;
      }
      case 'DELETE': {
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        break;
      }
    }
  }, []);

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'read' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'text-red-500';
      case 'read': return 'text-yellow-500';
      case 'replied': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <AlertCircle className="w-4 h-4" />;
      case 'read': return <Eye className="w-4 h-4" />;
      case 'replied': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClientSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('contact-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inquiries'
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRealtimeUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchMessages}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{messages.length} total messages</span>
        </div>
      </div>

      {messages.length === 0 ? (
        <EnhancedCard className="text-center p-8">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No messages yet</p>
        </EnhancedCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EnhancedCard className={`p-6 ${
                  message.status === 'unread' ? 'border-l-4 border-l-red-500 bg-red-50' : 'bg-white'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">{message.name}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${getStatusColor(message.status)}`}>
                          {getStatusIcon(message.status)}
                          <span className="text-xs font-medium capitalize">{message.status}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${message.email}`} className="hover:text-primary-600 transition-colors">
                            {message.email}
                          </a>
                        </div>
                        {message.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${message.phone}`} className="hover:text-primary-600 transition-colors">
                              {message.phone}
                            </a>
                          </div>
                        )}
                        {message.company && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{message.company}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(message.created_at)}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900 mb-1">{message.subject}</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{message.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {message.status === 'unread' && (
                        <motion.button
                          onClick={() => markAsRead(message.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => deleteMessage(message.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </EnhancedCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
