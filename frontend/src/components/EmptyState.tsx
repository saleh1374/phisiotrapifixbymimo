import type { LucideIcon } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-navy/20 bg-cream px-6 py-12 text-center">
      {Icon && (
        <div className="relative">
          <div className="absolute inset-0 -z-10 mx-auto h-16 w-16 rounded-full bg-emerald/10 blur-md" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald/20 bg-white text-emerald shadow-sm">
            <Icon className="h-7 w-7" />
          </div>
        </div>
      )}
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-navy/60">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
