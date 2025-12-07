import { createSessionClient } from "@/lib/appwrite/kdsm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code } = await request.json();
    const { account } = await createSessionClient();
    
    await account.updateMfaAuthenticator("totp", code);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}