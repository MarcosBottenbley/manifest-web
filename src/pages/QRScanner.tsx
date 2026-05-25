import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

// QR codes encode the item UUID directly.
// Format: just the UUID string, e.g. "550e8400-e29b-41d4-a716-446655440000"
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function QRScanner() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
        if (result) {
          const text = result.getText().trim();
          if (UUID_RE.test(text)) {
            reader.reset();
            navigate(`/items/${text}`);
          } else {
            setError("That QR code isn't a Manifest item label.");
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          setError("Camera error: " + err.message);
        }
      })
      .catch(() => {
        setError("Could not access camera. Check browser permissions.");
        setScanning(false);
      });

    return () => {
      reader.reset();
    };
  }, [navigate]);

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-lg font-bold text-white">Scan QR label</h1>
      <p className="text-sm text-slate-400">
        Point your camera at a Manifest QR label to open that item.
      </p>

      {scanning && (
        <video ref={videoRef} className="w-full rounded-xl border border-slate-800" />
      )}

      {error && (
        <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <button
        onClick={() => navigate(-1)}
        className="w-full rounded-lg border border-slate-700 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
      >
        Cancel
      </button>
    </div>
  );
}
