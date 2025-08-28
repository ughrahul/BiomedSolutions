import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';

// Disable static optimization for 404 page
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl font-bold text-blue-200">404</div>
            <div className="absolute inset-0 text-8xl font-bold text-blue-600 opacity-20">404</div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-lg text-gray-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. The page may have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <EnhancedButton
                variant="primary"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Go Home
              </EnhancedButton>
            </Link>

            <Link href="/contact">
              <EnhancedButton variant="outline">
                Contact Support
              </EnhancedButton>
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need help? Try these options:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li>• Check the URL for typos</li>
            <li>• Go back to the previous page</li>
            <li>• Visit our homepage</li>
            <li>• Contact our support team</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
