"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map());

  useEffect(() => {
    if (!supabase) return;

    // Test connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('products').select('count').limit(1);
        if (!error) {
          setIsConnected(true);
          console.log('✅ Real-time database connection established');
        }
      } catch (error) {
        console.warn('⚠️ Database connection failed, using offline mode');
        setIsConnected(false);
      }
    };

    testConnection();

    return () => {
      // Clean up all channels
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [supabase, channels]);

  const subscribeToTable = (table: string, callback: (payload: any) => void): RealtimeChannel | null => {
    if (!supabase || !isConnected) return null;

    const channelName = `realtime:${table}`;
    
    // Remove existing channel if any
    const existingChannel = channels.get(channelName);
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
          console.log(`🔄 Real-time update for ${table}:`, payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status for ${table}:`, status);
      });

    setChannels(prev => new Map(prev.set(channelName, channel)));
    return channel;
  };

  const unsubscribeFromTable = (channel: RealtimeChannel) => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
      setChannels(prev => {
        const newChannels = new Map(prev);
        for (const [key, value] of newChannels) {
          if (value === channel) {
            newChannels.delete(key);
            break;
          }
        }
        return newChannels;
      });
    }
  };

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

  useEffect(() => {
    if (!enabled || !isConnected) return;

    const newChannel = subscribeToTable(table, callback);
    setChannel(newChannel);

    return () => {
      if (newChannel) {
        unsubscribeFromTable(newChannel);
      }
    };
  }, [table, callback, enabled, isConnected, subscribeToTable, unsubscribeFromTable]);

  return { isConnected, channel };
};

// Specific hooks for your database tables
export const useProductUpdates = (callback: (payload: any) => void) => {
  return useRealtimeSubscription('products', callback);
};

export const useContactMessageUpdates = (callback: (payload: any) => void) => {
  return useRealtimeSubscription('contact_messages', callback);
};

export const useInventoryUpdates = (callback: (payload: any) => void) => {
  return useRealtimeSubscription('inventory_history', callback);
};

export const useCategoryUpdates = (callback: (payload: any) => void) => {
  return useRealtimeSubscription('categories', callback);
};
