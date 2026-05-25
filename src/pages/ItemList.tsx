import { useState, useEffect, useCallback } from "react";
import { itemsApi, categoriesApi, roomsApi } from "../api";
import type { Item, Category, Room } from "../types";
import ItemCard from "../components/ItemCard";
import FilterBar from "../components/FilterBar";

const DEBOUNCE_MS = 300;

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  // Load filter options once
  useEffect(() => {
    void Promise.all([categoriesApi.list(), roomsApi.list()]).then(
      ([cats, rms]) => {
        setCategories(cats);
        setRooms(rms);
      }
    );
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsApi.list({
        search: debouncedSearch || undefined,
        category: categorySlug || undefined,
        room: roomId || undefined,
        status: status || undefined,
      });
      setItems(data);
    } catch {
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categorySlug, roomId, status]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <FilterBar
        search={search}
        onSearch={setSearch}
        categorySlug={categorySlug}
        onCategory={setCategorySlug}
        roomId={roomId}
        onRoom={setRoomId}
        status={status}
        onStatus={setStatus}
        categories={categories}
        rooms={rooms}
      />

      {error && (
        <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-indigo-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          {search || categorySlug || roomId
            ? "No items match your filters."
            : "No items yet. Add your first item with the + button."}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
