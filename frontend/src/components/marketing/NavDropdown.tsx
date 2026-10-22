import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export interface DropdownItem {
  label: string;
  href: string;
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Click-to-open (not hover-only) so it works the same with touch and keyboard
// as it does with a mouse - matches the pattern already used by AvatarMenu.
export function NavDropdown({ label, items }: { label: string; items: DropdownItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  return (
    <div
      ref={ref}
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) close();
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex items-center gap-1 text-sm font-medium text-muted hover:text-ink"
      >
        {label}
        <ChevronIcon />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-lg border border-line bg-white py-2 shadow-sm">
          {items.map((item) =>
            // A hash link like "/#product" must be a plain <a> - Link navigates
            // client-side to "/" but won't jump to the fragment, while a full
            // navigation lets the browser's native hash scroll do it.
            item.href.includes('#') ? (
              <a
                key={item.href}
                href={item.href}
                onClick={close}
                className="block px-4 py-2 text-sm text-ink hover:bg-brand-blue-light"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                onClick={close}
                className="block px-4 py-2 text-sm text-ink hover:bg-brand-blue-light"
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
