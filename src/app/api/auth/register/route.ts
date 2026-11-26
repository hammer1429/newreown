import { hash } from "bcryptjs";
import { createAuthUser, normalizeEmail } from "@/lib/auth-users";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 415 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "회원가입 정보를 확인해 주세요." },
      { status: 400 },
    );
  }

  if (!isRecord(payload)) {
    return Response.json(
      { error: "회원가입 정보를 확인해 주세요." },
      { status: 400 },
    );
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const rawEmail = typeof payload.email === "string" ? payload.email : "";
  const email = normalizeEmail(rawEmail);
  const password =
    typeof payload.password === "string" ? payload.password : "";
  const passwordConfirmation =
    typeof payload.passwordConfirmation === "string"
      ? payload.passwordConfirmation
      : "";

  if (!name || name.length > 60) {
    return Response.json(
      { error: "이름을 1자 이상 60자 이하로 입력해 주세요." },
      { status: 400 },
    );
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return Response.json(
      { error: "올바른 이메일 주소를 입력해 주세요." },
      { status: 400 },
    );
  }

  if ([...password].length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return Response.json(
      { error: "비밀번호는 8자 이상이며 UTF-8 기준 72바이트 이하여야 합니다." },
      { status: 400 },
    );
  }

  if (password !== passwordConfirmation) {
    return Response.json(
      { error: "비밀번호가 서로 일치하지 않습니다." },
      { status: 400 },
    );
  }

  const passwordHash = await hash(password, 12);
  const created = await createAuthUser({ name, email, passwordHash });

  if (!created) {
    return Response.json(
      { error: "이미 가입된 이메일입니다. 로그인해 주세요." },
      { status: 409 },
    );
  }

  return Response.json({ message: "회원가입이 완료되었습니다." }, { status: 201 });
}
