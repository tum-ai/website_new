import { getResearchProjects } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await getResearchProjects();

  return NextResponse.json(projects);
}
