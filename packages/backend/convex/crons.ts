import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "remove expired rate limits",
  { hours: 1 },
  internal.rateLimits.cleanupExpired,
  {}
);

export default crons;
