import { NextResponse } from "next/server";
import { getDictionary } from "@/i18n/dictionaries";
import { detectLocale } from "@/i18n/routing";
import { analyzeFilename } from "@/lib/analyze-filename";

type AnalyzeRequest = {
  filename?: string;
};

/**
 * Point d'entrée prévu pour l'analyse des vêtements.
 *
 * Aujourd'hui, il analyse le nom du fichier. Plus tard, vous pourrez remplacer
 * ou compléter cette fonction par OpenAI Vision, Gemini, Claude ou un modèle
 * local, sans exposer la clé secrète dans le navigateur.
 */
export const POST = async (request: Request) => {
  const body = (await request.json()) as AnalyzeRequest;

  if (!body.filename?.trim()) {
    const locale = detectLocale(request.headers.get("accept-language"));
    const messages = await getDictionary(locale);

    return NextResponse.json(
      { error: messages.api.filenameRequired },
      { status: 400 },
    );
  }

  return NextResponse.json({
    source: "filename",
    ...analyzeFilename(body.filename),
  });
};
