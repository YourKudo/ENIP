import {
  Briefcase,
  Compass,
  FileText,
  GraduationCap,
  MessageCircleHeart,
  Rocket,
  type LucideIcon,
} from "lucide-react";

// "What you can do here" categories. Each one fills the search with an
// intent, so product can tune the wording without touching pages.
export const searchIntents: {
  label: string;
  query: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Jobs & Placements",
    query: "Alumni hiring for jobs and placements",
    icon: Briefcase,
  },
  {
    label: "Internships",
    query: "Help me find an internship",
    icon: GraduationCap,
  },
  {
    label: "Resume Reviews",
    query: "Someone who can review my resume",
    icon: FileText,
  },
  {
    label: "Career Guidance",
    query: "Career guidance after placements",
    icon: Compass,
  },
  {
    label: "Founders & Hiring",
    query: "Founders who are hiring",
    icon: Rocket,
  },
  {
    label: "Rants & Campus Life",
    query: "I just need to rant about college",
    icon: MessageCircleHeart,
  },
];

// Natural-language starters shown under the search bar.
export const examplePrompts = [
  "Find IIT alumni hiring software engineers",
  "Someone who can review my resume",
  "I need an internship in venture capital",
  "Help me prepare for product management interviews",
  "I want to talk to someone about startup ideas",
  "I just need to rant about college",
];
