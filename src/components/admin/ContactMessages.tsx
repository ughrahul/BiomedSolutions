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
  User,
  MessageSquare,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { useMessages } from "@/contexts/MessageContext";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

interface ContactMessagesProps {
  limit?: number;
}

export default function ContactMessages({ limit }: ContactMessagesProps) {
  const { messages, loading, error, markAsRead, deleteMessage: deleteMessageFromContext } = useMessages();
  const [localError, setLocalError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  // Toggle message expansion
  const toggleMessage = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // No need to fetch messages - using MessageContext

  // Setup database tables
  const setupDatabase = async () => {
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Database setup failed');
      }

      // After successful setup, refresh messages from context
      // The MessageContext will handle the refresh
    } catch (error) {
      console.error('Database setup error:', error);
      setLocalError(error instanceof Error ? error.message : 'Database setup failed');
    }
  };

  // No need for separate real-time handling - MessageContext handles it

  // Using MessageContext functions instead of local ones

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${diffInMinutes} min ago`;
      }
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Get status color and styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'unread': 
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="w-4 h-4" />
        };
      case 'read': 
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800',
          icon: <Eye className="w-4 h-4" />
        };
      case 'replied': 
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        };
      default: 
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800',
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  // No need for separate real-time subscription - MessageContext handles it

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || localError) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error || localError}</p>
        <div className="flex gap-2 justify-center mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry
          </button>
          {error && error.includes('Database') && (
            <button 
              onClick={setupDatabase}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Setup Database
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate read/unread counts
  const unreadCount = messages.filter(msg => msg.status === 'unread').length;
  const readCount = messages.filter(msg => msg.status === 'read').length;

  return (
    <div className="space-y-3">
      {!limit && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 rounded-lg">
              <Mail className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Contact Messages</h3>
              <p className="text-xs text-gray-600">{messages.length} total messages</p>
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">{unreadCount} unread</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">{readCount} read</span>
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <EnhancedCard className="text-center p-6">
          <div className="p-2 bg-gray-100 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
            <Mail className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No Messages Yet</h3>
          <p className="text-xs text-gray-600">When customers contact you, their messages will appear here.</p>
        </EnhancedCard>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {(limit ? messages.slice(0, limit) : messages).map((message) => {
              const statusStyles = getStatusStyles(message.status);
              const isExpanded = expandedMessages.has(message.id);
              const messagePreview = message.message.length > 100 
                ? message.message.substring(0, 100) + '...' 
                : message.message;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EnhancedCard className={`overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer ${
                    message.status === 'unread' 
                      ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white' 
                      : 'border border-gray-200 bg-white'
                  }`}>
                    {/* Compact Header - Always Visible */}
                    <div 
                      className="p-3 border-b border-gray-100"
                      onClick={() => toggleMessage(message.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white flex-shrink-0">
                            <User className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-bold text-gray-900 truncate">{message.name}</h3>
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${statusStyles.badge}`}>
                                {statusStyles.icon}
                                {message.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(message.created_at)}</span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="truncate">{messagePreview}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content - Conditionally Visible */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          {/* Contact Details */}
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                            <div className="flex flex-wrap gap-3 text-xs">
                              <a 
                                href={`mailto:${message.email}`} 
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{message.email}</span>
                              </a>
                              {message.phone && (
                                <a 
                                  href={`tel:${message.phone}`} 
                                  className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{message.phone}</span>
                                </a>
                              )}
                              {message.organization && (
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Building2 className="w-3 h-3" />
                                  <span className="truncate">{message.organization}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Full Message Content */}
                          <div className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="p-1 bg-blue-100 rounded-lg mt-0.5 flex-shrink-0">
                                <MessageSquare className="w-3 h-3 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{message.message}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                            <div className="flex items-center justify-end gap-2">
                              {message.status === 'unread' && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(message.id);
                                  }}
                                  className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  title="Mark as read"
                                >
                                  <Eye className="w-3 h-3 inline mr-1" />
                                  Mark as Read
                                </motion.button>
                              )}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMessageFromContext(message.id);
                                }}
                                className="px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Delete message"
                              >
                                <Trash2 className="w-3 h-3 inline mr-1" />
                                Delete
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </EnhancedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
