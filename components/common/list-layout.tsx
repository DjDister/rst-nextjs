import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface BackButtonProps {
  onClick: () => void;
  icon?: ReactNode;
}

interface ListLayoutProps {
  title: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  backButton?: BackButtonProps;
}

export function ListLayout({
  title,
  children,
  actionLabel,
  onAction,
  actionIcon,
  backButton,
}: ListLayoutProps) {
  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backButton && (
            <Button variant="outline" size="sm" onClick={backButton.onClick}>
              {backButton.icon}
            </Button>
          )}
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="flex items-center gap-1">
            {actionIcon}
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
