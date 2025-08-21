"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeContextType {
  isConnected: boolean;
  subscribeToTable: (table: string, callback: (payload: any) => void) => RealtimeChannel | null;
  unsubscribeFromTable: (channel: RealtimeChannel) => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  subscribeToTable: () => null,
  unsubscribeFromTable: () => {},
});

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [supabase] = useState(() => createClientSupabase());
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());

  useEffect(() => {
    if (!supabase) return;

    // Test connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('products').select('count').limit(1);
        if (!error) {
          setIsConnected(true);
          // Connection established successfully
        }
      } catch (error) {
        console.warn('⚠️ Database connection failed, using offline mode');
        setIsConnected(false);
      }
    };

    testConnection();

    return () => {
      // Clean up all channels
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
    };
  }, [supabase]);

  const subscribeToTable = useCallback((table: string, callback: (payload: any) => void): RealtimeChannel | null => {
    if (!supabase || !isConnected) return null;

    const channelName = `realtime:${table}`;
    
    // Remove existing channel if any
    const existingChannel = channelsRef.current.get(channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        // Subscription status updated
      });

    channelsRef.current.set(channelName, channel);
    return channel;
  }, [supabase, isConnected]);

  const unsubscribeFromTable = useCallback((channel: RealtimeChannel) => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
      // Remove from ref without triggering state update
      Array.from(channelsRef.current.entries()).forEach(([key, value]) => {
        if (value === channel) {
          channelsRef.current.delete(key);
        }
      });
    }
  }, [supabase]);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        subscribeToTable,
        unsubscribeFromTable,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

// Custom hook for specific table subscriptions
export const useRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  enabled: boolean = true
) => {
  const { subscribeToTable, unsubscribeFromTable, isConnected } = useRealtime();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Store callback in ref to avoid dependency issues
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // Store functions in refs to avoid dependency issues
  const subscribeToTableRef = useRef(subscribeToTable);
  const unsubscribeFromTableRef = useRef(unsubscribeFromTable);
  
  subscribeToTableRef.current = subscribeToTable;
  unsubscribeFromTableRef.current = unsubscribeFromTable;

  useEffect(() => {
    if (!enabled || !isConnected) return;

    const newChannel = subscribeToTableRef.current(table, (payload) => callbackRef.current(payload));
    setChannel(newChannel);

    return () => {
      if (newChannel) {
        unsubscribeFromTableRef.current(newChannel);
      }
    };
  }, [table, enabled, isConnected]); // Remove function dependencies

  return { isConnected, channel };
};

// Specific hooks for your database tables
export const useProductUpdates = (callback: (payload: any) => void) => {
  return useRealtimeSubscription('products', callback);
};

export const useContactMessageUpdates = (callback: (payload: any) => void) => {
  return useRealtimeSubscription('contact_messages', callback);
};



export const useCategoryUpdates = (callback: (payload: any) => void) => {
  return useRealtimeSubscription('categories', callback);
};
