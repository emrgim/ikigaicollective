import { handle } from './_lib/mcp.js';
import { PAGES } from '../src/lib/seo.js';

// Read-only MCP endpoint, served at /mcp (rewrite in vercel.json). How to connect: site/MCP.md. Logic: api/_lib/mcp.ts.
// Content is read from this deployment's own public files (same host as the request), or from MCP_CONTENT_ORIGIN if set (not a secret).
const run = (req: Request) => handle(req, { pages: PAGES, contentOrigin: process.env.MCP_CONTENT_ORIGIN || new URL(req.url).origin });

export const POST = run;
export const GET = run;
export const DELETE = run;
export const OPTIONS = run;
