import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

type PageLoadingProps = {
  variant?: 'page' | 'dashboard';
};

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-slate-200', className)} />
);

export const PageLoading = ({ variant = 'page' }: PageLoadingProps) => {
  if (variant === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-44" />
            <SkeletonBlock className="h-4 w-64 max-w-[70vw]" />
          </div>
          <Spinner className="size-5 text-slate-500" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
        <SkeletonBlock className="h-[360px]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
};
