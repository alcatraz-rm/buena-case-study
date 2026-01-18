'use client';

import { useRouter } from 'next/navigation';

export type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrent?: boolean;
};

type Props = {
  items: BreadcrumbItem[];
  confirmNavigate?: () => boolean;
};

export function Breadcrumbs({ items, confirmNavigate }: Props) {
  const router = useRouter();

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isCurrent = item.isCurrent ?? isLast;

        return (
          <div key={`${item.href}-${idx}`} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isCurrent) return;
                if (confirmNavigate && !confirmNavigate()) return;
                router.push(item.href);
              }}
              className={[
                'max-w-[18rem] truncate rounded-md px-2 py-1 text-sm',
                isCurrent
                  ? 'cursor-default bg-zinc-900 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
              ].join(' ')}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {item.label}
            </button>

            {!isLast && <span className="text-zinc-600">/</span>}
          </div>
        );
      })}
    </nav>
  );
}

