import { getSanityEvents } from "@/lib/sanity";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getSanityEvents();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
