// The 23 IITs and their email domains. Sign-up only accepts an email whose
// domain belongs to the IIT the student picked; subdomains count too
// (e.g. smail.iitm.ac.in, kgpian.iitkgp.ac.in).
// TODO(team): confirm domains with each campus before launch.

export type Iit = { id: string; name: string; domains: string[] };

export const iits: Iit[] = [
  { id: "bhilai", name: "IIT Bhilai", domains: ["iitbhilai.ac.in"] },
  {
    id: "bhu",
    name: "IIT (BHU) Varanasi",
    domains: ["iitbhu.ac.in", "itbhu.ac.in"],
  },
  { id: "bhubaneswar", name: "IIT Bhubaneswar", domains: ["iitbbs.ac.in"] },
  { id: "bombay", name: "IIT Bombay", domains: ["iitb.ac.in"] },
  { id: "delhi", name: "IIT Delhi", domains: ["iitd.ac.in"] },
  { id: "dharwad", name: "IIT Dharwad", domains: ["iitdh.ac.in"] },
  { id: "gandhinagar", name: "IIT Gandhinagar", domains: ["iitgn.ac.in"] },
  { id: "goa", name: "IIT Goa", domains: ["iitgoa.ac.in"] },
  { id: "guwahati", name: "IIT Guwahati", domains: ["iitg.ac.in"] },
  { id: "hyderabad", name: "IIT Hyderabad", domains: ["iith.ac.in"] },
  { id: "indore", name: "IIT Indore", domains: ["iiti.ac.in"] },
  { id: "ism", name: "IIT (ISM) Dhanbad", domains: ["iitism.ac.in"] },
  { id: "jammu", name: "IIT Jammu", domains: ["iitjammu.ac.in"] },
  { id: "jodhpur", name: "IIT Jodhpur", domains: ["iitj.ac.in"] },
  { id: "kanpur", name: "IIT Kanpur", domains: ["iitk.ac.in"] },
  { id: "kharagpur", name: "IIT Kharagpur", domains: ["iitkgp.ac.in"] },
  { id: "madras", name: "IIT Madras", domains: ["iitm.ac.in"] },
  { id: "mandi", name: "IIT Mandi", domains: ["iitmandi.ac.in"] },
  { id: "palakkad", name: "IIT Palakkad", domains: ["iitpkd.ac.in"] },
  { id: "patna", name: "IIT Patna", domains: ["iitp.ac.in"] },
  { id: "roorkee", name: "IIT Roorkee", domains: ["iitr.ac.in"] },
  { id: "ropar", name: "IIT Ropar", domains: ["iitrpr.ac.in"] },
  { id: "tirupati", name: "IIT Tirupati", domains: ["iittp.ac.in"] },
];

export function findIit(id: string): Iit | undefined {
  return iits.find((iit) => iit.id === id);
}

export function emailBelongsTo(iit: Iit, email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return iit.domains.some((d) => domain === d || domain.endsWith(`.${d}`));
}
