"use client";

import { useState } from "react";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/confirm`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not send the magic link."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
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
          <CardTitle>{sent ? "Check your email" : "Sign in"}</CardTitle>
          <CardDescription>
            {sent
              ? `We sent a magic link to ${email}. Tap it on this device to sign in.`
              : "We'll email you a magic link — no password needed."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSent(false)}
            >
              Use a different email
            </Button>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send magic link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
