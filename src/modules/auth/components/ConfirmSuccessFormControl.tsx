import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { Button } from "@/shared/components/ui/button";
import { FieldLabel } from "@/shared/components/ui/field";
import { ArrowRight, KeyRound } from "lucide-react";

interface ConfirmSuccessProps {
    onBack?: () => void;
    onConfirm: () => void;
}

const OTP_LENGTH = 6;

export default function ConfirmSuccessFormControl({ onBack, onConfirm }: ConfirmSuccessProps) {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        // Solo permitir números
        if (/[^0-9]/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // Tomar solo el último caracter
        setOtp(newOtp);

        // Auto-avanzar al siguiente input
        if (value !== "" && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        // Retroceder al input anterior si se presiona backspace en un input vacío
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center mb-4">
                <KeyRound size={22} strokeWidth={2.5} className="text-brand" />
            </div>

            <h1 className="text-[24px] font-semibold text-ink tracking-tight text-center">Confirmar sesión</h1>
            <div className="h-1 w-10 bg-brand rounded-full my-3"></div>
            <p className="text-xs text-muted-foreground text-center max-w-70 mb-6">
                Ingresa el código de 6 dígitos que enviamos a tu correo
            </p>

            <div className="w-full space-y-1.5">
                <FieldLabel className="text-sm font-bold text-ink">Código de seguridad</FieldLabel>
                <div className="flex justify-between gap-2" role="presentation">
                    {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otp[index]}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="flex w-0 aspect-square flex-1 items-center justify-center rounded-lg border border-border/70 bg-background text-center text-xl font-semibold text-ink transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30 focus:outline-none caret-brand"
                        />
                    ))}
                </div>
            </div>

            <Button
                onClick={onConfirm}
                size="xl" className="w-full mt-6"
            >
                Confirmar
            </Button>

            {onBack && (
                <div className="mt-6 w-full flex justify-center">
                    <button onClick={onBack} className="text-brand text-sm font-bold hover:underline transition-colors">
                        Volver
                    </button>
                </div>
            )}
        </div>
    )
}
