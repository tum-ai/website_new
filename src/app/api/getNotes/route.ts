import { NextResponse } from "next/server";
import { getSanityEvents } from "@/lib/sanity";

export async function GET() {
  try {
    const data = await getSanityEvents();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
