import { Link } from "react-router-dom";
import type { Item } from "../types";
import { attachmentsApi } from "../api";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-900/40 text-green-400",
  SOLD: "bg-blue-900/40 text-blue-400",
  DONATED: "bg-purple-900/40 text-purple-400",
  DISPOSED: "bg-slate-700 text-slate-400",
  LOST: "bg-red-900/40 text-red-400",
};

export default function ItemCard({ item }: { item: Item }) {
  const primaryPhoto = item.attachments.find((a) => a.isPrimaryPhoto);

  return (
    <Link
      to={`/items/${item.id}`}
      className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 hover:border-slate-700 transition-colors"
    >
      {primaryPhoto ? (
        <img
          src={attachmentsApi.fileUrl(primaryPhoto.id)}
          alt={item.name}
          className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-600">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-medium text-white">{item.name}</p>
          <span
            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status] ?? ""}`}
          >
            {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-slate-400">
          {[item.make, item.category.name].filter(Boolean).join(" · ")}
        </p>
        {item.room && (
          <p className="mt-0.5 text-xs text-slate-500">
            {item.room.name}
            {item.spot ? ` › ${item.spot.name}` : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
