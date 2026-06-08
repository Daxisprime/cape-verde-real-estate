"use client";

import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Clock, Building, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PropertyVerificationStatus } from '@/types/property-verification';

interface PropertyVerificationBadgeProps {
  verification: PropertyVerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export default function PropertyVerificationBadge({
  verification,
  size = 'md',
  showTooltip = true,
  className = ''
}: PropertyVerificationBadgeProps) {
  const getVerificationConfig = () => {
    const { status, verificationLevel } = verification;

    // Base configuration for verification status
    const statusConfig = {
      verified: {
        color: 'bg-green-600 text-white border-green-700',
        icon: ShieldCheck,
        label: 'Verified'
      },
      pending: {
        color: 'bg-yellow-600 text-white border-yellow-700',
        icon: Clock,
        label: 'Pending'
      },
      rejected: {
        color: 'bg-red-600 text-white border-red-700',
        icon: ShieldX,
        label: 'Rejected'
      },
      expired: {
        color: 'bg-gray-600 text-white border-gray-700',
        icon: ShieldAlert,
        label: 'Expired'
      }
    };

    // Level configuration for verification source
    const levelConfig = {
      government: {
        prefix: 'Government',
        icon: Crown,
        priority: 1,
        description: 'Verified by Cape Verde Government'
      },
      mls: {
        prefix: 'MLS',
        icon: Building,
        priority: 2,
        description: 'Verified by MLS Professional System'
      },
      agent: {
        prefix: 'Agent',
        icon: Shield,
        priority: 3,
        description: 'Verified by Licensed Real Estate Agent'
      },
      basic: {
        prefix: 'Basic',
        icon: Shield,
        priority: 4,
        description: 'Basic verification completed'
      }
    };

    const sizeConfig = {
      sm: {
        badgeClass: 'px-2 py-1 text-xs',
        iconSize: 'h-3 w-3'
      },
      md: {
        badgeClass: 'px-3 py-1.5 text-sm',
        iconSize: 'h-4 w-4'
      },
      lg: {
        badgeClass: 'px-4 py-2 text-base',
        iconSize: 'h-5 w-5'
      }
    };

    return {
      status: statusConfig[status],
      level: levelConfig[verificationLevel],
      size: sizeConfig[size]
    };
  };

  const config = getVerificationConfig();
  const StatusIcon = config.status.icon;
  const LevelIcon = config.level.icon;

  const badgeContent = (
    <Badge
      className={`
        ${config.status.color}
        ${config.size.badgeClass}
        border flex items-center gap-1.5 font-medium
        ${className}
      `}
    >
      <StatusIcon className={config.size.iconSize} />
      <span>{config.level.prefix} {config.status.label}</span>
      {verification.verificationLevel === 'government' && (
        <LevelIcon className={`${config.size.iconSize} ml-1`} />
      )}
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  const getTooltipContent = () => {
    const verifiedBy = verification.verifiedBy;

    return (
      <div className="space-y-2">
        <div className="font-semibold">{config.level.description}</div>

        {verifiedBy && (
          <div className="text-sm">
            <div>Verified by: {verifiedBy.entity}</div>
            {verifiedBy.licenseNumber && (
              <div>License: {verifiedBy.licenseNumber}</div>
            )}
          </div>
        )}

        {verification.verifiedAt && (
          <div className="text-sm">
            Verified: {new Date(verification.verifiedAt).toLocaleDateString()}
          </div>
        )}

        {verification.expiresAt && (
          <div className="text-sm">
            Expires: {new Date(verification.expiresAt).toLocaleDateString()}
          </div>
        )}

        {verification.issues && verification.issues.length > 0 && (
          <div className="text-sm">
            <div className="font-medium text-yellow-600">Issues Found:</div>
            <ul className="list-disc list-inside">
              {verification.issues.slice(0, 2).map((issue, index) => (
                <li key={index} className="text-xs">{issue.message}</li>
              ))}
              {verification.issues.length > 2 && (
                <li className="text-xs">... and {verification.issues.length - 2} more</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact verification badge for property cards
export function CompactVerificationBadge({
  verification,
  className = ''
}: {
  verification: PropertyVerificationStatus;
  className?: string;
}) {
  const { status, verificationLevel } = verification;

  // Only show for verified or pending government/MLS
  if (status === 'rejected' || status === 'expired') return null;
  if (status === 'pending' && verificationLevel === 'agent') return null;

  // Always render the same structure to prevent hydration mismatch
  return (
    <div className={`inline-flex items-center ${className}`}>
      {status === 'verified' && verificationLevel === 'government' ? (
        <div className="flex items-center bg-white/90 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium border border-green-200">
          <Crown className="h-2.5 w-2.5 mr-0.5" />
          <span>Official</span>
        </div>
      ) : status === 'verified' ? (
        <div className="flex items-center bg-white/90 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium border border-blue-200">
          <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
          <span>Verified</span>
        </div>
      ) : status === 'pending' && verificationLevel === 'mls' ? (
        <div className="flex items-center bg-white/90 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium border border-amber-200">
          <Clock className="h-2.5 w-2.5 mr-0.5" />
          <span>MLS Pending</span>
        </div>
      ) : null}
    </div>
  );
}

// Verification status indicator for listings
export function VerificationStatusIndicator({
  verification
}: {
  verification: PropertyVerificationStatus
}) {
  const { status, verificationLevel } = verification;

  const getStatusColor = () => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
      case 'expired': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verified': return ShieldCheck;
      case 'pending': return Clock;
      case 'rejected': return ShieldX;
      case 'expired': return ShieldAlert;
      default: return Shield;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className={`flex items-center ${getStatusColor()}`}>
      <StatusIcon className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium capitalize">
        {status} {verificationLevel === 'government' && '(Official)'}
      </span>
    </div>
  );
}
