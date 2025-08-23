"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { type LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof dynamicIconImports;
}

const DynamicIcon = ({ name, ...props }: IconProps) => {
  const LucideIcon = dynamic(dynamicIconImports[name]);

  // Use a more specific fallback with appropriate dimensions
  const fallback = (
    <div
      style={{
        width: props.width ?? props.size ?? 24,
        height: props.height ?? props.size ?? 24,
      }}
      className="animate-pulse bg-gray-200 rounded-md"
    />
  );

  return (
    <Suspense fallback={fallback}>
      <LucideIcon {...props} />
    </Suspense>
  );
};

export default DynamicIcon;