import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { GwWeeklyResults } from "@pbd/components/home/GwCards";
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl";
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Home" };

const GwSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    {[0, 1].map((i) => (
      <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
    ))}
  </div>
);

const HomePage = async (): Promise<JSX.Element> => {
  const qc = getQueryClient();
  void Promise.all([
    qc.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
    ),
    qc.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({
        leagueId: LEAGUE_SLUG_TO_ID.championship,
      }),
    ),
  ]);

  return (
    <HydrateClient>
      <div className="flex flex-col gap-8">
        {/* Hero */}
        <div className="pt-6 text-center">
          <div className="animate-fade-up">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Fantasy Premier League
            </p>
            <h1 className="leading-none">
              <span
                className="animate-shimmer block bg-gradient-to-r from-prem-400 via-muted-foreground via-50% to-champ-400 bg-[length:200%_auto] bg-clip-text text-6xl font-black uppercase tracking-tight text-transparent sm:text-7xl"
                style={{ WebkitBackgroundClip: "text" }}
              >
                Playball
              </span>
              <span
                className="animate-shimmer block bg-gradient-to-r from-champ-400 via-muted-foreground via-50% to-prem-400 bg-[length:200%_auto] bg-clip-text text-6xl font-black uppercase tracking-tight text-transparent sm:text-7xl"
                style={{ WebkitBackgroundClip: "text", animationDelay: "1.5s" }}
              >
                Draft
              </span>
            </h1>
          </div>
          <div className="animate-fade-up-delay-1 mx-auto mt-5 h-px w-20 bg-gradient-to-r from-prem-500 to-champ-500" />
          <p className="animate-fade-up-delay-1 mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Et tu, brute?
          </p>
        </div>

        {/* Weekly results */}
        <Suspense fallback={<GwSkeleton />}>
          <GwWeeklyResults />
        </Suspense>
      </div>
    </HydrateClient>
  );
};

export default HomePage;
