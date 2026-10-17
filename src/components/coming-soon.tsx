import { ButtonLink } from "./button-link";

// Placeholder for screens planned in later slices, so links never 404.
export function ComingSoon({
  title,
  description,
  backHref,
}: {
  title: string;
  description: string;
  backHref: string;
}) {
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <p className="text-eyebrow">Coming soon</p>
      <h1 className="text-title mt-1">{title}</h1>
      <p className="text-body mt-2">{description}</p>
      <div className="mt-6">
        <ButtonLink href={backHref} variant="secondary">
          Go back
        </ButtonLink>
      </div>
    </div>
  );
}
