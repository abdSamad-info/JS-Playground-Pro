/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout.tsx';
import { useStore } from '@/store/useStore.ts';

export default function App() {
  const { setFiles } = useStore();

  useEffect(() => {
    // Handle shared code from URL
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('code');
    
    if (sharedCode) {
      try {
        const decoded = atob(sharedCode);
        const files = JSON.parse(decoded);
        if (Array.isArray(files)) {
          setFiles(files);
          // Clear URL params without refreshing
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error('Failed to parse shared code:', err);
      }
    }
  }, [setFiles]);

  return <MainLayout />;
}

