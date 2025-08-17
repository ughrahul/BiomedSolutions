"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  History,
  Search,
  Calendar,
  Package,
  TrendingUp,
  Plus,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";

interface InventoryHistoryProps {
  className?: string;
}

interface HistoryEntry {
  id: string;
  product_id: string;
  product_name: string;
  user_id: string;
  user_name: string;
  action: string;
  description: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

export default function InventoryHistory({
  className = "",
}: InventoryHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");

  // Simplified action types - fewer options for better UX
  const actionTypes = [
    { value: "all", label: "All Actions", icon: History, color: "gray" },
    { value: "created", label: "Created", icon: Plus, color: "green" },
    { value: "updated", label: "Updated", icon: Edit, color: "blue" },
    { value: "stock_changed", label: "Stock Changed", icon: Package, color: "orange" },
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/inventory-history");

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((entry) => {
    const matchesSearch = entry.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = selectedAction === "all" || entry.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created": return <Plus className="w-4 h-4 text-green-600" />;
      case "updated": return <Edit className="w-4 h-4 text-blue-600" />;
      case "deleted": return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "stock_changed": return <Package className="w-4 h-4 text-orange-600" />;

      case "activated": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "deactivated": return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created": return "bg-green-50 border-green-200 text-green-800";
      case "updated": return "bg-blue-50 border-blue-200 text-blue-800";
      case "deleted": return "bg-red-50 border-red-200 text-red-800";
      case "stock_changed": return "bg-orange-50 border-orange-200 text-orange-800";

      case "activated": return "bg-green-50 border-green-200 text-green-800";
      case "deactivated": return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Inventory History
          </h2>
          <p className="text-gray-600">
            Track all changes made to your product inventory
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <History className="w-4 h-4" />
          <span>{filteredHistory.length} entries</span>
        </div>
      </div>

      {/* Simplified Filters */}
      <EnhancedCard variant="outline" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <EnhancedInput
              type="text"
              placeholder="Search by product name, action, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              variant="outline"
            />
          </div>

          {/* Action Filter - Simplified */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex gap-2 overflow-x-auto">
              {actionTypes.map((action) => (
                <EnhancedButton
                  key={action.value}
                  variant={selectedAction === action.value ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAction(action.value)}
                  icon={<action.icon className="w-4 h-4" />}
                  className="whitespace-nowrap"
                >
                  {action.label}
                </EnhancedButton>
              ))}
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {actionTypes.filter(a => a.value !== 'all').map((action) => {
          const count = history.filter(h => h.action === action.value).length;
          return (
            <EnhancedCard key={action.value} variant="outline" padding="sm" className="text-center">
              <action.icon className={`w-6 h-6 mx-auto mb-2 text-${action.color}-600`} />
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">{action.label}</p>
            </EnhancedCard>
          );
        })}
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No history entries found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredHistory.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <EnhancedCard variant="outline" padding="md" hover="lift">
                <div className="flex items-start gap-4">
                  {/* Action Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getActionColor(entry.action)}`}>
                        {entry.action.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(entry.created_at)}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">
                      {entry.product_name || "Unknown Product"}
                    </h3>

                    <p className="text-gray-600 text-sm mb-2">
                      {entry.description}
                    </p>

                    {entry.user_name && (
                      <p className="text-xs text-gray-500">
                        by {entry.user_name}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredHistory.length > 0 && (
        <div className="text-center pt-6">
          <EnhancedButton
            variant="outline"
            onClick={fetchHistory}
            className="min-w-32"
          >
            Refresh History
          </EnhancedButton>
        </div>
      )}
    </div>
  );
}
