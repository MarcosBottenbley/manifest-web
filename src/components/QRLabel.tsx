import { itemsApi } from "../api";

interface Props {
  itemId: string;
  itemName: string;
}

export default function QRLabel({ itemId, itemName }: Props) {
  function handlePrint() {
    const win = window.open("", "_blank", "width=400,height=400");
    if (!win) return;
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>QR Label — ${itemName}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center;
                   justify-content: center; min-height: 100vh; margin: 0;
                   font-family: sans-serif; background: white; color: black; }
            img { width: 200px; height: 200px; }
            p { margin: 8px 0 0; font-size: 14px; text-align: center; max-width: 200px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <img src="${itemsApi.qrUrl(itemId)}" />
          <p>${itemName}</p>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={itemsApi.qrUrl(itemId)}
        alt="QR code"
        className="h-20 w-20 rounded border border-slate-700 bg-white p-1"
      />
      <button
        onClick={handlePrint}
        className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:border-slate-600 hover:text-white"
      >
        Print label
      </button>
    </div>
  );
}
