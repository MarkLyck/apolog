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
  corpusKey?: CorpusKey;
}) {
  return (
    <header className="page-intro night-surface">
      <Image
        alt=""
        className="page-intro-landscape"
        src="/images/exalt-hero-sky.webp"
        fill
        preload
        sizes="(max-width: 767px) max(150vw, 1100px), 100vw"
      />
      <div className="site-container">
        <div className="page-eyebrow">
          <span aria-hidden="true" /> {eyebrow}{" "}
          <span aria-hidden="true">/</span>{" "}
          <span className={corpusKey ? undefined : "invisible"}>
            {corpusLabel(corpusKey ?? "bible")} library
          </span>
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}
