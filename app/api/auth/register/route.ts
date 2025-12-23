import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { buatUser, temukanUserByEmail } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";
    if (!email || !password) return NextResponse.json({ sukses: false, pesan: "Email dan password diperlukan" }, { status: 400 });

    const exist = await temukanUserByEmail(email);
    if (exist) return NextResponse.json({ sukses: false, pesan: "Email sudah terdaftar" }, { status: 409 });

    const user = await buatUser(email, password);
    return NextResponse.json({ sukses: true, data: { id: user.id, email: user.email } }, { status: 201 });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[/api/auth/register]", err);
    return NextResponse.json({ sukses: false, pesan: "Gagal mendaftar" }, { status: 500 });
  }
}