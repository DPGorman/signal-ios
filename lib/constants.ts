// Signal Design System
// Inspired by Waking Up: dark canvas, art-forward, content-as-hero

export const C = {
  bg: "#0D0D0F",
  surface: "#1A1A1E",
  surfaceHigh: "#232328",
  border: "#2A2A30",
  borderSubtle: "#222228",

  textPrimary: "#F0F0F2",
  textSecondary: "#B8B8C0",
  textMuted: "#6E6E78",
  textDisabled: "#3A3A42",

  gold: "#E8C547",
  green: "#6DD58C",
  red: "#FF8A80",
  blue: "#7ABCFF",
  purple: "#CF9FFF",
} as const;

export const CATEGORIES = [
  { id: "premise", label: "Premise", icon: "◈", color: "#E8C547" },
  { id: "character", label: "Character", icon: "◉", color: "#FFB27A" },
  { id: "scene", label: "Scene", icon: "◫", color: "#7ABCFF" },
  { id: "dialogue", label: "Dialogue", icon: "◌", color: "#CF9FFF" },
  { id: "arc", label: "Story Arc", icon: "◎", color: "#6DD58C" },
  { id: "production", label: "Production", icon: "◧", color: "#FF8A80" },
  { id: "research", label: "Research", icon: "◐", color: "#A8D8A8" },
  { id: "business", label: "Business", icon: "◑", color: "#FF8FB1" },
] as const;

export const getCat = (id: string) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

export const DAILY_INVITATIONS = [
  "What are you afraid to write? That's probably the most important scene.",
  "Which character are you avoiding? Go there.",
  "What does your protagonist want that they can't admit?",
  "Name one thing that happens in this story that only this story could contain.",
  "What's the scene you keep circling without writing?",
  "If this series had a moral argument, what would it be?",
  "What would the antagonist say if they were the hero?",
  "Which idea from this week is still alive in you right now?",
];

export const API_BASE = "https://signal-navy-five.vercel.app";
