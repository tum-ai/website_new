import { getSanityResearchProjects } from "@/lib/sanity";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getSanityResearchProjects();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch research" },
      { status: 500 },
    );
  }
}
