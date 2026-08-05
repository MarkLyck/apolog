/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as contradictions from "../contradictions.js";
import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as home from "../home.js";
import type * as http from "../http.js";
import type * as map from "../map.js";
import type * as rateLimits from "../rateLimits.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as seo from "../seo.js";
import type * as userRoles from "../userRoles.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  articles: typeof articles;
  auth: typeof auth;
  contradictions: typeof contradictions;
  crons: typeof crons;
  email: typeof email;
  home: typeof home;
  http: typeof http;
  map: typeof map;
  rateLimits: typeof rateLimits;
  search: typeof search;
  seed: typeof seed;
  seo: typeof seo;
  userRoles: typeof userRoles;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
