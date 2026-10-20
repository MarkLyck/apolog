import { api } from "@apolog/backend/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { handleUpload } from "@vercel/blob/client";
import { fetchQuery } from "convex/nextjs";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import { NextResponse } from "next/server";

import { allowedImageTypes, maxImageBytes } from "@/lib/image-upload";

const clientTokenRequestSchema = Schema.Struct({
  payload: Schema.Struct({
    clientPayload: Schema.NullOr(Schema.String),
    multipart: Schema.Boolean,
    pathname: Schema.String,
  }),
  type: Schema.Literal("blob.generate-client-token"),
});

export async function POST(request: Request) {
  const access = await fetchQuery(
    api.articles.canManage,
    {},
    { token: await convexAuthNextjsToken() }
  );
  if (!access.authorized) {
    return access.authenticated
      ? NextResponse.json(
          { error: "Administrator access is required." },
          { status: 403 }
        )
      : NextResponse.json(
          { error: "Sign in to upload images." },
          { status: 401 }
        );
  }
  const body = Schema.decodeUnknownResult(clientTokenRequestSchema)(
    await request.json().catch(() => null)
  );
  if (Result.isFailure(body)) {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 }
    );
  }
  return NextResponse.json(
    await handleUpload({
      body: body.success,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        allowedContentTypes: allowedImageTypes,
        maximumSizeInBytes: maxImageBytes,
      }),
      request,
    })
  );
}
