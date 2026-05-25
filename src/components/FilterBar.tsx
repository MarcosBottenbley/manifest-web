import { type ChangeEvent } from "react";
import type { Category, Room, ItemStatus } from "../types";

const STATUSES: { value: ItemStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SOLD", label: "Sold" },
  { value: "DONATED", label: "Donated" },
  { value: "DISPOSED", label: "Disposed" },
  { value: "LOST", label: "Lost" },
];

interface Props {
  search: string;
  onSearch: (v: string) => void;
  categorySlug: string;
  onCategory: (v: string) => void;
  roomId: string;
  onRoom: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  categories: Category[];
  rooms: Room[];
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
    >
      {children}
    </select>
  );
}

export default function FilterBar({
  search,
  onSearch,
  categorySlug,
  onCategory,
  roomId,
  onRoom,
  status,
  onStatus,
  categories,
  rooms,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="search"
        placeholder="Search…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
      />
      <Select value={categorySlug} onChange={(e) => onCategory(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select value={roomId} onChange={(e) => onRoom(e.target.value)}>
        <option value="">All rooms</option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>
      <Select value={status} onChange={(e) => onStatus(e.target.value)}>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
