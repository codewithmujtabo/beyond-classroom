import { apiRequest } from "./api";
import { setToken, clearToken } from "./token.service";

interface AuthResponse {
  token: string;
  user: any;
}

export async function signup(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
  role: string;
  roleData: any;
}): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: params,
    auth: false,
  });
  await setToken(data.token);
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  await setToken(data.token);
  return data;
}

export async function sendOtp(email: string): Promise<void> {
  await apiRequest("/auth/send-otp", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export async function verifyOtp(
  email: string,
  code: string
): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>("/auth/verify-otp", {
    method: "POST",
    body: { email, code },
    auth: false,
  });
  await setToken(data.token);
  return data;
}

export async function getMe(): Promise<any | null> {
  try {
    return await apiRequest("/auth/me");
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await clearToken();
}
