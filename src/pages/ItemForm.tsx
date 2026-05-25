import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { itemsApi, categoriesApi, roomsApi, upcApi, healthApi } from "../api";
import type { Category, Room, ItemFormData, Condition, ItemStatus, Item } from "../types";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

const STATUSES: { value: ItemStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "SOLD", label: "Sold" },
  { value: "DONATED", label: "Donated" },
  { value: "DISPOSED", label: "Disposed" },
  { value: "LOST", label: "Lost" },
];

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none";

function toDateInput(iso?: string | null): string {
  if (!iso) return "";
  return iso.split("T")[0];
}

function fromDateInput(v: string): string | undefined {
  if (!v) return undefined;
  return new Date(v).toISOString();
}

export default function ItemForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [upcEnabled, setUpcEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scanner state
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [form, setForm] = useState<ItemFormData>({
    name: "",
    categoryId: 0,
    condition: "GOOD",
    status: "ACTIVE",
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    void Promise.all([
      categoriesApi.list(),
      roomsApi.list(),
      healthApi.get(),
    ]).then(([cats, rms, health]) => {
      setCategories(cats);
      setRooms(rms);
      setUpcEnabled(health.upcLookupEnabled);
      if (cats.length > 0 && !isEdit) {
        setForm((f) => ({ ...f, categoryId: cats[0].id }));
      }
    });
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit || !id) return;
    itemsApi.get(id).then((item: Item) => {
      setForm({
        name: item.name,
        description: item.description,
        categoryId: item.category.id,
        make: item.make,
        manufacturer: item.manufacturer,
        modelNumber: item.modelNumber,
        serialNumber: item.serialNumber,
        roomId: item.room?.id,
        spotId: item.spot?.id,
        dateAcquired: item.dateAcquired,
        purchasePrice: item.purchasePrice,
        vendor: item.vendor,
        condition: item.condition,
        status: item.status,
        salePrice: item.salePrice,
        dateSold: item.dateSold,
        warrantyExpiry: item.warrantyExpiry,
        material: item.material,
        notes: item.notes,
        tagNames: item.tags.map((t) => t.name),
      });
      setTagInput(item.tags.map((t) => t.name).join(", "));
    });
  }, [id, isEdit]);

  function set<K extends keyof ItemFormData>(key: K, value: ItemFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value || undefined }));
  }

  const selectedRoom = rooms.find((r) => r.id === form.roomId);

  async function startUpcScan() {
    setScanning(true);
    readerRef.current = new BrowserMultiFormatReader();
    try {
      await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        async (result, err) => {
          if (result) {
            stopScan();
            const code = result.getText();
            try {
              const product = await upcApi.lookup(code);
              setForm((f) => ({
                ...f,
                name: product.name ?? f.name,
                make: product.make ?? f.make,
                modelNumber: product.modelNumber ?? f.modelNumber,
                description: product.description ?? f.description,
              }));
            } catch {
              // Product not found — just close the scanner
            }
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error(err);
          }
        }
      );
    } catch {
      setScanning(false);
    }
  }

  function stopScan() {
    readerRef.current?.reset();
    setScanning(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.categoryId) {
      setError("Please select a category");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const tagNames = tagInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      const data = { ...form, tagNames };

      if (isEdit && id) {
        await itemsApi.update(id, data);
        navigate(`/items/${id}`);
      } else {
        const item = await itemsApi.create(data);
        navigate(`/items/${item.id}`);
      }
    } catch {
      setError("Failed to save item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-white">
        {isEdit ? "Edit item" : "Add item"}
      </h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {/* UPC scanner */}
        {upcEnabled && !isEdit && (
          <div>
            {scanning ? (
              <div className="space-y-2">
                <video ref={videoRef} className="w-full rounded-lg" />
                <button
                  type="button"
                  onClick={stopScan}
                  className="w-full rounded-lg border border-slate-700 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Cancel scan
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void startUpcScan()}
                className="w-full rounded-lg border border-slate-700 py-2 text-sm font-medium text-indigo-400 hover:border-indigo-700 hover:text-indigo-300"
              >
                Scan barcode to prefill
              </button>
            )}
          </div>
        )}

        <Field label="Name" required>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={inputCls}
            placeholder="e.g. Sony WH-1000XM5"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" required>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={(e) => set("categoryId", parseInt(e.target.value))}
              className={inputCls}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Condition">
            <select
              name="condition"
              value={form.condition}
              onChange={(e) => set("condition", e.target.value as Condition)}
              className={inputCls}
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Make / Brand">
            <input name="make" value={form.make ?? ""} onChange={handleChange} className={inputCls} placeholder="Sony" />
          </Field>
          <Field label="Manufacturer">
            <input name="manufacturer" value={form.manufacturer ?? ""} onChange={handleChange} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Model #">
            <input name="modelNumber" value={form.modelNumber ?? ""} onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Serial #">
            <input name="serialNumber" value={form.serialNumber ?? ""} onChange={handleChange} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Room">
            <select
              name="roomId"
              value={form.roomId ?? ""}
              onChange={(e) => {
                set("roomId", e.target.value || undefined);
                set("spotId", undefined);
              }}
              className={inputCls}
            >
              <option value="">— none —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Spot">
            <select
              name="spotId"
              value={form.spotId ?? ""}
              onChange={(e) => set("spotId", e.target.value || undefined)}
              className={inputCls}
              disabled={!selectedRoom || selectedRoom.spots.length === 0}
            >
              <option value="">— none —</option>
              {selectedRoom?.spots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase price">
            <input
              type="number"
              name="purchasePrice"
              value={form.purchasePrice ?? ""}
              onChange={(e) => set("purchasePrice", e.target.value ? parseFloat(e.target.value) : undefined)}
              min={0}
              step="0.01"
              className={inputCls}
              placeholder="0.00"
            />
          </Field>
          <Field label="Date acquired">
            <input
              type="date"
              value={toDateInput(form.dateAcquired)}
              onChange={(e) => set("dateAcquired", fromDateInput(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Vendor / Retailer">
          <input name="vendor" value={form.vendor ?? ""} onChange={handleChange} className={inputCls} placeholder="Amazon" />
        </Field>

        <Field label="Warranty expiry">
          <input
            type="date"
            value={toDateInput(form.warrantyExpiry)}
            onChange={(e) => set("warrantyExpiry", fromDateInput(e.target.value))}
            className={inputCls}
          />
        </Field>

        <Field label="Status">
          <select
            name="status"
            value={form.status}
            onChange={(e) => set("status", e.target.value as ItemStatus)}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        {form.status === "SOLD" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sale price">
              <input
                type="number"
                value={form.salePrice ?? ""}
                onChange={(e) => set("salePrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                min={0}
                step="0.01"
                className={inputCls}
              />
            </Field>
            <Field label="Date sold">
              <input
                type="date"
                value={toDateInput(form.dateSold)}
                onChange={(e) => set("dateSold", fromDateInput(e.target.value))}
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {/* Clothing-specific */}
        {categories.find((c) => c.id === form.categoryId)?.slug === "clothing" && (
          <Field label="Material">
            <input name="material" value={form.material ?? ""} onChange={handleChange} className={inputCls} placeholder="100% cotton" />
          </Field>
        )}

        <Field label="Tags">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className={inputCls}
            placeholder="gaming, living room, rebecca (comma-separated)"
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            value={form.description ?? ""}
            onChange={handleChange}
            rows={2}
            className={inputCls}
          />
        </Field>

        <Field label="Notes">
          <textarea
            name="notes"
            value={form.notes ?? ""}
            onChange={handleChange}
            rows={3}
            className={inputCls}
            placeholder="Any additional notes…"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-lg border border-slate-700 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add item"}
          </button>
        </div>
      </form>
    </div>
  );
}
