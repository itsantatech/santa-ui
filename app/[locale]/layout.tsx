import { connection } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const skeletonMinimumDurationMs = 2000;

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await Promise.all([connection(), waitForSkeletonMinimumDuration()]);

  return children;
}

function waitForSkeletonMinimumDuration() {
  return new Promise((resolve) => {
    setTimeout(resolve, skeletonMinimumDurationMs);
  });
}
