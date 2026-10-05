import type { FileEncoding } from "./types";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [".csv", ".txt"] as const;

export type FileReadResult =
  | { ok: true; fileName: string; text: string; encoding: FileEncoding }
  | { ok: false; error: string };

export function decodeBytes(bytes: ArrayBuffer): {
  text: string;
  encoding: FileEncoding;
} {
  try {
    return {
      text: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      encoding: "utf-8",
    };
  } catch {
    return {
      text: new TextDecoder("windows-1252").decode(bytes),
      encoding: "windows-1252",
    };
  }
}

export async function readCsvFile(file: File): Promise<FileReadResult> {
  const name = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return { ok: false, error: "Envie um arquivo .csv ou .txt." };
  }
  if (file.size > MAX_FILE_BYTES) {
    const limit = MAX_FILE_BYTES / 1024 / 1024;
    return { ok: false, error: `O arquivo passa do limite de ${limit} MB.` };
  }
  const { text, encoding } = decodeBytes(await file.arrayBuffer());
  if (!text.trim()) return { ok: false, error: "O arquivo está vazio." };
  return { ok: true, fileName: file.name, text, encoding };
}
