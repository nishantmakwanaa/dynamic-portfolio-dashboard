'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisclaimerBannerProps {
  isStaleData: boolean;
  errorMsg: string | null;
}

export const ErrorDisclaimerBanner: React.FC<ErrorDisclaimerBannerProps> = ({
  errorMsg,
}) => {
  if (!errorMsg) return null;

  return (
    <div className="mb-4">
      <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl text-xs flex items-center gap-3 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
        <div>
          <span className="font-bold">Connection Warning:</span> {errorMsg}
        </div>
      </div>
    </div>
  );
};
