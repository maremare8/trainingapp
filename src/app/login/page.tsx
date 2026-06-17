"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${siteUrl}/auth/confirm` },
        });
        if (error) throw error;
        // If email confirmation is disabled in Supabase, session is created
        // immediately; otherwise the user needs to click the email link.
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          toast.success("Account created. Check your email to confirm.");
          setMode("signin");
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function onMagicLink() {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${siteUrl}/auth/confirm` },
      });
      if (error) throw error;
      setMagicSent(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not send the magic link."
      );
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/confirm`,
      });
      if (error) throw error;
      toast.success("Password reset email sent.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not send reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col px-6 pt-[max(4rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-2xl">
          <Dumbbell className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Tabata Timer</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to sync your workouts across devices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {magicSent
              ? "Check your email"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </CardTitle>
          <CardDescription>
            {magicSent
              ? `We sent a magic link to ${email}. Tap it on this device to sign in.`
              : mode === "signin"
                ? "Welcome back."
                : "Choose a password (at least 6 characters)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {magicSent ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMagicSent(false)}
            >
              Use a different method
            </Button>
          ) : (
            <>
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as Mode)}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>
                <TabsContent value="signin" />
                <TabsContent value="signup" />
              </Tabs>

              <form onSubmit={onPasswordSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    placeholder="••••••••"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {mode === "signin" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      Remember me
                    </Label>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Please wait…"
                    : mode === "signin"
                      ? "Sign in"
                      : "Create account"}
                </Button>
              </form>

              <div className="flex flex-col gap-2 text-center text-sm">
                {mode === "signin" ? (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline disabled:opacity-50"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                ) : null}
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="bg-border h-px flex-1" />
                  <span className="text-xs uppercase tracking-wide">or</span>
                  <div className="bg-border h-px flex-1" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onMagicLink}
                  disabled={loading}
                >
                  Email me a magic link
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
