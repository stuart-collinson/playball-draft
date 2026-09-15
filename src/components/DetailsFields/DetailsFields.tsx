import { Field, FieldError, FieldLabel } from "@pbd/components/ui/field"
import { Input } from "@pbd/components/ui/input"
import { Textarea } from "@pbd/components/ui/textarea"
import type { DetailsFieldsCopy, DetailsValues } from "@pbd/types/form.types"
import type { JSX } from "react"
import { useId } from "react"
import { useFormContext } from "react-hook-form"

export const DetailsFields = ({
  titlePlaceholder,
  titleMaxLength,
  descriptionLabel,
  descriptionHint,
  descriptionPlaceholder,
  descriptionMaxLength,
  descriptionRows,
}: DetailsFieldsCopy): JSX.Element => {
  const id = useId()
  const {
    register,
    formState: { errors },
  } = useFormContext<DetailsValues>()

  const titleId = `${id}-title`
  const descriptionId = `${id}-description`

  return (
    <div className="flex flex-col gap-4">
      <Field data-invalid={Boolean(errors.title) || undefined}>
        <FieldLabel htmlFor={titleId}>Title</FieldLabel>
        <Input
          id={titleId}
          {...register("title")}
          maxLength={titleMaxLength}
          placeholder={titlePlaceholder}
          aria-invalid={Boolean(errors.title) || undefined}
          className="h-11"
        />
        <FieldError errors={[errors.title]} />
      </Field>

      <Field data-invalid={Boolean(errors.description) || undefined}>
        <FieldLabel htmlFor={descriptionId}>
          {descriptionLabel}
          {descriptionHint && (
            <span className="font-normal text-muted-foreground">({descriptionHint})</span>
          )}
        </FieldLabel>
        <Textarea
          id={descriptionId}
          {...register("description")}
          rows={descriptionRows}
          maxLength={descriptionMaxLength}
          placeholder={descriptionPlaceholder}
          aria-invalid={Boolean(errors.description) || undefined}
        />
        <FieldError errors={[errors.description]} />
      </Field>
    </div>
  )
}
