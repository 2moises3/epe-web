import type { HTMLInputTypeAttribute, ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

interface InputFieldProps {
    id: string;
    label: ReactNode;
    value: string;
    /** Se omite en los campos de solo lectura */
    onChange?: (value: string) => void;
    error?: string;
    placeholder?: string;
    /** Tipo nativo del control; por defecto es numérico si hay `step` y de texto si no */
    type?: HTMLInputTypeAttribute;
    /** Precisión de un campo numérico (decimal) */
    step?: string;
    min?: number;
    maxLength?: number;
    /** Unidad dentro del campo, a la derecha (ver `unit` de `Input`) */
    unit?: string;
    /** Marca el campo como obligatorio: asterisco en la etiqueta y `aria-required` */
    required?: boolean;
    /** Anota "(opcional)" en la etiqueta */
    optional?: boolean;
    /** Ayuda debajo del campo; se reemplaza por el error cuando lo hay */
    hint?: string;
    disabled?: boolean;
    readOnly?: boolean;
    /** "compact": etiqueta chica en mayúsculas, para formularios densos */
    variant?: "default" | "compact";
    /** Clases del contenedor del campo, p. ej. `sm:col-span-2` para ocupar dos columnas de una grilla */
    className?: string;
    /** Clases del control, p. ej. `uppercase` */
    inputClassName?: string;
}

/**
 * Campo de formulario completo: etiqueta, control, unidad, ayuda y error, ya enlazados para accesibilidad.
 * Es el campo de texto o número de todos los modales: lo que cambia de uno a otro se expresa con sus
 * props (unidad, obligatorio, solo lectura, variante) y no con una copia local.
 */
export default function InputField({
    id,
    label,
    value,
    onChange,
    error,
    placeholder,
    type,
    step,
    min,
    maxLength,
    unit,
    required,
    optional,
    hint,
    disabled,
    readOnly,
    variant,
    className,
    inputClassName,
}: InputFieldProps) {
    return (
        <Field className={className} data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={id} variant={variant} optional={optional}>
                {label} {required && !optional && <span aria-hidden="true" className="text-destructive">*</span>}
            </FieldLabel>
            <Input
                id={id}
                type={type ?? (step ? "number" : "text")}
                inputMode={step ? "decimal" : undefined}
                step={step}
                min={min}
                maxLength={maxLength}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                readOnly={readOnly}
                unit={unit}
                onChange={(event) => onChange?.(event.target.value)}
                className={inputClassName}
                aria-required={required ? true : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
            />
            {error
                ? <FieldError id={`${id}-error`}>{error}</FieldError>
                : hint && <FieldDescription className="text-[12px]">{hint}</FieldDescription>}
        </Field>
    );
}
