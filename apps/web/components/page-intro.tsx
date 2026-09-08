import { corpusLabel } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import Image from "next/image";

export function PageIntro({
  eyebrow,
  title,
  description,
  corpusKey,
}: {
  eyebrow: string;
  title: string;
  description: string;
  corpusKey: CorpusKey;
}) {
  return (
    <header className="page-intro night-surface">
      <Image
        alt=""
        className="page-intro-landscape"
        src="/images/exalt-hero-sky.webp"
        fill
        preload
        sizes="100vw"
        unoptimized
      />
      <div className="site-container">
        <div className="page-eyebrow">
          <span aria-hidden="true" /> {eyebrow}{" "}
          <span aria-hidden="true">/</span> {corpusLabel(corpusKey)} library
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}
