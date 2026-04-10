import { getPartners } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET() {
  const partners = await getPartners();

  return NextResponse.json(partners);
}
