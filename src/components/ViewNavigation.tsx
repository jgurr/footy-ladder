"use client";

import {
  Activity,
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

export type AppView = "ladder" | "forAgainst" | "scores" | "next5" | "runHome" | "elo" | "team";

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
    <aside className="md:sticky md:top-24 md:self-start">
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        className="mb-3 flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold md:hidden"
        style={{ borderColor: palette.border, color: palette.text }}
      >
        <span className="flex items-center gap-2">
          <Menu size={18} />
          Menu
        </span>
        <Activity size={16} style={{ color: palette.accent }} />
      </button>

      <div
        className={`${mobileOpen ? "block" : "hidden"} mb-4 rounded-lg border p-2 md:mb-0 md:block`}
        style={{ borderColor: palette.border, background: "rgba(255,255,255,0.04)" }}
      >
        {nav}
      </div>
    </aside>
  );
}
