import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

// Intrinsic size of the mockup images in public/landing/ (all three share it).
const PHONE_WIDTH = 620;
const PHONE_HEIGHT = 1200;

const glimpses = [
  {
    title: "Discover",
    // One entry per line, as broken in the design.
    description: [
      "A concept preview for the work",
      "people do and help they can offer",
    ],
    image: "/landing/glimpse-discover.png",
    alt: "ENIP discovery screen ranking anonymous seniors by what they can help with",
  },
  {
    title: "Spark",
    description: ["Reveal Identities, only", "when you both agree"],
    image: "/landing/glimpse-spark.png",
    alt: "ENIP Spark screen asking both people to agree before identities are revealed",
    highlight: true,
  },
  {
    title: "Chat",
    description: ["Message anonymously", "no name, no photo, no bias"],
    image: "/landing/glimpse-chat.png",
    alt: "ENIP anonymous chat between a student and a senior about their CV",
  },
];

// Landing page: a glimpse of the ENIP app through three phone mockups.
export function Glimpse() {
  return (
    <div className={`landing-glimpse-grid ${poppins.className}`}>
      {glimpses.map((glimpse) => (
        <article
          key={glimpse.title}
          className={
            glimpse.highlight
              ? "landing-glimpse landing-glimpse-highlight"
              : "landing-glimpse"
          }
        >
          <h3>{glimpse.title}</h3>
          <p>
            {glimpse.description.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <Image
            src={glimpse.image}
            alt={glimpse.alt}
            width={PHONE_WIDTH}
            height={PHONE_HEIGHT}
            sizes="264px"
          />
        </article>
      ))}
    </div>
  );
}
