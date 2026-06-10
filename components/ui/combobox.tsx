"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const inputCls =
  "h-10 w-full rounded-md border border-line-2 bg-paper px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft";

// Editable combobox: type to filter the options, or type a value that isn't in
// the list (free entry). Options are shown in the order given (not re-sorted).
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  id,
  emptyHint,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  id?: string;
  emptyHint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function onDocPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointer);
    return () => document.removeEventListener("mousedown", onDocPointer);
  }, []);

  const q = value.trim().toLowerCase();
  const exact = options.some((o) => o.toLowerCase() === q);
  // Show all when empty or an exact match is selected (lets you re-browse);
  // otherwise narrow to substring matches.
  const filtered = q === "" || exact ? options : options.filter((o) => o.toLowerCase().includes(q));

  function commit(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(a + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            if (open && filtered[active]) {
              e.preventDefault();
              commit(filtered[active]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={inputCls}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Toggle options"
        onClick={() => setOpen((o) => !o)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 transition hover:text-ink-2"
      >
        <ChevronDown className="size-4" />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-line-2 bg-paper py-1 shadow-md"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-ink-3">
              {emptyHint ?? "No matches — press Enter to use what you typed."}
            </li>
          ) : (
            filtered.map((o, i) => (
              <li key={o}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(o);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                    i === active ? "bg-cream-2 text-primary" : "text-ink-2 hover:bg-cream-2"
                  }`}
                >
                  <span>{o}</span>
                  {o.toLowerCase() === q && <Check className="size-3.5 text-primary" />}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
