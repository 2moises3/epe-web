import { useState, useEffect } from "react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";

interface ClientCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function ClientCreateModal({ open, onOpenChange, onSuccess }: ClientCreateModalProps) {
    const [name, setName] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [telefono, setTelefono] = useState("");
    const [ruc, setRuc] = useState("");
    const [email, setEmail] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [tipo, setTipo] = useState("");

    useEffect(() => {
        if (!open) {
            setName("");
            setEmpresa("");
            setTelefono("");
            setRuc("");
            setEmail("");
            setUbicacion("");
            setTipo("");
        }
    }, [open]);

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Registrar Cliente"
            description="Completa la información para registrar un nuevo cliente."
            className="sm:max-w-162.5"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        Crear Cliente
                    </Button>
                </>
            }
        >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Row 1 */}
                    <div className="flex flex-col gap-2.5 sm:col-span-2">
                        <label className="text-[13px] font-semibold text-ink">Nombres Completos:</label>
                        <Input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" 
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Empresa:</label>
                        <Input 
                            value={empresa} 
                            onChange={(e) => setEmpresa(e.target.value)} 
                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" 
                        />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Teléfono:</label>
                        <Input 
                            value={telefono} 
                            onChange={(e) => setTelefono(e.target.value)} 
                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" 
                        />
                    </div>

                    {/* Row 3 */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">RUC:</label>
                        <Input 
                            value={ruc} 
                            onChange={(e) => setRuc(e.target.value)} 
                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" 
                        />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Correo Corporativo:</label>
                        <Input 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" 
                        />
                    </div>

                    {/* Row 4 */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Ubicación:</label>
                        <Input 
                            value={ubicacion} 
                            onChange={(e) => setUbicacion(e.target.value)} 
                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" 
                        />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Tipo de Cliente:</label>
                        <Select value={tipo} onValueChange={setTipo}>
                            <SelectTrigger className="w-full rounded-lg h-11! border-border shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="mayorista" className="rounded-lg">Mayorista</SelectItem>
                                <SelectItem value="minorista" className="rounded-lg">Minorista</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
        </AppModal>
    );
}
