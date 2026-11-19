import React from "react";
import IslamicCanvas from "./IslamicCanvas";
import IslamicLandscapeCanvas from "./IslamicLandscapeCanvas";
import IslamicDesertCanvas from "./IslamicDesertCanvas";
import LivingSkyWaveCanvas from "./LivingSkyWaveCanvas";
import GeometricCanvas from "./GeometricCanvas";
import MotionDotsCanvas from "./MotionDotsCanvas";

export const BG_THEME_OPTIONS = [
  {
    id: "islamic_desert",
    label: "Gurun Pasir & Kafilah Unta Islami",
    desc: "Bukit Pasir Emas, Masjid Oase, Pohon Kurma, Kafilah Unta & Badai Pasir Berkala",
    icon: "desert",
    tag: "Eksotis"
  },
  {
    id: "islamic_landscape",
    label: "Lanskap Alam & Perbukitan Islami",
    desc: "Matahari Terbit, Awan Mengambang, Perbukitan Hijau & Siluet Kubah Masjid",
    icon: "landscape",
    tag: "Terbaru"
  },
  {
    id: "islamic",
    label: "Nuansa Islami (Pesantren Latee)",
    desc: "Arsitektur Khas Pesantren Latee (Atap Tumpang, Genteng Oranye, Lisplang Biru & Roster Putih)",
    icon: "mosque",
    tag: "Favorit"
  },
  {
    id: "wave",
    label: "Living Sky & Ocean Wave",
    desc: "Gelombang Dinamis, Langit Bergerak, Awan Mengambang & Cuaca",
    icon: "wave",
    tag: "Populer"
  },
  {
    id: "geometric",
    label: "Modern Geometris 3D",
    desc: "Kubus Isometrik, Poligon & Berlian Kristal Mengambang",
    icon: "cube"
  },
  {
    id: "constellation",
    label: "Rasi Bintang & Starlight",
    desc: "Titik Partikel Cahaya Bintang & Jaringan Konstelasi Lembut",
    icon: "sparkles"
  }
];

export function getSavedBgTheme() {
  return localStorage.getItem("app_bg_theme") || "islamic_desert";
}

export function saveBgTheme(themeId) {
  localStorage.setItem("app_bg_theme", themeId);
}

export default function DynamicBackgroundCanvas({ bgTheme = "islamic_desert", theme = "light" }) {
  switch (bgTheme) {
    case "islamic_desert":
      return <IslamicDesertCanvas theme={theme} />;
    case "islamic_landscape":
      return <IslamicLandscapeCanvas theme={theme} />;
    case "islamic":
      return <IslamicCanvas theme={theme} />;
    case "wave":
      return <LivingSkyWaveCanvas theme={theme} />;
    case "geometric":
      return <GeometricCanvas count={22} theme={theme} />;
    case "constellation":
      return <MotionDotsCanvas count={42} theme={theme} />;
    default:
      return <IslamicDesertCanvas theme={theme} />;
  }
}
