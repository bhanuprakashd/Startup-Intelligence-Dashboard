import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - WSI | World Startup Intelligence",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      {children}
    </div>
  );
}
