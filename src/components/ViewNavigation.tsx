"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  LineChart,
  ListChecks,
  Menu,
  Shield,
  TableProperties,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";

export type AppView =
  | "ladder"
  | "forAgainst"
  | "scores"
  | "next5"
  | "runHome"
  | "monteCarlo"
  | "elo"
  | "team";

const NAV_ITEMS: Array<{
  view: AppView;
  label: string;
  Icon: typeof TableProperties;
}> = [
  { view: "ladder", label: "Ladder", Icon: TableProperties },
  { view: "forAgainst", label: "For/Against", Icon: Shield },
  { view: "scores", label: "Scores", Icon: ListChecks },
  { view: "next5", label: "Next 5", Icon: CalendarDays },
  { view: "runHome", label: "Run Home", Icon: Trophy },
  { view: "monteCarlo", label: "Ladder Sim", Icon: BarChart3 },
  { view: "elo", label: "Elo Graph", Icon: LineChart },
  { view: "team", label: "Team", Icon: Users },
];

function NavButton({
  item,
  active,
  onSelect,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onSelect: () => void;
}) {
  const { palette } = useTheme();
  const { Icon } = item;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition hover:bg-white/10"
      style={{
        background: active ? palette.accent : "transparent",
        color: active ? "#000" : palette.text,
      }}
    >
      <Icon size={16} strokeWidth={2.2} />
      <span>{item.label}</span>
    </button>
  );
}

export function ViewNavigation({
  view,
  onViewChange,
}: {
  view: AppView;
  onViewChange: (view: AppView) => void;
}) {
  const { palette } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectView = (nextView: AppView) => {
    onViewChange(nextView);
    setMobileOpen(false);
  };

  const nav = (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.view}
          item={item}
          active={view === item.view}
          onSelect={() => selectView(item.view)}
        />
      ))}
    </nav>
  );

  return (
    <aside className="sticky top-[85px] z-30 self-start md:top-24">
      <div
        className="-mx-4 mb-4 border-b px-4 pb-3 pt-2 shadow-lg md:hidden"
        style={{
          background: palette.bg,
          borderColor: palette.border,
        }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: palette.border,
            color: palette.text,
          }}
        >
          <span className="flex items-center gap-2">
            <Menu size={18} />
            Menu
          </span>
          <Activity size={16} style={{ color: palette.accent }} />
        </button>

        {mobileOpen && (
          <div
            className="mt-3 rounded-lg border p-2"
            style={{ borderColor: palette.border, background: "rgba(255,255,255,0.04)" }}
          >
            {nav}
          </div>
        )}
      </div>

      <div
        className="hidden rounded-lg border p-2 md:block"
        style={{ borderColor: palette.border, background: "rgba(255,255,255,0.04)" }}
      >
        {nav}
      </div>
    </aside>
  );
}
