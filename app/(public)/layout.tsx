import Navbar from "@/components/Navbar";
import { supabaseAuthServer } from "@/lib/supabase/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseAuthServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}