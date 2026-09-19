import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import Hint from "@/shared/components/Hint";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

interface ProviderEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function ProviderEditModal({ open, onOpenChange, onSuccess }: ProviderEditModalProps) {
    const [nombres, setNombres] = useState("Juan");
    const [apellidos, setApellidos] = useState("Perez");
    const [tipoDoc, setTipoDoc] = useState("dni");
    const [dni, setDni] = useState("12345678");
    const [zona, setZona] = useState("Norte");
    const [fechaRevision, setFechaRevision] = useState("2026-09-01");
    const [codigo, setCodigo] = useState("PRV-001");
    const [telefono, setTelefono] = useState("987654321");
    const [email, setEmail] = useState("juan@perez.com");
    const [selectedFruits, setSelectedFruits] = useState<string[]>(["Mango Kent"]);

    useEffect(() => {
        if (!open) {
            setNombres("Juan");
            setApellidos("Perez");
            setTipoDoc("dni");
            setDni("12345678");
            setZona("Norte");
            setFechaRevision("2026-09-01");
            setCodigo("PRV-001");
            setTelefono("987654321");
            setEmail("juan@perez.com");
            setSelectedFruits(["Mango Kent"]);
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
            title="Editar Proveedor"
            description="Modifica la información del proveedor existente."
            className="sm:max-w-225"
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
                <div className="grid grid-cols-4 gap-6">                    {/* Row 1 */}
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
                            <SelectTrigger className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand">
                                <SelectValue placeholder="" />
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
                    <div className="flex flex-col gap-2.5 col-span-2">
                        <label className="text-[13px] font-semibold text-ink">Frutas derivadas:</label>
                        <Select onValueChange={handleAddFruit} value="">
                            <SelectTrigger className="rounded-lg h-11 border-border shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand font-medium">
                                <SelectValue placeholder="" />
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
                        <label className="text-[13px] font-semibold text-ink">Frutas derivadas seleccionadas:</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedFruits.map((fruit, idx) => (
                                <div
                                    key={idx}
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
                                    <Button variant="secondary" size="xl" className="bg-ink-body hover:bg-ink text-white flex gap-2 shadow-none w-full">
                                        <Upload size={16} />
                                        Certificado Nacional
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="center" className="w-45 rounded-lg p-1">
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5">
                                    Link
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5 border-t border-border mt-1">
                                    Archivo
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex flex-col justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger 
                                render={
                                    <Button variant="secondary" size="xl" className="bg-ink-body hover:bg-ink text-white flex gap-2 shadow-none w-full">
                                        <Upload size={16} />
                                        Adjuntar DNI
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="center" className="w-45 rounded-lg p-1">
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5">
                                    Link
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5 border-t border-border mt-1">
                                    Archivo
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
        </AppModal>
    );
}
