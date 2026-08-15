"use client"

import { cn } from "@pbd/lib/utils/cn"
import { motion, useReducedMotion } from "motion/react"
import { Luckiest_Guy } from "next/font/google"
import { useEffect } from "react"
import type { JSX } from "react"

const carnivalFont = Luckiest_Guy({ weight: "400", subsets: ["latin"] })

const AUTO_DISMISS_MS = 2400

type ResultOverlayProps = {
  label: string
  onDismiss: () => void
}

export const ResultOverlay = ({ label, onDismiss }: ResultOverlayProps): JSX.Element => {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onDismiss}
      aria-hidden="true"
    >
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { scale: 0.3, rotate: -8, opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { scale: 1, rotate: -3, opacity: 1 }}
        exit={
          reducedMotion
            ? { opacity: 0, transition: { duration: 0.2 } }
            : { scale: 1.35, opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }
        }
        transition={
          reducedMotion ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 13 }
        }
      >
        <motion.p
          className={cn(
            carnivalFont.className,
            "text-center text-6xl uppercase leading-none carnival-text sm:text-8xl",
          )}
          animate={reducedMotion ? undefined : { scale: [1, 1.06, 1] }}
          transition={
            reducedMotion
              ? undefined
              : { duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
          }
        >
          {label}
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
