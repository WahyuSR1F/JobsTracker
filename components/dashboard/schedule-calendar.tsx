'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/applications/status-badge';
import type { ApplicationStatus } from '@/lib/applications/status';
import { cn } from '@/lib/utils';

export type ScheduleItem = {
  id: string;
  position: string;
  company: string;
  /** Tanggal dalam format YYYY-MM-DD (zona Asia/Jakarta). */
  date: string;
  status: ApplicationStatus;
};

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const WEEKDAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function dayKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function todayKey(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function parseDayKey(key: string): { year: number; monthIndex: number; day: number } {
  const [year, month, day] = key.split('-').map(Number);
  return { year, monthIndex: month - 1, day };
}

function formatLongDate(key: string): string {
  const { year, monthIndex, day } = parseDayKey(key);
  const weekday = WEEKDAY_NAMES[(new Date(Date.UTC(year, monthIndex, day)).getUTCDay() + 6) % 7];
  return `${weekday}, ${day} ${MONTHS[monthIndex]} ${year}`;
}

export function ScheduleCalendar({ items }: { items: ScheduleItem[] }) {
  const today = useMemo(todayKey, []);
  const todayParts = parseDayKey(today);
  const [view, setView] = useState({ year: todayParts.year, monthIndex: todayParts.monthIndex });
  const [selected, setSelected] = useState(today);

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const item of items) {
      const list = map.get(item.date);
      if (list) list.push(item);
      else map.set(item.date, [item]);
    }
    return map;
  }, [items]);

  const cells = useMemo(() => {
    const firstWeekday = (new Date(Date.UTC(view.year, view.monthIndex, 1)).getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(view.year, view.monthIndex + 1, 0)).getUTCDate();
    const grid: (string | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) grid.push(dayKey(view.year, view.monthIndex, day));
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [view]);

  const selectedItems = byDate.get(selected) ?? [];

  function moveMonth(step: number) {
    setView((current) => {
      const next = new Date(Date.UTC(current.year, current.monthIndex + step, 1));
      return { year: next.getUTCFullYear(), monthIndex: next.getUTCMonth() };
    });
  }

  function goToToday() {
    setView({ year: todayParts.year, monthIndex: todayParts.monthIndex });
    setSelected(today);
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <CalendarDays className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-stone-900">Kalender</h2>
            <p className="truncate text-xs text-stone-500">Jadwal lamaran dalam sebulan</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={goToToday}
            className="mr-1 hidden h-8 rounded-lg px-2.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 sm:block"
          >
            Hari ini
          </button>
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            aria-label="Bulan sebelumnya"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            aria-label="Bulan berikutnya"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-stone-900" aria-live="polite">
        {MONTHS[view.monthIndex]} {view.year}
      </p>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
            {day}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((key, index) => {
          if (!key) return <span key={`empty-${index}`} aria-hidden />;
          const dayNumber = parseDayKey(key).day;
          const isSelected = key === selected;
          const isToday = key === today;
          const hasItems = byDate.has(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-pressed={isSelected}
              aria-label={`${formatLongDate(key)}${hasItems ? ', ada jadwal' : ''}`}
              className={cn(
                'relative flex h-9 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                isSelected
                  ? 'bg-teal-700 text-white shadow-sm'
                  : hasItems
                    ? 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                    : 'text-stone-600 hover:bg-stone-100',
                !isSelected && isToday && 'ring-1 ring-inset ring-teal-400',
              )}
            >
              {dayNumber}
              {hasItems && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1 w-1 rounded-full',
                    isSelected ? 'bg-white/80' : 'bg-teal-500',
                  )}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t border-stone-100 pt-4">
        <p className="text-sm font-semibold text-stone-900">Jadwal {formatLongDate(selected)}</p>

        {selectedItems.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            Tidak ada jadwal di tanggal ini. Tanggal bertanda punya lamaran yang perlu kamu cek.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {selectedItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/applications/${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3 transition-colors hover:border-stone-300 hover:bg-stone-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-stone-900">{item.position}</span>
                    <span className="mt-0.5 block truncate text-xs text-stone-500">{item.company}</span>
                  </span>
                  <StatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
