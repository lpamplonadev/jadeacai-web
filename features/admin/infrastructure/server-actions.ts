"use server";

import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin } from "@/features/admin/application/auth";
import {
  clearAdminSession,
  createAdminSession,
  verifyAdminCredentials,
} from "@/features/admin/infrastructure/admin-auth";

export type LoginFormState = { error: string } | null;

const adminAuthGateway = {
  verifyCredentials: verifyAdminCredentials,
  createSession: createAdminSession,
  clearSession: clearAdminSession,
};

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const authenticated = await loginAdmin(username, password, adminAuthGateway);
  if (!authenticated) {
    return { error: "Usuário ou senha inválidos, ou acesso não configurado." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await logoutAdmin(adminAuthGateway);
  redirect("/admin");
}
