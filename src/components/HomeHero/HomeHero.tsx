import { TrueFocus } from "@pbd/components/ui/TrueFocus/TrueFocus"
import { APP_NAME } from "@pbd/lib/constants/app"
import type { JSX } from "react"

export const HomeHero = (): JSX.Element => (
  <div className="pt-2 text-center">
    <div className="flex animate-fade-up flex-col items-center gap-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Fantasy Premier League
      </p>
      <div className="flex justify-center">
        <TrueFocus
          sentence={APP_NAME}
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
)
