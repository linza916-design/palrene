import React from "react";

export function SkeletonCard() {
  return (
    <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50 dark:bg-neutral-900/40 animate-pulse space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-1/3 roundedbg-neutral-200 dark:bg-neutral-800 bg-neutral-200 dark:bg-neutral-850" />
          <div className="h-2.5 w-1/4 rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </div>
      
      {/* Content lines */}
      <div className="space-y-2.5 pt-1">
        <div className="h-3 w-11/12 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-10/12 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-8/12 rounded bg-neutral-100 dark:bg-neutral-800" />
      </div>

      {/* Media placeholder */}
      <div className="h-44 w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />

      {/* Actions */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/60" />
        <div className="h-6 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/60" />
        <div className="h-6 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/60" />
        <div className="h-6 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/60" />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Banner */}
      <div className="h-48 w-full rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
      
      <div className="px-5 space-y-4">
        {/* Avatar and CTA */}
        <div className="flex items-end justify-between -mt-16">
          <div className="w-24 h-24 rounded-full bg-neutral-300 dark:bg-neutral-800 border-4 border-white dark:border-neutral-900" />
          <div className="h-9 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="h-5 w-44 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-28 rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>

        <div className="space-y-2 pt-2">
          <div className="h-3.5 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3.5 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonChat() {
  return (
    <div className="flex flex-col space-y-4 p-4 animate-pulse">
      <div className="flex space-x-3 items-end">
        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-10 w-2/3 rounded-2xl rounded-bl-none bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="flex space-x-3 items-end justify-end">
        <div className="h-12 w-1/2 rounded-2xl rounded-br-none bg-neutral-100 dark:bg-neutral-800" />
      </div>
      <div className="flex space-x-3 items-end">
        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-8 w-1/3 rounded-2xl rounded-bl-none bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}
