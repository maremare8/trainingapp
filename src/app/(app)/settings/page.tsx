import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  let email: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  } catch {
    // Supabase not configured yet — render without account info.
  }

  return (
    <>
      <PageHeader title="Settings" description="Account and app preferences." />

      <Card>
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Signed in as</p>
            <p className="truncate font-medium">{email ?? "Not signed in"}</p>
          </div>
          <SignOutButton />
        </CardContent>
      </Card>
    </>
  );
}
