"use client";

import { cn } from "../utils/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-skeleton rounded-2xl bg-slate-200 dark:bg-slate-800 shimmer-wrapper",
                className
            )}
            {...props}
        />
    );
}

export function StatCardSkeleton() {
    return (
        <div className="card-premium !p-4 sm:!p-6 flex items-center justify-between">
            <div className="space-y-3 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="w-14 h-14 rounded-2xl ml-4" />
        </div>
    );
}

export function TaskCardSkeleton() {
    return (
        <div className="card-premium !p-5 flex items-start gap-4">
            <Skeleton className="w-9 h-9 sm:w-8 sm:h-8 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-lg" />
                    <Skeleton className="h-5 w-12 rounded-xl" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    );
}
