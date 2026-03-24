import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionSkeleton({
  rows = 4,
  title,
}: {
  readonly rows?: number;
  readonly title?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        {title ? (
          <h3 className="text-sm font-semibold">{title}</h3>
        ) : (
          <Skeleton className="h-5 w-32" />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MapSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative flex h-[400px] items-center justify-center bg-muted/50">
          <div className="text-center">
            <Skeleton className="mx-auto h-12 w-12 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-4 w-32" />
            <Skeleton className="mx-auto mt-1.5 h-3 w-48" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ title }: { readonly title?: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        {title ? (
          <h3 className="text-sm font-semibold">{title}</h3>
        ) : (
          <Skeleton className="h-5 w-28" />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex h-[250px] items-end gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
