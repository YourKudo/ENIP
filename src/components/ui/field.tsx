// Design spec input: white, radius 24, 56px tall, no border, soft shadow.
// A red ring marks a field with an error.
export const inputClasses =
  "bg-surface shadow-card text-body h-14 w-full rounded-3xl px-5 outline-none focus:ring-2 focus:ring-primary-soft aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger";

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-ink mb-1.5 block font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-danger mt-1.5 text-sm"
        >
          {error}
        </p>
      ) : (
        hint && <p className="text-meta mt-1.5">{hint}</p>
      )}
    </div>
  );
}
