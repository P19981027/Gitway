export function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <i className={`${icon} text-4xl text-foreground-200 mb-3`} />}
      <p className="text-sm font-medium text-foreground-500">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-foreground-400">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-xl bg-primary-500 text-background-50 px-4 py-2 text-sm font-medium transition-colors hover:bg-primary-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
