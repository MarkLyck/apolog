import { reportContentTypes, summarizeReports } from "@/lib/browser-reports";

const maxReportBytes = 64 * 1024;

async function readBounded(request: Request): Promise<string | undefined> {
  if (Number(request.headers.get("content-length") ?? 0) > maxReportBytes) {
    return undefined;
  }
  const reader = request.body?.getReader();
  if (!reader) {
    return "";
  }
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      return text + decoder.decode();
    }
    bytes += value.byteLength;
    if (bytes > maxReportBytes) {
      await reader.cancel();
      return undefined;
    }
    text += decoder.decode(value, { stream: true });
  }
}

export async function POST(request: Request) {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();
  const contentType = reportContentTypes.find((type) => type === mediaType);
  if (contentType === undefined) {
    return new Response(null, { status: 415 });
  }
  const body = await readBounded(request);
  if (body === undefined) {
    return new Response(null, { status: 413 });
  }
  const lines = summarizeReports(contentType, body);
  if (!lines) {
    return new Response(null, { status: 400 });
  }
  for (const line of lines) {
    console.info(`[browser-report] ${line}`);
  }
  return new Response(null, { status: 204 });
}
