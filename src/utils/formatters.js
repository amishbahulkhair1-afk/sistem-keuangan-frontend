export const API_BASE = "/api";

export const formatRupiah = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(val || 0);

export const formatCompactRupiah = (val) => {
  const num = Number(val) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1000000000000) {
    return `${sign}Rp ${(abs / 1000000000000).toFixed(1).replace(".0", "")} T`;
  }
  if (abs >= 1000000000) {
    return `${sign}Rp ${(abs / 1000000000).toFixed(1).replace(".0", "")} M`;
  }
  if (abs >= 1000000) {
    return `${sign}Rp ${(abs / 1000000).toFixed(1).replace(".0", "")} jt`;
  }
  if (abs >= 1000) {
    return `${sign}Rp ${(abs / 1000).toFixed(0)} rb`;
  }
  return formatRupiah(num);
};

export const formatNumber = (val) =>
  new Intl.NumberFormat("id-ID").format(val || 0);

// Kamus Standar Singkatan Sistem Keuangan Latee
export const POS_ABBREVIATIONS = [
  { full: "Pembangunan", short: "Pemb." },
  { full: "Operasional", short: "Ops." },
  { full: "Rehabilitasi", short: "Rehab." },
  { full: "Pemeliharaan", short: "Pemel." },
  { full: "Pengembangan", short: "Pengemb." },
  { full: "Pendidikan", short: "Pend." },
  { full: "Pengadaan", short: "Pengad." },
  { full: "Perlengkapan", short: "Perleng." },
  { full: "Pemberdayaan", short: "Pemberd." },
  { full: "Bantuan", short: "Bant." },
  { full: "Konsolidasi", short: "Konsol." }
];

export const formatPosNameShort = (name) => {
  if (!name) return "";
  let shortened = String(name);
  POS_ABBREVIATIONS.forEach(({ full, short }) => {
    const regex = new RegExp(`\\b${full}\\b`, "gi");
    shortened = shortened.replace(regex, short);
  });
  return shortened;
};

// Kompresi Gambar Cepat Client-Side untuk Kamera HP (Mencegah Crash Memori & Upload Cepat)
export function compressImage(file, maxDimension = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name || "foto_bukti.jpg", {
                  type: "image/jpeg",
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        } catch (err) {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}


