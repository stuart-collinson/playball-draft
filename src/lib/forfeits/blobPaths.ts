const FORFEIT_BLOB_PATH_PATTERN = /^forfeits\/[a-z0-9-]+\/(gw[0-9]{1,2}|annual)\/[A-Za-z0-9._-]+$/

type ForfeitBlobPathsInput = {
  season: string
  gameweek: string
  mediaExtension: string
}

export type ForfeitBlobPaths = {
  mediaPath: string
  thumbPath: string
}

export const forfeitBlobPaths = ({
  season,
  gameweek,
  mediaExtension,
}: ForfeitBlobPathsInput): ForfeitBlobPaths => {
  const seasonSegment = season.replace("/", "-")
  const gameweekSegment = gameweek === "annual" ? "annual" : `gw${gameweek}`
  const folder = `forfeits/${seasonSegment}/${gameweekSegment}`

  return {
    mediaPath: `${folder}/media.${mediaExtension}`,
    thumbPath: `${folder}/thumb.jpg`,
  }
}

export const isForfeitBlobPath = (path: string): boolean => FORFEIT_BLOB_PATH_PATTERN.test(path)
