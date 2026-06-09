export function Logo({ showTagline = true }: { showTagline?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-primary">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"
            stroke="#F4F8F4"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M12 7v10M7.5 9.2 12 12l4.5-2.8"
            stroke="#F4F8F4"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[17px] font-extrabold tracking-tight text-ink">
          Evolve <span className="text-primary">Wholesale</span>
        </span>
        {showTagline && (
          <span className="mono mt-[3px] text-[9.5px] tracking-[0.14em] text-ink-3">
            USED PHONES · B2B SUPPLY
          </span>
        )}
      </div>
    </div>
  );
}
