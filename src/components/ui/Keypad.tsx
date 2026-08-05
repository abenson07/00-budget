export type KeypadProps = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onClear?: () => void;
  disabled?: boolean;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

export function Keypad({ onDigit, onDelete, onClear, disabled }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onDigit(key)}
          className="flex h-16 items-center justify-center rounded-control bg-white text-2xl font-medium text-budget-ink shadow-card transition-colors active:bg-budget-sage-panel disabled:opacity-40"
        >
          {key}
        </button>
      ))}
      {onClear ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className="flex h-16 items-center justify-center rounded-control border border-budget-card-border bg-white text-sm font-medium text-budget-ink-muted transition-colors active:bg-budget-sage-panel disabled:opacity-40"
        >
          Clear
        </button>
      ) : (
        <div aria-hidden />
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        className="flex h-16 items-center justify-center rounded-control bg-budget-sage-panel text-sm font-medium text-budget-forest transition-colors active:opacity-80 disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}
