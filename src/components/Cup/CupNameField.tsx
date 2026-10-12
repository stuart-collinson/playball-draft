import { Field, FieldError, FieldLabel } from "@pbd/components/ui/field"
import { Input } from "@pbd/components/ui/input"
import { CUP_NAME_MAX_LENGTH } from "@pbd/lib/constants/Cups"
import type { JSX } from "react"
import type { FieldError as FormFieldError, UseFormRegisterReturn } from "react-hook-form"

type Props = {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error: FormFieldError | undefined
  placeholder?: string
}

export const CupNameField = ({
  id,
  label,
  registration,
  error,
  placeholder,
}: Props): JSX.Element => (
  <Field data-invalid={Boolean(error) || undefined}>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <Input
      id={id}
      {...registration}
      maxLength={CUP_NAME_MAX_LENGTH}
      placeholder={placeholder}
      aria-invalid={Boolean(error) || undefined}
      className="h-11"
    />
    <FieldError errors={[error]} />
  </Field>
)
