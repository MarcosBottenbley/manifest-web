import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { itemsApi, attachmentsApi } from "../api";
import type { Item } from "../types";
import AttachmentGallery from "../components/AttachmentGallery";
import QRLabel from "../components/QRLabel";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-200">{value}</dd>
    </div>
  );
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    itemsApi
      .get(id)
      .then(setItem)
      .catch(() => navigate("/", { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleDelete() {
    if (!item || !confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    await itemsApi.delete(item.id);
    navigate("/", { replace: true });
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !item) return;
    for (const file of Array.from(files)) {
      await attachmentsApi.upload(item.id, file);
    }
    const updated = await itemsApi.get(item.id);
    setItem(updated);
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!item) return;
    await attachmentsApi.delete(attachmentId);
    setItem({ ...item, attachments: item.attachments.filter((a) => a.id !== attachmentId) });
  }

  async function handleSetPrimary(attachmentId: string) {
    if (!item) return;
    await attachmentsApi.setPrimary(attachmentId);
    setItem({
      ...item,
      attachments: item.attachments.map((a) => ({
        ...a,
        isPrimaryPhoto: a.id === attachmentId,
      })),
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-indigo-500" />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">{item.name}</h1>
          <p className="text-sm text-slate-400">
            {[item.make, item.manufacturer].filter(Boolean).join(" / ")} · {item.category.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/items/${item.id}/edit`}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:border-slate-600 hover:text-white"
          >
            Edit
          </Link>
          <button
            onClick={() => void handleDelete()}
            className="rounded-lg border border-red-900 px-3 py-1.5 text-sm font-medium text-red-400 hover:border-red-700 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Core details */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:grid-cols-3">
        <Field label="Status" value={item.status.charAt(0) + item.status.slice(1).toLowerCase()} />
        <Field label="Condition" value={CONDITION_LABELS[item.condition]} />
        <Field label="Model #" value={item.modelNumber} />
        <Field label="Serial #" value={item.serialNumber} />
        <Field label="Vendor" value={item.vendor} />
        <Field
          label="Purchase price"
          value={item.purchasePrice != null ? `$${item.purchasePrice.toFixed(2)}` : null}
        />
        <Field
          label="Date acquired"
          value={item.dateAcquired ? new Date(item.dateAcquired).toLocaleDateString() : null}
        />
        <Field
          label="Warranty expires"
          value={item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString() : null}
        />
        {item.status === "SOLD" && (
          <>
            <Field
              label="Sale price"
              value={item.salePrice != null ? `$${item.salePrice.toFixed(2)}` : null}
            />
            <Field
              label="Date sold"
              value={item.dateSold ? new Date(item.dateSold).toLocaleDateString() : null}
            />
          </>
        )}
        {item.material && <Field label="Material" value={item.material} />}
        <Field
          label="Location"
          value={
            item.room
              ? [item.room.name, item.spot?.name].filter(Boolean).join(" › ")
              : undefined
          }
        />
      </dl>

      {item.description && (
        <div>
          <h2 className="mb-1 text-sm font-medium text-slate-400">Description</h2>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{item.description}</p>
        </div>
      )}

      {item.notes && (
        <div>
          <h2 className="mb-1 text-sm font-medium text-slate-400">Notes</h2>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span
              key={t.id}
              className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Attachments */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-400">Attachments</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            + Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </div>
        <AttachmentGallery
          attachments={item.attachments}
          onDelete={(id) => void handleDeleteAttachment(id)}
          onSetPrimary={(id) => void handleSetPrimary(id)}
        />
        {item.attachments.length === 0 && (
          <p className="text-sm text-slate-600">No attachments yet.</p>
        )}
      </div>

      {/* QR label */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-slate-400">QR Label</h2>
        <QRLabel itemId={item.id} itemName={item.name} />
      </div>
    </div>
  );
}
