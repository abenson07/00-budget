export type KeypadProps = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onClear?: () => void;
  disabled?: boolean;
};

const KEY_CLASS =
  "flex h-16 items-center justify-center rounded-control bg-white text-2xl font-medium text-budget-ink shadow-card transition-colors active:bg-budget-sage-panel disabled:opacity-40";

export function Keypad({ onDigit, onDelete, onClear, disabled }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onDigit(key)}
          className={KEY_CLASS}
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
        onClick={() => onDigit("0")}
        className={KEY_CLASS}
      >
        0
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        aria-label="Backspace"
        className="flex h-16 items-center justify-center rounded-control bg-budget-sage-panel text-lg font-medium text-budget-forest transition-colors active:opacity-80 disabled:opacity-40"
      >
        ⌫
      </button>
    </div>
  );
}
