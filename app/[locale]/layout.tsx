import { connection } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return children;
}
