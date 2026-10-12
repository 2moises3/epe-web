import type { HTMLInputTypeAttribute, ReactNode } from "react";
import FormField from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { DatePicker } from "@/shared/components/ui/date-picker";

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
    /** Teclado que sugiere el móvil; por defecto "decimal" en campos numéricos */
    inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
    /** Unidad dentro del campo, a la derecha (ver `unit` de `Input`) */
    unit?: string;
    /** Ícono o prefijo dentro del campo, a la izquierda (ver `leading` de `Input`) */
    leading?: ReactNode;
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
 * Campo de texto o número de los formularios: `FormField` con un `Input` adentro. Lo que cambia de un
 * campo a otro se expresa con sus props (unidad, obligatorio, solo lectura, variante) y no con una copia
 * local. Con `type="date"` pinta el `DatePicker`. Para selectores, áreas de texto o archivos se usa `FormField` directamente.
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
    inputMode,
    unit,
    leading,
    required,
    optional,
    hint,
    disabled,
    readOnly,
    variant,
    className,
    inputClassName,
}: InputFieldProps) {
    // Las fechas siempre usan el selector con calendario: ninguna pantalla elige el control a mano
    if (type === "date") {
        return (
            <FormField id={id} label={label} required={required} optional={optional} variant={variant} error={error} hint={hint} className={className}>
                <DatePicker
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                />
            </FormField>
        );
    }

    return (
        <FormField id={id} label={label} required={required} optional={optional} variant={variant} error={error} hint={hint} className={className}>
            <Input
                id={id}
                type={type ?? (step ? "number" : "text")}
                inputMode={inputMode ?? (step ? "decimal" : undefined)}
                step={step}
                min={min}
                maxLength={maxLength}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                readOnly={readOnly}
                unit={unit}
                leading={leading}
                onChange={(event) => onChange?.(event.target.value)}
                className={inputClassName}
                aria-required={required ? true : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
            />
        </FormField>
    );
}
