import React from 'react';

export const dynamic = 'force-dynamic';

export default function DynamicRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 