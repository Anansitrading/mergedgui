// TypingIndicator Component
// Task 3_3: Support Chat Widget UI

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '600ms' }}
        />
        <span
          className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
          style={{ animationDelay: '150ms', animationDuration: '600ms' }}
        />
        <span
          className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
          style={{ animationDelay: '300ms', animationDuration: '600ms' }}
        />
      </div>
      <span className="text-xs text-muted-foreground ml-2">Kijko is typing...</span>
    </div>
  );
}
