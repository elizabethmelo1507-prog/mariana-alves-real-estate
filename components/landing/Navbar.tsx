import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "../../components/ui/navbar-menu";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";

export function Navbar({ className }: { className?: string }) {
    const [active, setActive] = useState<string | null>(null);
    return (
        <div
            className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
        >
            <Menu setActive={setActive}>
                <MenuItem setActive={setActive} active={active} item="Funcionalidades">
                    <div className="flex flex-col space-y-4 text-sm">
                        <HoveredLink to="#features">Site e Catálogo</HoveredLink>
                        <HoveredLink to="#features">CRM e Funil</HoveredLink>
                        <HoveredLink to="#features">Automação</HoveredLink>
                        <HoveredLink to="#features">Gestão Completa</HoveredLink>
                    </div>
                </MenuItem>
                <MenuItem setActive={setActive} active={active} item="Planos">
                    <div className="flex flex-col space-y-4 text-sm">
                        <HoveredLink to="#pricing">Básico</HoveredLink>
                        <HoveredLink to="#pricing">Pro</HoveredLink>
                        <HoveredLink to="#pricing">Imobiliária</HoveredLink>
                    </div>
                </MenuItem>
                <MenuItem setActive={setActive} active={active} item="Recursos">
                    <div className="flex flex-col space-y-4 text-sm">
                        <HoveredLink to="#faq">FAQ</HoveredLink>
                        <HoveredLink to="/admin/login">Login</HoveredLink>
                        <HoveredLink to="/signup">Criar Conta</HoveredLink>
                    </div>
                </MenuItem>
            </Menu>
        </div>
    );
}
