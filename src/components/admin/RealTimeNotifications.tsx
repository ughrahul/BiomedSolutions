"use client";

import { useEffect } from "react";
import { createClientSupabase } from "@/lib/supabase";

export default function RealTimeNotifications() {
  useEffect(() => {
    const supabase = createClientSupabase();
    if (!supabase) return;

    // Subscribe to real-time notifications for contact messages
    const channel = supabase
      .channel('admin-contact-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_messages'
        },
        (payload) => {
          // New contact message received
          // The MessageContext will handle the real-time updates
          // This component just ensures the subscription is active
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contact_messages'
        },
        (payload) => {
          // Contact message updated
          // The MessageContext will handle the real-time updates
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'contact_messages'
        },
        (payload) => {
          // Contact message deleted
          // The MessageContext will handle the real-time updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // This component doesn't render any UI elements
  // It only handles real-time subscriptions
  return null;
}
