import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import Hint from "@/shared/components/Hint";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

interface ProviderCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function ProviderCreateModal({ open, onOpenChange, onSuccess }: ProviderCreateModalProps) {
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [tipoDoc, setTipoDoc] = useState("");
    const [dni, setDni] = useState("");
    const [zona, setZona] = useState("");
    const [fechaRevision, setFechaRevision] = useState("");
    const [codigo, setCodigo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [selectedFruits, setSelectedFruits] = useState<string[]>([]);

    useEffect(() => {
        if (!open) {
            setNombres("");
            setApellidos("");
            setTipoDoc("");
            setDni("");
            setZona("");
            setFechaRevision("");
            setCodigo("");
            setTelefono("");
            setEmail("");
            setSelectedFruits([]);
        }
    }, [open]);

    const handleAddFruit = (value: string | null) => {
        if (value && !selectedFruits.includes(value)) {
            setSelectedFruits([...selectedFruits, value]);
        }
    };

    const handleRemoveFruit = (fruit: string) => {
        setSelectedFruits(selectedFruits.filter((f) => f !== fruit));
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Registrar Proveedor"
            description="Completa la información para registrar un nuevo proveedor."
            className="sm:max-w-225"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        Crear Proveedor
                    </Button>
                </>
            }
        >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Row 1 */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Nombres:</label>
                        <Input value={nombres} onChange={(e) => setNombres(e.target.value)} className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Apellidos:</label>
                        <Input value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Tipo de Documento:</label>
                        <Select value={tipoDoc} onValueChange={setTipoDoc}>
                            <SelectTrigger className="w-full rounded-lg h-11! border-border shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="dni" className="rounded-lg">DNI</SelectItem>
                                <SelectItem value="ce" className="rounded-lg">CE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">DNI:</label>
                        <Input value={dni} onChange={(e) => setDni(e.target.value)} className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Zona:</label>
                        <Input value={zona} onChange={(e) => setZona(e.target.value)} className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Fecha Revision SENASA:</label>
                        <Input type="date" value={fechaRevision} onChange={(e) => setFechaRevision(e.target.value)} className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5 sm:col-span-2">
                        <label className="text-[13px] font-semibold text-ink">Frutas derivadas:</label>
                        <Select onValueChange={handleAddFruit} value="">
                            <SelectTrigger className="w-full rounded-lg !h-11 border-border shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccionar fruta derivada" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="Mango Kent" className="rounded-lg">Mango Kent</SelectItem>
                                <SelectItem value="Mango Edward" className="rounded-lg">Mango Edward</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Row 3 */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Codigo Proveedor:</label>
                        <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Teléfono:</label>
                        <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Email:</label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5 row-span-2">
                        <label className="text-[13px] font-semibold text-ink">Frutas seleccionadas:</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedFruits.map((fruit) => (
                                <div
                                    key={fruit}
                                    className="bg-brand-surface text-brand pr-3 pl-2 py-1.5 rounded-full text-[13px] font-semibold flex items-center gap-2"
                                >
                                    <Hint label="Quitar">
                                        <button
                                            onClick={() => handleRemoveFruit(fruit)}
                                            className="hover:bg-brand-border rounded-full p-0.5 transition-colors text-brand"
                                            aria-label={`Quitar ${fruit}`}
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </Hint>
                                    {fruit}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="flex flex-col justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger 
                                render={
                                    <Button type="button" variant="outline" size="xl" className="border-dashed border-brand-border text-ink-body hover:border-brand hover:text-brand hover:bg-brand-surface flex gap-2 shadow-none w-full">
                                        <Upload size={16} />
                                        Adjuntar archivo DNI
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="center" className="w-45 rounded-lg p-1">
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5">
                                    Link
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5 text-ink-muted border-t border-border mt-1">
                                    Archivo
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex flex-col justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger 
                                render={
                                    <Button type="button" variant="outline" size="xl" className="border-dashed border-brand-border text-ink-body hover:border-brand hover:text-brand hover:bg-brand-surface flex gap-2 shadow-none w-full">
                                        <Upload size={16} />
                                        Certificado Nacional
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="center" className="w-45 rounded-lg p-1">
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5">
                                    Link
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5 text-ink-muted border-t border-border mt-1">
                                    Archivo
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
        </AppModal>
    );
}
