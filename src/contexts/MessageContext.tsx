"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRealtime } from "./RealtimeContext";
import { createClientSupabase } from "@/lib/supabase";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
}

interface MessageContextType {
  messages: ContactMessage[];
  unreadCount: number;
  readCount: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribeToTable, unsubscribeFromTable } = useRealtime();

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/contact");

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.messages) {
        throw new Error("Invalid response format from server");
      }

      // Sort by created_at in descending order (newest first)
      const sortedMessages = (data.messages || []).sort(
        (a: ContactMessage, b: ContactMessage) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setMessages(sortedMessages);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching messages:", error);
      }
      setError(
        error instanceof Error ? error.message : "Failed to fetch messages"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single message as read
  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        const response = await fetch(`/api/contact/${messageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "read" }),
        });

        if (!response.ok) {
          throw new Error("Failed to update message");
        }

        // Update local state immediately for better UX
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: "read" } : msg
          )
        );
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error updating message:", error);
        }
        // Refresh messages to ensure consistency
        await fetchMessages();
      }
    },
    [fetchMessages]
  );

  // Mark all messages as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadMessages = messages.filter((msg) => msg.status === "unread");

      if (unreadMessages.length === 0) return;

      // Update all unread messages in parallel
      await Promise.all(
        unreadMessages.map((msg) =>
          fetch(`/api/contact/${msg.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "read" }),
          })
        )
      );

      // Update local state immediately
      setMessages((prev) =>
        prev.map((msg) =>
          msg.status === "unread" ? { ...msg, status: "read" } : msg
        )
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error marking all messages as read:", error);
      }
      // Refresh messages to ensure consistency
      await fetchMessages();
    }
  }, [messages, fetchMessages]);

  // Delete message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const response = await fetch(`/api/contact/${messageId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete message");
        }

        // Update local state immediately
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error deleting message:", error);
        }
        // Refresh messages to ensure consistency
        await fetchMessages();
      }
    },
    [fetchMessages]
  );

  // Refresh messages
  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    // Real-time message update received

    switch (payload.eventType) {
      case "INSERT": {
        const newMessage = payload.new;
        setMessages((prev) => [newMessage, ...prev]);
        break;
      }
      case "UPDATE": {
        const updatedMessage = payload.new;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
        break;
      }
      case "DELETE": {
        setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        break;
      }
    }
  }, []);

  // Setup real-time subscription
  useEffect(() => {
    const channel = subscribeToTable("contact_messages", handleRealtimeUpdate);

    return () => {
      if (channel) {
        unsubscribeFromTable(channel);
      }
    };
  }, [subscribeToTable, unsubscribeFromTable, handleRealtimeUpdate]);

  // Additional real-time subscription for immediate updates
  useEffect(() => {
    const supabase = createClientSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("message-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_messages",
        },
        (payload) => {
          // New message notification received
          // Trigger a refresh to ensure immediate update
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Calculate counts
  const unreadCount = messages.filter((msg) => msg.status === "unread").length;
  const readCount = messages.filter((msg) => msg.status === "read").length;
  const totalCount = messages.length;

  const value: MessageContextType = {
    messages,
    unreadCount,
    readCount,
    totalCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    refreshMessages,
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};
