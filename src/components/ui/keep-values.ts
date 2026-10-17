import { startTransition } from "react";

// React resets a form after its action runs, which would clear what the
// student typed when there's an error. This submits the same data without
// the reset. The form keeps its `action` too, so it still works without JS.
export function keepValuesOnSubmit(submit: (form: FormData) => void) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => submit(data));
  };
}
