'use client';

export function ProjectCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="w-8 h-8 bg-neutral-200 rounded-boho mb-3" />
      <div className="h-5 bg-neutral-200 rounded-boho mb-2 w-3/4" />
      <div className="h-4 bg-neutral-200 rounded-boho mb-4 w-1/2" />
      <div className="flex gap-2">
        <div className="h-8 bg-neutral-200 rounded-boho flex-1" />
        <div className="h-8 bg-neutral-200 rounded-boho flex-1" />
      </div>
    </div>
  );
}

export function FloorplanCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="w-8 h-8 bg-neutral-200 rounded-boho mb-3" />
      <div className="h-5 bg-neutral-200 rounded-boho mb-2 w-2/3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-neutral-200 rounded-boho w-1/3" />
        <div className="h-3 bg-neutral-200 rounded-boho w-1/4" />
      </div>
      <div className="h-8 bg-neutral-200 rounded-boho w-full" />
    </div>
  );
}

export function ToolbarSkeleton() {
  return (
    <div className="bg-white border-r border-neutral-200 p-3 w-20 flex flex-col items-center gap-2">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="w-12 h-12 bg-neutral-200 rounded-boho animate-pulse" />
      ))}
    </div>
  );
}

export function MetadataPanelSkeleton() {
  return (
    <div className="w-80 bg-white border-l border-neutral-200 p-6">
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-neutral-200 rounded-boho mb-2 w-1/3 animate-pulse" />
            <div className="h-10 bg-neutral-200 rounded-boho animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

