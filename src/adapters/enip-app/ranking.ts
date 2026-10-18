import type { AlumniProfile } from "./index";

// Simple keyword relevance for senior search. Not meant to be smart: in
// phase 2 the ranking comes from the app's own AI matching.

const synonyms: Record<string, string> = {
  cv: "resume",
  pm: "product",
  apm: "product",
  vc: "venture",
  rant: "rants",
  intern: "internships",
  internship: "internships",
  job: "hiring",
  jobs: "hiring",
  hire: "hiring",
  swe: "software",
  sde: "software",
  startup: "startups",
  college: "campus",
  placement: "placements",
};
const stopWords = new Set(
  "a an and the i me my to for in of on with who can someone need want help about find is are be just some iit alumni alum".split(
    " ",
  ),
);

function keywords(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !stopWords.has(w))
    .map((w) => synonyms[w] ?? w);
}

function relevance(person: AlumniProfile, words: string[]) {
  const fields: [string, number][] = [
    [person.topics.join(" "), 3],
    [`${person.helpWith} ${person.jobTitle} ${person.company}`, 2],
    [`${person.institute} ${person.branch} ${person.memberType}`, 1],
  ];
  return words.reduce(
    (score, word) =>
      score +
      fields.reduce(
        (s, [text, weight]) =>
          s + (text.toLowerCase().includes(word) ? weight : 0),
        0,
      ),
    0,
  );
}

// YAL team and EIR profiles always appear (after the matches), so every
// search shows someone who is sure to reply.
const isTeam = (p: AlumniProfile) =>
  p.memberType === "yal-team" || p.memberType === "eir";

export function rankByQuery(
  people: AlumniProfile[],
  query: string,
): AlumniProfile[] {
  const words = keywords(query);
  if (words.length === 0) return people;
  const matches = people
    .map((person) => ({ person, score: relevance(person, words) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.person);
  const alwaysShown = people.filter((p) => isTeam(p) && !matches.includes(p));
  return [...matches, ...alwaysShown];
}
