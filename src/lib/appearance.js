import {
  Bird,
  Bolt,
  Cat,
  Disc3,
  Dog,
  Drum,
  Fish,
  Guitar,
  Headphones,
  MicVocal,
  MoonStar,
  Music2,
  Piano,
  Rabbit,
  Turtle,
  Waves,
} from "lucide-react";

const APPEARANCE_STORAGE_KEY = "deepstream_user_appearance";
const APPEARANCE_EVENT = "deepstream:appearance-change";

const themeOptions = [
  {
    id: "ocean",
    label: "オーシャン",
    preview: "#0891b2",
    values: {
      primary: "193 91% 40%",
      accent: "193 70% 92%",
      ring: "193 91% 40%",
      themeGlow: "8, 145, 178",
    },
  },
  {
    id: "forest",
    label: "フォレスト",
    preview: "#15803d",
    values: {
      primary: "142 76% 36%",
      accent: "142 45% 91%",
      ring: "142 76% 36%",
      themeGlow: "21, 128, 61",
    },
  },
  {
    id: "sunset",
    label: "サンセット",
    preview: "#ea580c",
    values: {
      primary: "24 95% 46%",
      accent: "24 100% 93%",
      ring: "24 95% 46%",
      themeGlow: "234, 88, 12",
    },
  },
  {
    id: "berry",
    label: "ベリー",
    preview: "#be185d",
    values: {
      primary: "335 78% 42%",
      accent: "330 70% 94%",
      ring: "335 78% 42%",
      themeGlow: "190, 24, 93",
    },
  },
];

const textSizeOptions = [
  { id: "large", label: "大", value: "24px" },
  { id: "standard", label: "標準", value: "22px" },
  { id: "small", label: "小", value: "20px" },
];

const iconOptions = [
  { id: "music", label: "音符", icon: Music2 },
  { id: "guitar", label: "ギター", icon: Guitar },
  { id: "drum", label: "ドラム", icon: Drum },
  { id: "piano", label: "ピアノ", icon: Piano },
  { id: "mic", label: "マイク", icon: MicVocal },
  { id: "headphones", label: "ヘッドホン", icon: Headphones },
  { id: "wave", label: "波", icon: Waves },
  { id: "disc", label: "ディスク", icon: Disc3 },
  { id: "bolt", label: "スパーク", icon: Bolt },
  { id: "moon", label: "ムーン", icon: MoonStar },
  { id: "dog", label: "いぬ", icon: Dog },
  { id: "cat", label: "ねこ", icon: Cat },
  { id: "turtle", label: "かめ", icon: Turtle },
  { id: "rabbit", label: "うさぎ", icon: Rabbit },
  { id: "bird", label: "とり", icon: Bird },
  { id: "fish", label: "さかな", icon: Fish },
];

const iconColorOptions = [
  { id: "teal", label: "青緑", value: "#0f766e" },
  { id: "blue", label: "青", value: "#1d4ed8" },
  { id: "violet", label: "紫", value: "#7c3aed" },
  { id: "rose", label: "ローズ", value: "#e11d48" },
  { id: "amber", label: "アンバー", value: "#d97706" },
  { id: "slate", label: "スレート", value: "#334155" },
];

const defaultAppearance = {
  themeId: "ocean",
  profileIcon: "music",
  profileIconColor: "teal",
  textSizeId: "small",
};

function getThemeOption(themeId) {
  return themeOptions.find((option) => option.id === themeId) || themeOptions[0];
}

function getIconOption(iconId) {
  return iconOptions.find((option) => option.id === iconId) || iconOptions[0];
}

function getIconColorOption(colorId) {
  return iconColorOptions.find((option) => option.id === colorId) || iconColorOptions[0];
}

function getTextSizeOption(textSizeId) {
  return textSizeOptions.find((option) => option.id === textSizeId) || textSizeOptions[2];
}

function sanitizeAppearance(rawAppearance = {}) {
  const themeId = rawAppearance.themeId || rawAppearance.ThemeId;
  const profileIcon = rawAppearance.profileIcon || rawAppearance.ProfileIcon;
  const profileIconColor = rawAppearance.profileIconColor || rawAppearance.ProfileIconColor;
  const textSizeId = rawAppearance.textSizeId || rawAppearance.TextSizeId;

  return {
    themeId: getThemeOption(themeId).id,
    profileIcon: getIconOption(profileIcon).id,
    profileIconColor: getIconColorOption(profileIconColor).id,
    textSizeId: getTextSizeOption(textSizeId).id,
  };
}

function serializeAppearanceForFirestore(appearance) {
  const nextAppearance = sanitizeAppearance(appearance);

  return {
    ThemeId: nextAppearance.themeId,
    ProfileIcon: nextAppearance.profileIcon,
    ProfileIconColor: nextAppearance.profileIconColor,
    TextSizeId: nextAppearance.textSizeId,
  };
}

function readStoredAppearance() {
  if (typeof window === "undefined") {
    return defaultAppearance;
  }

  try {
    const storedValue = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!storedValue) {
      return defaultAppearance;
    }

    return sanitizeAppearance(JSON.parse(storedValue));
  } catch (error) {
    return defaultAppearance;
  }
}

function writeStoredAppearance(appearance) {
  if (typeof window === "undefined") {
    return;
  }

  const nextAppearance = sanitizeAppearance(appearance);
  window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(nextAppearance));
}

function applyAppearanceToDocument(appearance) {
  if (typeof document === "undefined") {
    return;
  }

  const nextAppearance = sanitizeAppearance(appearance);
  const theme = getThemeOption(nextAppearance.themeId);
  const textSize = getTextSizeOption(nextAppearance.textSizeId);
  const root = document.documentElement;

  root.style.setProperty("--primary", theme.values.primary);
  root.style.setProperty("--accent", theme.values.accent);
  root.style.setProperty("--ring", theme.values.ring);
  root.style.setProperty("--theme-glow", theme.values.themeGlow);
  root.style.setProperty("--app-font-size", textSize.value);
}

function dispatchAppearanceChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(APPEARANCE_EVENT));
}

export {
  APPEARANCE_EVENT,
  defaultAppearance,
  themeOptions,
  textSizeOptions,
  iconOptions,
  iconColorOptions,
  getThemeOption,
  getTextSizeOption,
  getIconOption,
  getIconColorOption,
  sanitizeAppearance,
  serializeAppearanceForFirestore,
  readStoredAppearance,
  writeStoredAppearance,
  applyAppearanceToDocument,
  dispatchAppearanceChange,
};
