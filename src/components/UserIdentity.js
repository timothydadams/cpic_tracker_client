import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from 'ui/avatar';
import {
  HybridTooltipProvider,
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from 'ui/hybrid-tooltip';

function getInitial(user) {
  const name = user?.given_name || user?.display_name || user?.username || '?';
  return name.charAt(0).toUpperCase();
}

function getDisplayName(user, isAuthenticated) {
  if (!isAuthenticated) {
    return user?.username || user?.id?.split('-')[0] || 'Unknown';
  }
  const first = user?.given_name;
  const last = user?.family_name;
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  return user?.display_name || user?.username || 'Unknown';
}

export function UserIdentity({ user, isAuthenticated, timestamp }) {
  const displayName = getDisplayName(user, isAuthenticated);

  return (
    <div className='flex gap-3 min-w-0'>
      <Avatar className='h-8 w-8 shrink-0'>
        {user?.profile_pic && (
          <AvatarImage src={user.profile_pic} alt={displayName} />
        )}
        <AvatarFallback className='text-xs'>{getInitial(user)}</AvatarFallback>
      </Avatar>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between mb-1'>
          {isAuthenticated ? (
            <HybridTooltipProvider>
              <HybridTooltip>
                <HybridTooltipTrigger asChild>
                  <span className='text-sm font-medium truncate cursor-default'>
                    {displayName}
                  </span>
                </HybridTooltipTrigger>
                <HybridTooltipContent side='top' className='text-xs'>
                  <div className='flex flex-col gap-0.5'>
                    <span className='font-medium'>{displayName}</span>
                    {user?.username && (
                      <span className='text-muted-foreground'>
                        @{user.username}
                      </span>
                    )}
                    {user?.email && (
                      <span className='text-muted-foreground'>
                        {user.email}
                      </span>
                    )}
                  </div>
                </HybridTooltipContent>
              </HybridTooltip>
            </HybridTooltipProvider>
          ) : (
            <span className='text-sm font-medium truncate'>{displayName}</span>
          )}
          {timestamp && (
            <time
              dateTime={timestamp}
              className='text-xs text-zinc-500 dark:text-zinc-400'
            >
              {new Date(timestamp).toLocaleDateString()}
            </time>
          )}
        </div>
      </div>
    </div>
  );
}
