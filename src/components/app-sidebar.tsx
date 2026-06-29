"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  MapPin,
  ArrowLeftRight,
  ClipboardCheck,
  TriangleAlert,
  ShoppingCart,
  Boxes,
  Users,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/modules/auth/actions";
import type { SessionUser, Role } from "@/lib/session";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
};
type NavGroup = { title: string; items: NavItem[] };

const ROLE_LABELS: Record<Role, string> = {
  GESTOR: "Gestor",
  OPERADOR: "Operador",
  COMPRAS: "Compras",
};

const groups: NavGroup[] = [
  {
    title: "Visão geral",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operação",
    items: [
      { href: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight, roles: ["GESTOR", "OPERADOR"] },
      { href: "/pedidos", label: "Pedidos", icon: ShoppingCart, roles: ["GESTOR", "OPERADOR"] },
      { href: "/inventario", label: "Inventário", icon: ClipboardCheck, roles: ["GESTOR", "OPERADOR"] },
      { href: "/alertas", label: "Alertas", icon: TriangleAlert, roles: ["GESTOR", "COMPRAS"] },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { href: "/produtos", label: "Produtos", icon: Package },
      { href: "/fornecedores", label: "Fornecedores", icon: Truck, roles: ["GESTOR", "COMPRAS"] },
      { href: "/localizacao", label: "Localização", icon: MapPin, roles: ["GESTOR", "OPERADOR"] },
    ],
  },
  {
    title: "Administração",
    items: [
      { href: "/usuarios", label: "Usuários", icon: Users, roles: ["GESTOR"] },
    ],
  },
];

type Props = {
  user: SessionUser | null;
  unreadAlerts?: number;
};

export function AppSidebar({ user, unreadAlerts = 0 }: Props) {
  const pathname = usePathname();

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || !user || item.roles.includes(user.role),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Boxes className="size-4" />
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">WMS</span>
          <span className="text-[11px] text-sidebar-foreground/50">Armazém</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-3">
        {visibleGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {group.title}
            </span>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              const isAlerts = href === "/alertas";
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-sidebar-primary" />
                  )}
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-sidebar-primary" : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground",
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {isAlerts && unreadAlerts > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                      {unreadAlerts > 99 ? "99+" : unreadAlerts}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {user && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-md px-3 py-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50">{ROLE_LABELS[user.role]}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex size-7 items-center justify-center rounded-md text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                title="Sair"
              >
                <LogOut className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
