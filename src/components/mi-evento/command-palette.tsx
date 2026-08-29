"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Command as CommandIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

export type PaletteAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
};

export type PaletteGroup = {
  heading: string;
  actions: PaletteAction[];
};

/** Atajo global ⌘K / Ctrl+K */
export function usePaletteHotkey() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}

export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "¿Qué quieres hacer?",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: PaletteGroup[];
  placeholder?: string;
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Acciones rápidas"
      description="Busca una acción o sección"
      showCloseButton={false}
      className="max-sm:top-4 max-sm:translate-y-0"
    >
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No encontramos esa acción.</CommandEmpty>
        {groups.map((group, gi) => (
          <div key={group.heading}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.actions.map((action) => (
                <CommandItem
                  key={action.id}
                  value={action.label}
                  keywords={action.keywords}
                  onSelect={() => {
                    onOpenChange(false);
                    // Esperar al cierre para que el scroll/focus funcione bien
                    setTimeout(action.onSelect, 60);
                  }}
                >
                  {action.icon}
                  <span>{action.label}</span>
                  {action.shortcut && <CommandShortcut>{action.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

/** Botón de header que abre la paleta (visible en desktop) */
export function PaletteButton({ onClick, dark = false }: { onClick: () => void; dark?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Acciones rápidas (⌘K)"
      className={cn(
        "hit-44 hidden min-h-10 items-center gap-2 rounded-full border px-3 text-xs transition-colors md:inline-flex",
        dark
          ? "border-background/20 text-background hover:bg-background/10"
          : "border-border text-muted-foreground hover:bg-secondary"
      )}
    >
      <CommandIcon size={13} aria-hidden="true" />
      <span className="hidden lg:inline">Acciones</span>
      <Kbd className={cn("pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium sm:inline-flex", dark ? "border-background/25 bg-background/10 text-background" : "bg-muted text-muted-foreground")}>
        ⌘K
      </Kbd>
    </button>
  );
}
