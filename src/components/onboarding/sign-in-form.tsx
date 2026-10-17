"use client";

import { useActionState } from "react";

import type { FormState } from "@/app/join/actions";
import { buttonClasses } from "@/components/button-link";
import { Field, inputClasses } from "@/components/ui/field";
import { keepValuesOnSubmit } from "@/components/ui/keep-values";

export function SignInForm({
  action,
  next,
}: {
  action: (previous: FormState, form: FormData) => Promise<FormState>;
  next: string;
}) {
  const [state, submit, pending] = useActionState(action, null);
  const error = state?.fieldErrors.email;

  return (
    <form
      action={submit}
      onSubmit={keepValuesOnSubmit(submit)}
      className="mt-8 space-y-5"
      noValidate
    >
      <input type="hidden" name="next" value={next} />
      <Field id="email" label="Institute email" error={error}>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@iitb.ac.in"
          defaultValue={state?.values.email}
          className={inputClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "email-error" : undefined}
        />
      </Field>
      {state?.formError && (
        <p role="alert" className="text-danger text-sm">
          {state.formError}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses("primary", true)}
      >
        {pending ? "Sending code…" : "Send code"}
      </button>
    </form>
  );
}
