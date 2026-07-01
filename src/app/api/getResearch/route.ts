import { NextResponse } from "next/server";
import { getSanityResearchProjects } from "@/lib/sanity";

export async function GET() {
  try {
    const data = await getSanityResearchProjects();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch research" },
      { status: 500 },
    );
  }
}
