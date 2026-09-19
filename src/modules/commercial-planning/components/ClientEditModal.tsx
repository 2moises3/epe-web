import { useState, useEffect } from "react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";

interface ClientEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function ClientEditModal({ open, onOpenChange, onSuccess }: ClientEditModalProps) {
    const [name, setName] = useState("Empresa SAC");
    const [empresa, setEmpresa] = useState("Empresa");
    const [telefono, setTelefono] = useState("987654321");
    const [ruc, setRuc] = useState("20123456789");
    const [email, setEmail] = useState("contacto@empresa.com");
    const [ubicacion, setUbicacion] = useState("Lima, Perú");
    const [tipo, setTipo] = useState("mayorista");

    useEffect(() => {
        if (!open) {
            // Edit modal normally resets to original data, here we just keep it simple or clear
            setName("Empresa SAC");
            setEmpresa("Empresa");
            setTelefono("987654321");
            setRuc("20123456789");
            setEmail("contacto@empresa.com");
            setUbicacion("Lima, Perú");
            setTipo("mayorista");
        }
    }, [open]);

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Editar Cliente"
            description="Modifica la información del cliente existente."
            className="sm:max-w-162.5"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        Guardar
                    </Button>
                </>
            }
        >
                <div className="grid grid-cols-2 gap-6">
                    {/* Row 1 */}
                    <div className="flex flex-col gap-2.5 col-span-2">
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
                            <SelectTrigger className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand">
                                <SelectValue placeholder="" />
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
