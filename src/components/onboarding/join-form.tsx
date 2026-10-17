"use client";

import { useActionState, useState } from "react";

import type { FormState } from "@/app/join/actions";
import { buttonClasses } from "@/components/button-link";
import { Field, inputClasses } from "@/components/ui/field";
import { keepValuesOnSubmit } from "@/components/ui/keep-values";

type IitOption = { id: string; name: string; domain: string };
type SourceOption = { id: string; label: string };

// Partial onboarding (PRD Step 3): only what's needed to verify a student
// and reach them on WhatsApp, plus how they found us and who invited them.
export function JoinForm({
  action,
  iits,
  years,
  sources,
  rememberedCode,
  next,
}: {
  action: (previous: FormState, form: FormData) => Promise<FormState>;
  iits: IitOption[];
  years: number[];
  sources: readonly SourceOption[];
  rememberedCode: string | null; // from a referral link opened earlier
  next: string;
}) {
  const [state, submit, pending] = useActionState(action, null);
  const values = state?.values ?? {};
  const errors = state?.fieldErrors ?? {};
  const [iitId, setIitId] = useState(values.iitId ?? "");
  const domain = iits.find((i) => i.id === iitId)?.domain;

  const invalid = (field: keyof typeof errors) =>
    errors[field]
      ? { "aria-invalid": true, "aria-describedby": `${field}-error` }
      : {};

  return (
    <form
      action={submit}
      onSubmit={keepValuesOnSubmit(submit)}
      className="mt-8 space-y-5"
      noValidate
    >
      <input type="hidden" name="next" value={next} />

      <Field id="name" label="Name" error={errors.name}>
        <input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={values.name}
          className={inputClasses}
          {...invalid("name")}
        />
      </Field>

      <Field id="iitId" label="IIT" error={errors.iitId}>
        <select
          id="iitId"
          name="iitId"
          value={iitId}
          onChange={(e) => setIitId(e.target.value)}
          className={inputClasses}
          {...invalid("iitId")}
        >
          <option value="" disabled>
            Select your IIT
          </option>
          {iits.map((iit) => (
            <option key={iit.id} value={iit.id}>
              {iit.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="graduationYear"
        label="Graduation year"
        error={errors.graduationYear}
      >
        <select
          id="graduationYear"
          name="graduationYear"
          defaultValue={values.graduationYear ?? ""}
          className={inputClasses}
          {...invalid("graduationYear")}
        >
          <option value="" disabled>
            Select year
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="email"
        label="Institute email"
        hint={
          domain
            ? `Use your @${domain} address. We'll send a code to verify it.`
            : "We'll send a code to verify you're an IITian."
        }
        error={errors.email}
      >
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={domain ? `you@${domain}` : "you@iitb.ac.in"}
          defaultValue={values.email}
          className={inputClasses}
          {...invalid("email")}
        />
      </Field>

      <Field id="phone" label="Phone number" error={errors.phone}>
        <div className="relative">
          <span className="text-muted pointer-events-none absolute top-1/2 left-5 -translate-y-1/2">
            +91
          </span>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            defaultValue={values.phone}
            className={`${inputClasses} pl-14`}
            {...invalid("phone")}
          />
        </div>
      </Field>

      <Field
        id="heardFrom"
        label="How did you hear about ENIP?"
        error={errors.heardFrom}
      >
        <select
          id="heardFrom"
          name="heardFrom"
          defaultValue={values.heardFrom ?? (rememberedCode ? "friend" : "")}
          className={inputClasses}
          {...invalid("heardFrom")}
        >
          <option value="" disabled>
            Select one
          </option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="referralCode"
        label="Referral code (optional)"
        hint="Got a code from a friend? They move up the waitlist when you join."
        error={errors.referralCode}
      >
        <input
          id="referralCode"
          name="referralCode"
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="e.g. ROHA47"
          defaultValue={values.referralCode ?? rememberedCode ?? ""}
          className={`${inputClasses} uppercase`}
          {...invalid("referralCode")}
        />
      </Field>

      <label className="card flex cursor-pointer items-start gap-3 p-4">
        <input
          type="checkbox"
          name="whatsappConsent"
          defaultChecked={values.whatsappConsent === "on"}
          className="accent-primary mt-1 size-5 shrink-0"
        />
        <span>
          <span className="text-ink block font-semibold">
            WhatsApp me when a senior replies
          </span>
          <span className="text-meta">
            Only reply alerts. You can turn this off anytime.
          </span>
        </span>
      </label>

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
        {pending ? "Sending code…" : "Continue"}
      </button>
    </form>
  );
}
