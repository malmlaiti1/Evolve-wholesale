import { NotificationBell } from "./notification-bell";

export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-paper px-6">
      <div>
        <h1 className="text-lg font-bold leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-ink-2">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <NotificationBell />
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          EW
        </span>
      </div>
    </header>
  );
}
