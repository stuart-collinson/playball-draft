import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { GwWeeklyResults } from "@pbd/components/home/GwCards";
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl";
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server";
import { TrueFocus } from "@pbd/components/ui/TrueFocus/TrueFocus";

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
      <div className="flex flex-col gap-4">
        {/* Hero */}
        <div className="pt-2 text-center">
          <div className="flex flex-col items-center animate-fade-up gap-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Fantasy Premier League
            </p>
            <div className="flex justify-center">
              <TrueFocus
                sentence="Playball Draft"
                manualMode={false}
                blurAmount={5}
                borderColor="#5227FF"
                animationDuration={0.5}
                pauseBetweenAnimations={1}
              />
            </div>
            <div>
              <div className="animate-fade-up-delay-1 mx-auto mt-2 h-px w-20 bg-gradient-to-r from-prem-500 to-champ-500" />
              <p className="animate-fade-up-delay-1 mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Et tu, brute?
              </p>
            </div>
          </div>
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
