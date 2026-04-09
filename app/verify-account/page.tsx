import { Suspense } from "react";
import { VerifyAccountContent } from "./VerifyAccountContent";

export default function VerifyAccountPage() {
  return (
    <Suspense
      fallback={
        <main className="app-shell">
          <div className="page-shell flex min-h-[calc(100dvh-4rem)] items-center">
            <div className="surface-card rounded-[2rem] p-8 text-sm text-slate-500 dark:text-slate-400">
              Loading verification page...
            </div>
          </div>
        </main>
      }
    >
      <VerifyAccountContent />
    </Suspense>
  );
}
