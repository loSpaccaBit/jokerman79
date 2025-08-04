import React from 'react';
import { cn } from '@/lib/utils';
import { GameType } from '@/types/live-games';

export interface GameTypeIconProps {
  gameType: GameType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'outlined' | 'filled';
  className?: string;
  showLabel?: boolean;
}

export function GameTypeIcon({
  gameType,
  size = 'md',
  variant = 'default',
  className,
  showLabel = false
}: GameTypeIconProps) {
  const gameConfig = {
    'ROULETTE': {
      icon: '🎯',
      label: 'Roulette',
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900'
    },
    'LIGHTNING_ROULETTE': {
      icon: '⚡',
      label: 'Lightning Roulette',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900'
    },
    'DRAGONTIGER': {
      icon: '🐉',
      label: 'Dragon Tiger',
      color: 'text-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900'
    },
    'SWEETBONANZA': {
      icon: '🍭',
      label: 'Sweet Bonanza',
      color: 'text-pink-600',
      bg: 'bg-pink-100 dark:bg-pink-900'
    },
    'BLACKJACK': {
      icon: '🃏',
      label: 'Blackjack',
      color: 'text-gray-800',
      bg: 'bg-gray-100 dark:bg-gray-900'
    },
    'BACCARAT': {
      icon: '♠️',
      label: 'Baccarat',
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900'
    },
    'CRAZYTIME': {
      icon: '🎪',
      label: 'Crazy Time',
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900'
    },
    'FUNKYTIME': {
      icon: '🪩',
      label: 'Funky Time',
      color: 'text-indigo-600',
      bg: 'bg-indigo-100 dark:bg-indigo-900'
    },
    'MEGAWHEEL': {
      icon: '🎡',
      label: 'Mega Wheel',
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900'
    },
    'ANDARBAHAR': {
      icon: '🎴',
      label: 'Andar Bahar',
      color: 'text-teal-600',
      bg: 'bg-teal-100 dark:bg-teal-900'
    },
    'MONOPOLY_LIVE': {
      icon: '🎩',
      label: 'Monopoly Live',
      color: 'text-emerald-600',
      bg: 'bg-emerald-100 dark:bg-emerald-900'
    },
    'DREAM_CATCHER': {
      icon: '💫',
      label: 'Dream Catcher',
      color: 'text-violet-600',
      bg: 'bg-violet-100 dark:bg-violet-900'
    }
  };

  const config = gameConfig[gameType] || {
    icon: '🎲',
    label: gameType,
    color: 'text-muted-foreground',
    bg: 'bg-muted'
  };

  const sizeClasses = {
    sm: {
      container: 'h-6 w-6',
      icon: 'text-xs',
      label: 'text-xs'
    },
    md: {
      container: 'h-8 w-8',
      icon: 'text-sm',
      label: 'text-sm'
    },
    lg: {
      container: 'h-10 w-10',
      icon: 'text-base',
      label: 'text-base'
    },
    xl: {
      container: 'h-12 w-12',
      icon: 'text-lg',
      label: 'text-lg'
    }
  };

  const variantClasses = {
    default: '',
    outlined: 'border-2 border-current',
    filled: config.bg
  };

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'flex items-center justify-center rounded-lg',
            sizeClasses[size].container,
            variantClasses[variant],
            variant === 'filled' ? '' : config.color
          )}
        >
          <span className={sizeClasses[size].icon}>
            {config.icon}
          </span>
        </div>
        <span className={cn(
          'font-tanker font-medium',
          sizeClasses[size].label,
          config.color
        )}>
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg',
        sizeClasses[size].container,
        variantClasses[variant],
        variant === 'filled' ? '' : config.color,
        className
      )}
      title={config.label}
    >
      <span className={sizeClasses[size].icon}>
        {config.icon}
      </span>
    </div>
  );
}