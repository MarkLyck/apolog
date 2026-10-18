import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

export const reportContentTypes = [
  "application/reports+json",
  "application/csp-report",
] as const;

export type ReportContentType = (typeof reportContentTypes)[number];

const Text = Schema.optionalKey(Schema.String);

const reportingApiBatch = Schema.fromJsonString(
  Schema.Array(
    Schema.Struct({
      body: Schema.optionalKey(
        Schema.Struct({
          blockedURL: Text,
          disposition: Text,
          effectiveDirective: Text,
          featureId: Text,
          id: Text,
        })
      ),
      type: Schema.String,
      url: Schema.String,
    })
  )
);

const legacyCspReport = Schema.fromJsonString(
  Schema.Struct({
    "csp-report": Schema.Struct({
      "blocked-uri": Text,
      disposition: Text,
      "document-uri": Schema.String,
      "effective-directive": Text,
      "violated-directive": Text,
    }),
  })
);

const clip = (value: string) => value.slice(0, 200);

function withoutQuery(value: string, part: "path" | "resource"): string {
  if (!URL.canParse(value)) {
    return clip(value);
  }
  const url = new URL(value);
  return clip(part === "path" ? url.pathname : `${url.origin}${url.pathname}`);
}

const line = (type: string, page: string, details: (string | undefined)[]) =>
  [
    clip(type),
    withoutQuery(page, "path"),
    ...details.filter((detail): detail is string => Boolean(detail)).map(clip),
  ].join(" ");

export function summarizeReports(
  contentType: ReportContentType,
  json: string
): string[] | undefined {
  if (contentType === "application/csp-report") {
    return Option.getOrUndefined(
      Option.map(
        Schema.decodeOption(legacyCspReport)(json),
        ({ "csp-report": report }) => [
          line("csp-violation", report["document-uri"], [
            report["effective-directive"] ?? report["violated-directive"],
            report["blocked-uri"] &&
              withoutQuery(report["blocked-uri"], "resource"),
            report.disposition,
          ]),
        ]
      )
    );
  }
  return Option.getOrUndefined(
    Option.map(Schema.decodeOption(reportingApiBatch)(json), (batch) =>
      batch.map(({ body, type, url }) =>
        line(type, url, [
          body?.effectiveDirective ?? body?.featureId ?? body?.id,
          body?.blockedURL && withoutQuery(body.blockedURL, "resource"),
          body?.disposition,
        ])
      )
    )
  );
}
