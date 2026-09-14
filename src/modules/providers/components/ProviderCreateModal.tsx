import { useState } from "react";
import { Upload, X, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
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
    const [selectedFruits, setSelectedFruits] = useState<string[]>([]);

    const handleAddFruit = (value: string | null) => {
        if (value && !selectedFruits.includes(value)) {
            setSelectedFruits([...selectedFruits, value]);
        }
    };

    const handleRemoveFruit = (fruit: string) => {
        setSelectedFruits(selectedFruits.filter((f) => f !== fruit));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[900px] p-5 sm:p-8 rounded-2xl bg-white border-none shadow-2xl gap-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6">
                    <div className="flex items-start gap-5">
                        <div className="w-[52px] h-[52px] rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 border border-brand-border">
                            <Users size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogTitle className="text-xl font-bold text-ink">
                                Registrar Proveedor
                            </DialogTitle>
                            <DialogDescription className="text-[13.5px] text-ink-muted mt-1">
                                Completa la información para registrar un nuevo proveedor.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Row 1 */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Nombres:</label>
                        <Input className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Apellidos:</label>
                        <Input className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Tipo de Documento:</label>
                        <Select>
                            <SelectTrigger className="w-full rounded-lg !h-11 border-border text-ink-muted shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
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
                        <Input className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Zona:</label>
                        <Input className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Fecha Revision SENASA:</label>
                        <Input type="date" className="rounded-lg h-11 border-border text-ink-muted shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5 sm:col-span-2">
                        <label className="text-[13px] font-semibold text-ink">Frutas derivadas:</label>
                        <Select onValueChange={handleAddFruit} value="">
                            <SelectTrigger className="w-full rounded-lg !h-11 border-border text-ink-muted shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
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
                        <Input className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Teléfono:</label>
                        <Input className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Email:</label>
                        <Input className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
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
                                    <Button type="button" variant="outline" className="h-11 rounded-lg border-dashed border-brand-border text-ink-body hover:border-brand hover:text-brand hover:bg-brand-surface font-semibold flex gap-2 shadow-none w-full transition-colors active:scale-95">
                                        <Upload size={16} />
                                        Adjuntar archivo DNI
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="center" className="w-[180px] rounded-lg p-1">
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
                                    <Button type="button" variant="outline" className="h-11 rounded-lg border-dashed border-brand-border text-ink-body hover:border-brand hover:text-brand hover:bg-brand-surface font-semibold flex gap-2 shadow-none w-full transition-colors active:scale-95">
                                        <Upload size={16} />
                                        Certificado Nacional
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="center" className="w-[180px] rounded-lg p-1">
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

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-8 [&>button]:w-full sm:[&>button]:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg h-11 px-8 border-border text-ink-muted font-bold hover:bg-muted hover:text-ink transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onSuccess}
                        className="rounded-lg h-11 px-8 bg-brand hover:bg-brand-dark text-white font-semibold gap-2 shadow-sm transition-all active:scale-95"
                    >
                        Crear Proveedor
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
