import { useState } from "react";
import type { Attachment } from "../types";
import { attachmentsApi } from "../api";

const TYPE_LABELS: Record<string, string> = {
  PHOTO: "Photo",
  RECEIPT: "Receipt",
  WARRANTY: "Warranty",
  MANUAL: "Manual",
  OTHER: "Other",
};

interface Props {
  attachments: Attachment[];
  onDelete?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
}

export default function AttachmentGallery({ attachments, onDelete, onSetPrimary }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const photos = attachments.filter((a) => a.type === "PHOTO");
  const docs = attachments.filter((a) => a.type !== "PHOTO");

  if (attachments.length === 0) return null;

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-400">Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((a) => (
              <div key={a.id} className="group relative">
                <button onClick={() => setLightbox(a.id)} className="block w-full">
                  <img
                    src={attachmentsApi.fileUrl(a.id)}
                    alt={a.filename}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  {a.isPrimaryPhoto && (
                    <span className="absolute left-1 top-1 rounded bg-indigo-600 px-1 py-0.5 text-[10px] font-medium text-white">
                      Primary
                    </span>
                  )}
                </button>
                {(onDelete || onSetPrimary) && (
                  <div className="absolute bottom-1 right-1 hidden gap-1 group-hover:flex">
                    {onSetPrimary && !a.isPrimaryPhoto && (
                      <button
                        onClick={() => onSetPrimary(a.id)}
                        className="rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] text-slate-200 hover:bg-slate-800"
                      >
                        Set primary
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(a.id)}
                        className="rounded bg-red-900/80 px-1.5 py-0.5 text-[10px] text-red-300 hover:bg-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {docs.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-400">Documents</h3>
          <div className="space-y-1">
            {docs.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex-shrink-0 rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                    {TYPE_LABELS[a.type]}
                  </span>
                  <a
                    href={attachmentsApi.fileUrl(a.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    {a.filename}
                  </a>
                </div>
                {onDelete && (
                  <button
                    onClick={() => onDelete(a.id)}
                    className="ml-2 flex-shrink-0 text-xs text-slate-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={attachmentsApi.fileUrl(lightbox)}
            alt="Full size"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
