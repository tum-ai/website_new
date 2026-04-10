import { getEvents } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET() {
  const events = await getEvents();

  return NextResponse.json(events);
}
