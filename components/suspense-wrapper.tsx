'use client';

import { Suspense } from 'react';

export default function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}