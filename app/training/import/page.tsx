import { JsonImportForm } from "@/components/training/json-import-form";
import { PageHeader } from "@/components/ui/page-header";
import { trainingSessions } from "@/src/data/training-source";

export default function ImportTrainingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Importar entrenamiento"
        title="Importar entrenamiento por JSON"
        description="Pega un appInput normalizado, valida la estructura básica y revisa una previsualización antes de que exista guardado real."
      />
      <JsonImportForm seedSessions={trainingSessions} />
    </>
  );
}
