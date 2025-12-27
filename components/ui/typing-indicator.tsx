
export function TypingIndicator() {
  return (
    <div className="justify-left flex space-x-1">
      <div className="rounded-lg bg-muted p-3">
        <div className="flex items-center space-x-2">
          <span className="typing-dot" />
          <span className="typing-dot delay-1" />
          <span className="typing-dot delay-2" />
        </div>
      </div>
    </div>
  );
}
