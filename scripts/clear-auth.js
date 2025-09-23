#!/usr/bin/env node

console.log('🔐 Clearing authentication state to resolve refresh token issues...');

// This script will be run in the browser to clear auth state
const clearAuthScript = `
(function() {
  console.log('🧹 Clearing authentication state...');
  
  // Clear all Supabase-related storage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('Removed:', key);
  });

  // Clear session storage
  sessionStorage.clear();
  console.log('Cleared session storage');

  // Clear any cached data
  if (window.location.pathname.includes('/admin')) {
    console.log('Redirecting to login page...');
    window.location.href = "/auth/login";
  } else {
    console.log('✅ Authentication state cleared successfully');
    console.log('🔄 Please refresh the page');
  }
})();
`;

console.log('📋 Copy and paste this script into your browser console:');
console.log('');
console.log(clearAuthScript);
console.log('');
console.log('💡 Or simply:');
console.log('1. Open browser developer tools (F12)');
console.log('2. Go to Console tab');
console.log('3. Clear all storage manually:');
console.log('   - localStorage.clear()');
console.log('   - sessionStorage.clear()');
console.log('4. Refresh the page');
console.log('');
console.log('🔄 This will resolve the "Invalid Refresh Token" error');
