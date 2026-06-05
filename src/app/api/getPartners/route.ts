import { getSanityPartners } from "@/lib/sanity";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const partners = await getSanityPartners();
    return NextResponse.json(partners);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 },
    );
  }
}
