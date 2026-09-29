"use client";

import { useActionState } from "react";
import { ArrowRightIcon, LockKeyIcon } from "@phosphor-icons/react";
import { loginAction } from "@/app/admin/actions";

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-md border border-[#d8d8d2] bg-white px-3.5 text-sm text-[#272822] outline-none transition focus:border-[#8b1a2e] focus:ring-2 focus:ring-[#8b1a2e]/15";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-5">
      {!configured && (
        <p
          role="alert"
          className="border-l-2 border-[#b86b1c] bg-[#fff6e8] px-3 py-2.5 text-sm leading-5 text-[#69400d]"
        >
          O acesso ainda não foi configurado no servidor. Defina as variáveis de
          autenticação administrativa no ambiente do frontend.
        </p>
      )}
      {state?.error && (
        <p role="alert" className="text-sm font-semibold text-[#a5233a]">
          {state.error}
        </p>
      )}
      <label className="block text-sm font-bold text-[#383832]">
        Usuário
        <input
          autoComplete="username"
          name="username"
          required
          disabled={!configured || pending}
          className={fieldClassName}
        />
      </label>
      <label className="block text-sm font-bold text-[#383832]">
        Senha
        <input
          autoComplete="current-password"
          name="password"
          type="password"
          required
          disabled={!configured || pending}
          className={fieldClassName}
        />
      </label>
      <button
        type="submit"
        disabled={!configured || pending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#8b1a2e] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#6b1222] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LockKeyIcon aria-hidden="true" size={17} />
        {pending ? "Verificando acesso..." : "Entrar no painel"}
        {!pending && <ArrowRightIcon aria-hidden="true" size={16} />}
      </button>
    </form>
  );
}