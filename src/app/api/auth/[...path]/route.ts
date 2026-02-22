import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

let _handler:
  | Awaited<ReturnType<typeof import("@neondatabase/auth/next/server").authApiHandler>>
  | undefined;

function getHandler() {
  if (!_handler) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@neondatabase/auth/next/server") as typeof import("@neondatabase/auth/next/server");
    _handler = mod.authApiHandler();
  }
  return _handler;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return getHandler().GET(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return getHandler().POST(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return getHandler().PUT(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return getHandler().DELETE(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return getHandler().PATCH(request, context);
}
