"use client";

import React from 'react';

// Safe Calendar icon component to handle module resolution issues
export const SafeCalendar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
};

// Import specific icons from lucide-react to avoid HMR issues with Calendar
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  ImageIcon,
  Package,
  Grid3X3,
  List,
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  Grid,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Linkedin,
  Mail,
  Loader2,
  User,
  Lock,
  Settings,
  Phone,
  MapPin,
  Star,
  AlertCircle,
  Send,
  CheckCircle,
  Users,
  Globe,
  ArrowRight,
  Building2,
  TrendingUp,
  Brain,
  Navigation,
  Printer,
  Wrench,
  Info,
  AlertTriangle,
  Truck,
  Smile,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  Quote,
  ExternalLink,
  Lightbulb,
} from 'lucide-react';

// Import and re-export types separately
import type { LucideIcon } from 'lucide-react';
export type { LucideIcon };

// Re-export specific icons
export {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  ImageIcon,
  Package,
  Grid3X3,
  List,
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  Grid,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Linkedin,
  Mail,
  Loader2,
  User,
  Lock,
  Settings,
  Phone,
  MapPin,
  Star,
  AlertCircle,
  Send,
  CheckCircle,
  Users,
  Globe,
  ArrowRight,
  Building2,
  TrendingUp,
  Brain,
  Navigation,
  Printer,
  Wrench,
  Info,
  AlertTriangle,
  Truck,
  Smile,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  Quote,
  ExternalLink,
  Lightbulb,
};



