"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const READER_ID = "imei-barcode-reader";

export function ImeiScanner({
  open,
  onOpenChange,
  onScan,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onScan: (imei: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any;
    setError(null);

    (async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
        if (cancelled) return;
        scanner = new Html5Qrcode(READER_ID, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
          ],
          verbose: false,
        });
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 280, height: 130 } },
          (text: string) => {
            const digits = text.replace(/\D/g, "");
            if (/^\d{15}$/.test(digits)) {
              onScan(digits);
              onOpenChange(false);
            }
          },
          () => {},
        );
      } catch {
        if (!cancelled) {
          setError("Couldn't access the camera. Check permissions, or enter the IMEI manually.");
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        scanner?.stop?.().then(() => scanner?.clear?.()).catch(() => {});
      } catch {
        /* ignore */
      }
    };
  }, [open, onScan, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan IMEI barcode</DialogTitle>
          <DialogDescription>
            Point the rear camera at the Code 128/39 barcode on the device or its box.
          </DialogDescription>
        </DialogHeader>
        <div id={READER_ID} className="overflow-hidden rounded-md bg-ink" style={{ minHeight: 240 }} />
        {error && <p className="text-sm text-danger">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
