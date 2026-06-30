"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaFormDialog } from "./area-form-dialog";
import { AisleFormDialog } from "./aisle-form-dialog";
import { PositionFormDialog } from "./position-form-dialog";
import { deleteArea, deleteAisle, deletePosition } from "../actions";
import type { AreaWithChildren } from "../queries";

type Props = {
  areas: AreaWithChildren[];
};

// Opções simplificadas para os seletores dos formulários.
type AreaOption = {
  id: string;
  code: string;
  name: string;
  aisles: { id: string; code: string }[];
};

export function LocationsManager({ areas }: Props) {
  const [isPending, startTransition] = useTransition();

  const areaOptions: AreaOption[] = areas.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    aisles: a.aisles.map((ai) => ({ id: ai.id, code: ai.code })),
  }));

  // Estado dos diálogos (um por nível).
  const [areaDialog, setAreaDialog] = useState<{
    open: boolean;
    area?: { id: string; code: string; name: string };
  }>({ open: false });

  const [aisleDialog, setAisleDialog] = useState<{
    open: boolean;
    defaultAreaId?: string;
    aisle?: { id: string; code: string; areaId: string };
  }>({ open: false });

  const [positionDialog, setPositionDialog] = useState<{
    open: boolean;
    defaultAreaId?: string;
    defaultAisleId?: string;
    position?: { id: string; code: string; aisleId: string; areaId: string };
  }>({ open: false });

  function runDelete(action: () => Promise<{ ok: boolean; errors?: Record<string, string[]> }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(success);
      else toast.error(result.errors?._?.[0] ?? "Não foi possível remover");
    });
  }

  return (
    <div className="space-y-4" data-pending={isPending ? "" : undefined}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setPositionDialog({ open: true })}
          disabled={areas.length === 0}
        >
          <Plus className="size-4" />
          Nova posição
        </Button>
        <Button
          variant="outline"
          onClick={() => setAisleDialog({ open: true })}
          disabled={areas.length === 0}
        >
          <Plus className="size-4" />
          Novo corredor
        </Button>
        <Button onClick={() => setAreaDialog({ open: true })}>
          <Plus className="size-4" />
          Nova área
        </Button>
      </div>

      {areas.length === 0 ? (
        <div className="rounded-md border py-12 text-center text-sm text-muted-foreground">
          Nenhuma localização cadastrada. Comece criando uma área.
        </div>
      ) : (
        <div className="space-y-4">
          {areas.map((area) => (
            <div key={area.id} className="rounded-md border">
              {/* Cabeçalho da área */}
              <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold">{area.code}</span>
                  <span className="font-medium">{area.name}</span>
                  <Badge variant="secondary">{area._count.aisles} corredor(es)</Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar área ${area.code}`}
                    onClick={() =>
                      setAreaDialog({
                        open: true,
                        area: { id: area.id, code: area.code, name: area.name },
                      })
                    }
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remover área ${area.code}`}
                    onClick={() => {
                      if (!confirm(`Remover a área "${area.code}"?`)) return;
                      runDelete(() => deleteArea(area.id), "Área removida");
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Corredores */}
              <div className="divide-y">
                {area.aisles.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    Sem corredores nesta área.
                  </p>
                ) : (
                  area.aisles.map((aisle) => (
                    <div key={aisle.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold">
                            {aisle.code}
                          </span>
                          <Badge variant="outline">
                            {aisle._count.positions} posição(ões)
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Editar corredor ${aisle.code}`}
                            onClick={() =>
                              setAisleDialog({
                                open: true,
                                aisle: {
                                  id: aisle.id,
                                  code: aisle.code,
                                  areaId: area.id,
                                },
                              })
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Remover corredor ${aisle.code}`}
                            onClick={() => {
                              if (!confirm(`Remover o corredor "${aisle.code}"?`)) return;
                              runDelete(() => deleteAisle(aisle.id), "Corredor removido");
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Posições */}
                      {aisle.positions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                          {aisle.positions.map((pos) => (
                            <span
                              key={pos.id}
                              className="group inline-flex items-center gap-1 rounded border bg-background px-2 py-0.5 text-xs"
                            >
                              <MapPin className="size-3 text-muted-foreground" />
                              <span className="font-mono">{pos.code}</span>
                              <button
                                type="button"
                                aria-label={`Editar posição ${pos.code}`}
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  setPositionDialog({
                                    open: true,
                                    position: {
                                      id: pos.id,
                                      code: pos.code,
                                      aisleId: aisle.id,
                                      areaId: area.id,
                                    },
                                  })
                                }
                              >
                                <Pencil className="size-3" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Remover posição ${pos.code}`}
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  if (!confirm(`Remover a posição "${pos.code}"?`)) return;
                                  runDelete(
                                    () => deletePosition(pos.id),
                                    "Posição removida",
                                  );
                                }}
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AreaFormDialog
        open={areaDialog.open}
        onOpenChange={(open) => setAreaDialog((s) => ({ ...s, open }))}
        area={areaDialog.area}
      />
      <AisleFormDialog
        open={aisleDialog.open}
        onOpenChange={(open) => setAisleDialog((s) => ({ ...s, open }))}
        areas={areaOptions}
        defaultAreaId={aisleDialog.defaultAreaId}
        aisle={aisleDialog.aisle}
      />
      <PositionFormDialog
        open={positionDialog.open}
        onOpenChange={(open) => setPositionDialog((s) => ({ ...s, open }))}
        areas={areaOptions}
        defaultAreaId={positionDialog.defaultAreaId}
        defaultAisleId={positionDialog.defaultAisleId}
        position={positionDialog.position}
      />
    </div>
  );
}
