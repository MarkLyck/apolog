import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import {
  ContradictionAssessmentGuide,
  ContradictionAssessmentLabels,
  ContradictionAssessmentPanel,
} from "./contradiction-assessment";

const reason = "The accounts give different ages at the same accession.";
describe("comparison assessment labels", () => {
  test("shows a direct conflict and minor importance as separate judgments", () => {
    const assessment = {
      status: "reviewed",
      kind: "direct",
      importance: 2,
      reason,
    } as const;
    const panel = renderToStaticMarkup(
      <ContradictionAssessmentPanel assessment={assessment} />
    );
    expect(panel).toContain("Direct contradiction");
    expect(panel).toContain("Minor");
    expect(panel).toContain(reason);
    expect(panel).toContain("it does not increase certainty");
    expect(
      renderToStaticMarkup(
        <ContradictionAssessmentLabels assessment={assessment} />
      )
    ).toContain("Importance: Minor");
  });
  test("does not call an unproven claim a direct contradiction or show stale importance", () => {
    expect(
      renderToStaticMarkup(
        <ContradictionAssessmentLabels
          assessment={{
            status: "reviewed",
            kind: "not-demonstrated",
            importance: 5,
            reason,
          }}
        />
      )
    ).toContain("Weak contradiction");
    const changed = renderToStaticMarkup(
      <ContradictionAssessmentPanel assessment={{ status: "changed" }} />
    );
    expect(changed).toContain("Assessment needs review");
    expect(changed).not.toContain("Foundational");
    expect(
      renderToStaticMarkup(
        <ContradictionAssessmentPanel assessment={undefined} />
      )
    ).toContain("Awaiting assessment");
  });
  test("explains inference and rank without presenting a certainty percentage", () => {
    const html = renderToStaticMarkup(<ContradictionAssessmentGuide />);
    for (const label of [
      "Direct contradiction",
      "Interpretive tension",
      "Weak tension",
      "Weak contradiction",
    ]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("It is not a certainty score");
  });
});
