"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Boxes, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "../actions";
import { loginSchema, type LoginInput } from "../schema";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const result = await loginAction(data);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    if (result.unreadAlerts && result.unreadAlerts > 0) {
      toast.warning(
        `${result.unreadAlerts} alerta(s) de estoque aguardam sua atenção.`,
        {
          action: {
            label: "Ver alertas",
            onClick: () => router.push("/alertas"),
          },
          duration: 8000,
        },
      );
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm space-y-8 rounded-xl border bg-background p-8 shadow-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Boxes className="size-6" />
          </span>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">WMS</h1>
            <p className="text-sm text-muted-foreground">Gestão de Armazém</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
