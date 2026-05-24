import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import {
  buildNotesExport,
  buildNotesExportHtml,
  type NotesExportFormat,
  type NotesFileExportFormat
} from "@/services/export/notesExport";
import type { Folder, Note } from "@/types/models";

type ShareNotesExportFileParams = {
  folders: Folder[];
  format: NotesFileExportFormat;
  notes: Note[];
};

type ShareTextExportFileParams = Omit<ShareNotesExportFileParams, "format"> & {
  format: NotesExportFormat;
};

const exportConfig: Record<
  NotesFileExportFormat,
  {
    extension: string;
    mimeType: string;
    uti: string;
  }
> = {
  pdf: {
    extension: "pdf",
    mimeType: "application/pdf",
    uti: "com.adobe.pdf"
  },
  markdown: {
    extension: "md",
    mimeType: "text/markdown",
    uti: "net.daringfireball.markdown"
  },
  text: {
    extension: "txt",
    mimeType: "text/plain",
    uti: "public.plain-text"
  },
  json: {
    extension: "json",
    mimeType: "application/json",
    uti: "public.json"
  }
};

const exportFileName = (format: NotesFileExportFormat) => {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  return `blockynotes-export-${stamp}.${exportConfig[format].extension}`;
};

const createTextExportFile = ({ folders, format, notes }: ShareTextExportFileParams) => {
  const file = new File(Paths.cache, exportFileName(format));

  if (file.exists) {
    file.delete();
  }

  file.create({ overwrite: true });
  file.write(buildNotesExport({ folders, format, notes }));

  return file;
};

const createPdfExportFile = async ({ folders, format, notes }: ShareNotesExportFileParams) => {
  const printedFile = await Print.printToFileAsync({
    html: buildNotesExportHtml({ folders, notes })
  });
  const source = new File(printedFile.uri);
  const destination = new File(Paths.cache, exportFileName(format));

  if (destination.exists) {
    destination.delete();
  }

  source.copy(destination);

  return destination;
};

export const shareNotesExportFile = async (params: ShareNotesExportFileParams) => {
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  const file =
    params.format === "pdf"
      ? await createPdfExportFile(params)
      : createTextExportFile({
          folders: params.folders,
          format: params.format,
          notes: params.notes
        });
  const config = exportConfig[params.format];

  await Sharing.shareAsync(file.uri, {
    dialogTitle: "Exporter mes notes",
    mimeType: config.mimeType,
    UTI: config.uti
  });

  return file.uri;
};
