import { NextResponse } from "next/server";
import { generateKey } from "@/utils/kdsm";

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// GET endpoint for simple integration via query params
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lengthParam = parseInt(searchParams.get("length") || "0", 10);
  const options = {
    includeNumbers: searchParams.get("includeNumbers") === "true",
    includeSpecialChars: searchParams.get("includeSpecialChars") === "true",
    includeUppercase: searchParams.get("includeUppercase") === "true",
    includeLowercase: searchParams.get("includeLowercase") === "true",
    excludeSimilar: searchParams.get("excludeSimilar") === "true",
    customChars: searchParams.get("customChars") || undefined,
  };
  if (isNaN(lengthParam) || lengthParam <= 0) {
    return NextResponse.json(
      { error: "Invalid length parameter" },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
  const password = await generateKey(lengthParam, options);
  return NextResponse.json(
    { password },
    { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
  );
}

// POST endpoint for sending JSON body with options
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      length,
      includeNumbers,
      includeSpecialChars,
      includeUppercase,
      includeLowercase,
      excludeSimilar,
      customChars,
    } = body;
    const lengthNum = typeof length === "number" ? length : parseInt(length, 10);
    if (isNaN(lengthNum) || lengthNum <= 0) {
      return NextResponse.json(
        { error: "Invalid length" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }
    const options = {
      includeNumbers,
      includeSpecialChars,
      includeUppercase,
      includeLowercase,
      excludeSimilar,
      customChars,
    };
    const password = await generateKey(lengthNum, options);
    return NextResponse.json(
      { password },
      { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error).message || "Internal error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
