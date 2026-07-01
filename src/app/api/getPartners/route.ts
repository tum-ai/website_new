import { NextResponse } from "next/server";
import { getSanityPartners } from "@/lib/sanity";

export async function GET() {
  try {
    const partners = await getSanityPartners();
    return NextResponse.json(partners);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 },
    );
  }
}
