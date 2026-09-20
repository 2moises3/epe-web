import { Bell, ChevronDown, LogOut, Settings, User, ArrowLeft, LayoutGrid } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import LogoEmpresaOnly from "@/assets/image/logo_empresa_only.webp";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { navigationItems } from "@/shared/layout/navigationItems";
import Hint from "@/shared/components/Hint";
import { BRAND_ACTIVE_SURFACE } from "@/shared/styles/brandGradients";

interface TopNavBarProps {
    onLogout?: () => void;
}

export default function TopNavBar({ onLogout }: TopNavBarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const isRoot = location.pathname === '/modules' || location.pathname === '/';

    return (
        <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-8 lg:px-14 bg-white w-full z-20 border-b border-border">
            <div className="flex items-center min-w-0">
                {/* Botón de regresar animado (aparece empujando el logo) */}
                <div
                    className={`overflow-hidden transition-[width,opacity] duration-500 ease-in-out flex items-center shrink-0 ${
                        isRoot ? 'w-0 opacity-0' : 'w-9 sm:w-12 opacity-100'
                    }`}
                >
                    <Hint label="Regresar" side="bottom">
                        <button
                            onClick={() => {
                                const segments = location.pathname.split('/').filter(Boolean);
                                if (segments.length > 1) {
                                    // Si estamos dentro de un módulo (ej. /campaigns/1/providers), volvemos a la raíz del módulo (/campaigns)
                                    navigate(`/${segments[0]}`);
                                } else {
                                    // Si estamos en la raíz del módulo (ej. /campaigns), volvemos a la selección de módulos
                                    navigate('/modules');
                                }
                            }}
                            className="text-ink-muted hover:text-brand transition-all flex items-center justify-center shrink-0 w-8 h-8 rounded-full hover:bg-black/5 mr-1 sm:mr-4 active:scale-95"
                            aria-label="Regresar"
                        >
                            <ArrowLeft size={22} strokeWidth={2} />
                        </button>
                    </Hint>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                    <img src={LogoEmpresaOnly} alt="Agro Exportaciones Logo" className="h-8 sm:h-10 w-auto object-contain shrink-0" />
                    {/* Línea divisoria verde como en el login */}
                    <div className="h-8 sm:h-10 w-0.5 bg-brand shrink-0 rounded-full"></div>
                    {/* El lockup completo no cabe en móvil: se deja solo la marca corta */}
                    <div className="flex flex-col justify-center min-w-0">
                        <span className="font-bold text-[13px] sm:text-[16px] md:text-[18px] leading-none text-brand-dark tracking-tight truncate">
                            <span className="sm:hidden">AGRO F.V.</span>
                            <span className="hidden sm:inline">AGRO EXPORTACIONES</span>
                        </span>
                        <span className="hidden sm:block text-[7px] md:text-[8px] tracking-[0.2em] font-bold text-brand mt-1.5">CULTIVANDO CONFIANZA</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 ml-auto shrink-0">
                {/* Menú rápido de Módulos (Mini-Sidebar) */}
                <DropdownMenu>
                    <Hint label="Módulos" side="bottom">
                        <DropdownMenuTrigger className="text-ink-muted hover:text-brand transition-all outline-none focus-visible:ring-2 focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand/40 rounded-lg p-1 active:scale-95" aria-label="Módulos">
                            <LayoutGrid size={22} strokeWidth={2} />
                        </DropdownMenuTrigger>
                    </Hint>
                    <DropdownMenuContent align="end" sideOffset={12} className="w-75 p-3 rounded-xl grid grid-cols-2 gap-2">
                        {navigationItems.map((item) => (
                            <DropdownMenuItem
                                key={item.title}
                                className="p-0 outline-none"
                                render={
                                    <Link to={item.url} className="w-full group flex flex-col items-center justify-center p-3 gap-2 h-auto text-[13px] font-medium text-ink-body cursor-pointer rounded-xl hover:bg-brand-surface hover:text-brand transition-colors focus:bg-brand-surface text-center outline-none ring-0">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-ink-muted group-hover:bg-brand/15 group-hover:text-brand transition-colors">
                                            <item.icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <span className="leading-tight">{item.title}</span>
                                    </Link>
                                }
                            />
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Hint label="Notificaciones" side="bottom">
                    <button className="text-ink-muted hover:text-brand transition-all relative active:scale-95" aria-label="Notificaciones">
                        <Bell size={22} strokeWidth={2} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </Hint>

                <div className="hidden sm:block h-9 w-px bg-border shrink-0"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 p-1 sm:p-1.5 sm:pl-2 rounded-xl transition-all hover:bg-black/5 outline-none focus-visible:ring-2 focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand/40 active:scale-95">
                        <span
                            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-transparent text-white"
                            style={BRAND_ACTIVE_SURFACE}
                        >
                            <User size={20} strokeWidth={2} />
                        </span>
                        {/* Nombre y rol se ocultan en móvil: el avatar basta como acceso al menú */}
                        <span className="hidden md:flex flex-col items-start">
                            <span className="text-sm font-bold text-ink leading-tight">Juan Pérez</span>
                            <span className="text-xs text-ink-muted font-medium">Usuario Normal</span>
                        </span>
                        <ChevronDown size={16} className="hidden md:block text-ink-muted ml-1" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" sideOffset={8} className="w-56 p-1.5">
                        <DropdownMenuItem className="gap-3 px-3 py-2.5 text-[13px] font-medium text-ink-body">
                            <Settings size={16} />
                            Configuración
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            className="gap-3 px-3 py-2.5 text-[13px] font-medium"
                            onClick={onLogout}
                        >
                            <LogOut size={16} />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
