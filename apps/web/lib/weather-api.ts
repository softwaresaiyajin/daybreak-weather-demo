import { NextResponse } from "next/server";

export function ok<T>(data: T) {
  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    },
  );
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function openMeteo<T>(url: URL): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 600 } });
  if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);
  return (await response.json()) as T;
}
