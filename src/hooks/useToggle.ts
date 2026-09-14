import { useCallback, useState } from "react"

export const useToggle = (initialValue = false): [boolean, () => void] => {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue((current) => !current), [])
  return [value, toggle]
}
