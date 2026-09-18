import { createHash, randomBytes } from "node:crypto"

import { CUP_SEED_BYTES } from "@pbd/lib/constants/Cups"
import { PARTICIPANTS } from "@pbd/lib/constants/Participants"
import { personSlug } from "@pbd/lib/people"

const UINT32_RANGE = 4294967296

const compareSlugs = (first: string, second: string): number => {
  if (first < second) return -1
  if (first > second) return 1
  return 0
}

const digestOf = (seed: string, label: string): Buffer =>
  createHash("sha256").update(`${seed}:${label}`).digest()

export const createDrawSeed = (): string => randomBytes(CUP_SEED_BYTES).toString("hex")

export const cupEntrants = (): string[] =>
  PARTICIPANTS.map((participant) => personSlug(participant.name)).sort(compareSlugs)

export const shuffleWithSeed = (entrants: readonly string[], seed: string): string[] => {
  const shuffled = [...entrants]
  let counter = 0

  const nextUint32 = (): number => {
    const digest = digestOf(seed, String(counter))
    counter += 1
    return digest.readUInt32BE(0)
  }

  const nextIndex = (bound: number): number => {
    const unbiasedLimit = Math.floor(UINT32_RANGE / bound) * bound
    let draw = nextUint32()
    while (draw >= unbiasedLimit) draw = nextUint32()

    return draw % bound
  }

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = nextIndex(index + 1)
    const current = shuffled[index]
    const target = shuffled[swapIndex]
    if (current === undefined || target === undefined) continue

    shuffled[index] = target
    shuffled[swapIndex] = current
  }

  return shuffled
}

export const seededCoinFlip = (seed: string, label: string): number =>
  (digestOf(seed, label)[0] ?? 0) % 2
