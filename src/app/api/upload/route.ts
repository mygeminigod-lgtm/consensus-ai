import { NextRequest, NextResponse } from "next/server";
import { SecuritySanitizer } from "@/lib/security/sanitization";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    const textContent = await file.text();
    const safeWrapped = SecuritySanitizer.wrapUntrustedDocumentContext(textContent, file.name);

    return NextResponse.json({
      filename: file.name,
      sizeBytes: file.size,
      wrappedContext: safeWrapped,
      charCount: textContent.length,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || "Upload failed" }, { status: 500 });
  }
}
