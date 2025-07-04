import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login",
};

async function login(formData: FormData) {
  "use server";

  const password = formData.get("password")?.toString() ?? "";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

  if (password === ADMIN_PASSWORD && password.length > 0) {
    // @ts-expect-error - cookies() is mutable in server actions
    cookies().set("auth", "true", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10),
      path: "/",
    });

    const redirectPath = formData.get("redirect")?.toString() || "/";
    redirect(redirectPath);
  }

  redirect("/login?error=1");
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardContent className="py-6">
          <form action={login} className="space-y-4">
            <Input type="password" name="password" placeholder="Password" className="opacity-75" />
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 