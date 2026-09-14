import type { DetailsFieldsCopy } from "@pbd/types/form.types"

export const LUCK_TITLE_MAX_LENGTH = 60

export const LUCK_DESCRIPTION_MAX_LENGTH = 2000

export const LUCK_DETAILS_FIELDS: DetailsFieldsCopy = {
  titlePlaceholder: "The eye-grabbing headline",
  titleMaxLength: LUCK_TITLE_MAX_LENGTH,
  descriptionLabel: "The story",
  descriptionPlaceholder: "What happened, and just how jammy was it?",
  descriptionMaxLength: LUCK_DESCRIPTION_MAX_LENGTH,
  descriptionRows: 5,
}
