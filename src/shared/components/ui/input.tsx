import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, value, defaultValue, onChange, ...props }: React.ComponentProps<"input">) {
  // `data-empty` pinta el placeholder en gris claro. Si el input está controlado el vacío se deduce
  // de `value`, así que solo hace falta estado para el caso no controlado.
  const isControlled = value !== undefined && value !== null;
  const [uncontrolledEmpty, setUncontrolledEmpty] = React.useState(
    () => !(defaultValue !== undefined && defaultValue !== null && String(defaultValue).length > 0)
  );

  const isEmpty = isControlled ? String(value).length === 0 : uncontrolledEmpty;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledEmpty(e.target.value.length === 0);
    onChange?.(e);
  };

  return (
    <InputPrimitive
      type={type}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      data-slot="input"
      data-empty={isEmpty ? "true" : undefined}
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-border bg-transparent px-2.5 py-1 text-base shadow-none transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground text-ink font-medium placeholder:text-ink-muted placeholder:font-normal data-[empty=true]:text-ink-muted data-[empty=true]:font-normal focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }

