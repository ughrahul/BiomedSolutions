"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  RefreshCw,
  CheckSquare,
  Square,
  Archive,
  Reply,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { SafeCalendar as SafeCalendarIcon } from "@/components/ui/safe-icons";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { useMessages } from "@/contexts/MessageContext";

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

interface ContactMessagesProps {
  limit?: number;
}

interface SortConfig {
  field: keyof ContactMessage;
  direction: "asc" | "desc";
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export default function ContactMessages({ limit }: ContactMessagesProps) {
  const {
    messages,
    loading,
    error,
    markAsRead,
    deleteMessage: deleteMessageFromContext,
    refreshMessages,
  } = useMessages();

  const [localError, setLocalError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unread" | "read" | "replied"
  >("all");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "created_at",
    direction: "desc",
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: limit || 20, // Default 20 items per page, or use limit prop
    totalItems: 0,
    totalPages: 0,
  });

  // Bulk actions state
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);

  // Debounced search to avoid excessive API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [debouncedSearchTerm, statusFilter, dateFilter, sortConfig]);

  // Toggle message expansion
  const toggleMessage = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Setup database tables
  const setupDatabase = async () => {
    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Database setup failed");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Database setup error:", error);
      }
      setLocalError(
        error instanceof Error ? error.message : "Database setup failed"
      );
    }
  };

  // Enhanced filtering with pagination support
  const filteredAndSortedMessages = useMemo(() => {
    const filtered = messages.filter((message) => {
      // Search filter
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch =
        message.name.toLowerCase().includes(searchLower) ||
        message.email.toLowerCase().includes(searchLower) ||
        message.message.toLowerCase().includes(searchLower) ||
        (message.organization &&
          message.organization.toLowerCase().includes(searchLower)) ||
        (message.phone && message.phone.includes(debouncedSearchTerm));

      // Status filter
      const matchesStatus =
        statusFilter === "all" || message.status === statusFilter;

      // Date filter
      const messageDate = new Date(message.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let matchesDate = true;
      switch (dateFilter) {
        case "today":
          matchesDate = messageDate >= today;
          break;
        case "week":
          matchesDate = messageDate >= weekAgo;
          break;
        case "month":
          matchesDate = messageDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort messages
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? comparison : -comparison;
      }

      if (
        aValue &&
        bValue &&
        typeof aValue === "string" &&
        typeof bValue === "string"
      ) {
        // Handle date comparison for created_at field
        if (sortConfig.field === "created_at") {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          const comparison = aDate.getTime() - bDate.getTime();
          return sortConfig.direction === "asc" ? comparison : -comparison;
        }
        // Handle string comparison for other fields
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? comparison : -comparison;
      }

      return 0;
    });

    return filtered;
  }, [messages, debouncedSearchTerm, statusFilter, dateFilter, sortConfig]);

  // Update pagination when filtered results change
  useEffect(() => {
    const totalItems = filteredAndSortedMessages.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);

    setPagination((prev) => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: Math.min(prev.currentPage, totalPages || 1),
    }));
  }, [filteredAndSortedMessages, pagination.itemsPerPage]);

  // Get current page items
  const currentPageItems = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredAndSortedMessages.slice(startIndex, endIndex);
  }, [
    filteredAndSortedMessages,
    pagination.currentPage,
    pagination.itemsPerPage,
  ]);

  // Handle sorting
  const handleSort = (field: keyof ContactMessage) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    // Scroll to top of messages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / itemsPerPage),
    }));
  };

  // Refresh messages
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMessages();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMessages(new Set());
      setSelectAll(false);
    } else {
      setSelectedMessages(new Set(currentPageItems.map((msg) => msg.id)));
      setSelectAll(true);
    }
  };

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleBulkMarkAsRead = async () => {
    for (const messageId of Array.from(selectedMessages)) {
      await markAsRead(messageId);
    }
    setSelectedMessages(new Set());
    setSelectAll(false);
  };

  const handleBulkDelete = async () => {
    for (const messageId of Array.from(selectedMessages)) {
      await deleteMessageFromContext(messageId);
    }
    setSelectedMessages(new Set());
    setSelectAll(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(
          (now.getTime() - date.getTime()) / (1000 * 60)
        );
        return `${diffInMinutes} min ago`;
      }
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Get status color and styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "unread":
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-700",
          badge: "bg-red-100 text-red-800",
          icon: <AlertCircle className="w-4 h-4" />,
        };
      case "read":
        return {
          bg: "bg-blue-50 border-blue-200",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-800",
          icon: <Eye className="w-4 h-4" />,
        };
      case "replied":
        return {
          bg: "bg-green-50 border-green-200",
          text: "text-green-700",
          badge: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
          icon: <Clock className="w-4 h-4" />,
        };
    }
  };

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
          {error && error.includes("Database") && (
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

  // Calculate counts
  const unreadCount = messages.filter((msg) => msg.status === "unread").length;
  const readCount = messages.filter((msg) => msg.status === "read").length;
  const repliedCount = messages.filter(
    (msg) => msg.status === "replied"
  ).length;

  return (
    <div className="space-y-4">
      {!limit && (
        <>
          {/* Enhanced Header with Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Contact Messages
                </h3>
                <p className="text-sm text-gray-600">
                  {messages.length} total messages •{" "}
                  {filteredAndSortedMessages.length} filtered
                  {pagination.totalPages > 1 &&
                    ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">{unreadCount} unread</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">{readCount} read</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{repliedCount} replied</span>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh messages"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <EnhancedCard
            variant="outline"
            padding="lg"
            className="admin-filter-section"
          >
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <EnhancedInput
                  type="text"
                  placeholder="Search messages by name, email, organization, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-base admin-filter-input"
                  variant="outline"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 admin-filter-grid">
                {/* Status Filter */}
                <div className="admin-filter-item">
                  <label className="block text-sm font-medium text-gray-700 mb-2 admin-filter-label">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 admin-filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="admin-filter-item">
                  <label className="block text-sm font-medium text-gray-700 mb-2 admin-filter-label">
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 admin-filter-select"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                {/* Items Per Page */}
                <div className="admin-filter-item">
                  <label className="block text-sm font-medium text-gray-700 mb-2 admin-filter-label">
                    Items Per Page
                  </label>
                  <select
                    value={pagination.itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 admin-filter-select"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div className="admin-filter-item">
                  <label className="block text-sm font-medium text-gray-700 mb-2 admin-filter-label">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSort("created_at")}
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                        sortConfig.field === "created_at"
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      Date{" "}
                      {sortConfig.field === "created_at" &&
                        (sortConfig.direction === "asc" ? (
                          <SortAsc className="w-3 h-3 inline ml-1" />
                        ) : (
                          <SortDesc className="w-3 h-3 inline ml-1" />
                        ))}
                    </button>
                    <button
                      onClick={() => handleSort("name")}
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                        sortConfig.field === "name"
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      Name{" "}
                      {sortConfig.field === "name" &&
                        (sortConfig.direction === "asc" ? (
                          <SortAsc className="w-3 h-3 inline ml-1" />
                        ) : (
                          <SortDesc className="w-3 h-3 inline ml-1" />
                        ))}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedMessages.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <span className="text-sm text-blue-700">
                    {selectedMessages.size} message
                    {selectedMessages.size > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkMarkAsRead}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Mark as Read
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </EnhancedCard>
        </>
      )}

      {filteredAndSortedMessages.length === 0 ? (
        <EnhancedCard className="text-center p-8">
          <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Mail className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== "all" || dateFilter !== "all"
              ? "No Messages Found"
              : "No Messages Yet"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" || dateFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "When customers contact you, their messages will appear here."}
          </p>
          {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </EnhancedCard>
      ) : (
        <div className="space-y-2">
          {/* Select All Header */}
          {!limit && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {selectAll ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                  {selectAll ? "Deselect All" : "Select All"}
                </button>
                <span className="text-sm text-gray-500">
                  Showing {currentPageItems.length} of{" "}
                  {filteredAndSortedMessages.length} message
                  {filteredAndSortedMessages.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Performance indicator for large datasets */}
              {messages.length > 50 && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {messages.length > 100
                    ? "Large dataset detected"
                    : "Medium dataset"}
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {(limit ? currentPageItems.slice(0, limit) : currentPageItems).map(
              (message) => {
                const statusStyles = getStatusStyles(message.status);
                const isExpanded = expandedMessages.has(message.id);
                const isSelected = selectedMessages.has(message.id);
                const messagePreview =
                  message.message.length > 100
                    ? message.message.substring(0, 100) + "..."
                    : message.message;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EnhancedCard
                      className={`overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer ${
                        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                      } ${
                        message.status === "unread"
                          ? "border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white"
                          : "border border-gray-200 bg-white"
                      }`}
                    >
                      {/* Compact Header - Always Visible */}
                      <div
                        className="p-3 border-b border-gray-100"
                        onClick={() => toggleMessage(message.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Bulk Selection Checkbox */}
                            {!limit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectMessage(message.id);
                                }}
                                className="flex-shrink-0"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>
                            )}

                            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white flex-shrink-0">
                              <User className="w-3 h-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-bold text-gray-900 truncate">
                                  {message.name}
                                </h3>
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${statusStyles.badge}`}
                                >
                                  {statusStyles.icon}
                                  {message.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <SafeCalendarIcon className="w-3 h-3" />
                                  <span>{formatDate(message.created_at)}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="truncate">
                                  {messagePreview}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <div className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
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
                                  <span className="truncate">
                                    {message.email}
                                  </span>
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
                                    <span className="truncate">
                                      {message.organization}
                                    </span>
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
                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                      {message.message}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                              <div className="flex items-center justify-end gap-2">
                                {message.status === "unread" && (
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
                                    window.open(
                                      `mailto:${message.email}?subject=Re: Your message`,
                                      "_blank"
                                    );
                                  }}
                                  className="px-2 py-1 text-xs text-green-600 hover:bg-green-100 rounded transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  title="Reply to message"
                                >
                                  <Reply className="w-3 h-3 inline mr-1" />
                                  Reply
                                </motion.button>
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
              }
            )}
          </AnimatePresence>

          {/* Pagination Controls */}
          {!limit && pagination.totalPages > 1 && (
            <EnhancedCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                  to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{" "}
                  of {pagination.totalItems} messages
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (
                          pagination.currentPage >=
                          pagination.totalPages - 2
                        ) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              pageNum === pagination.currentPage
                                ? "bg-blue-500 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </EnhancedCard>
          )}
        </div>
      )}
    </div>
  );
}
