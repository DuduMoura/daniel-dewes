import { listAreas } from "@/modules/locations/queries";
import { LocationsManager } from "@/modules/locations/components/locations-manager";

// Reflete o estado atual a cada acesso (hierarquia em tempo real).
export const dynamic = "force-dynamic";

export default async function LocalizacaoPage() {
  const areas = await listAreas();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Localização</h1>
        <p className="text-sm text-muted-foreground">
          Organização do armazém em áreas, corredores e posições.
        </p>
      </header>

      <LocationsManager areas={areas} />
    </div>
  );
}
