import type { Metadata } from "next";

import { enipApp } from "@/adapters/enip-app";
import { AlumniCard } from "@/components/cards";

export const metadata: Metadata = { title: "Alumni" };

export default async function AlumniPage() {
  const alumni = await enipApp.listAlumni();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-title">Talk to a senior</h1>
      <p className="text-body mt-2 max-w-2xl">
        Your first conversation is free. Verify your IIT email, pick a senior
        and send up to 3 messages.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {alumni.map((person) => (
          <AlumniCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}
