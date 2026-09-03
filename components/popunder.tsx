'use client';

import { useEffect } from 'react';

interface PopunderProps {
  /**
   * URL tujuan yang ingin dibuka saat user pertama kali mengklik area web.
   */
  targetUrl?: string;
  /**
   * Cooldown dalam jam sebelum popunder bisa dipicu lagi untuk user yang sama (default: 1 jam).
   */
  cooldownHours?: number;
}

export default function Popunder({
  targetUrl = 'https://www.google.com/',
  cooldownHours = 1,
}: PopunderProps) {
  useEffect(() => {
    const STORAGE_KEY = 'last_popunder_time';

    const handleClick = () => {
      // Cek apakah popunder sudah pernah dipicu dalam rentang waktu cooldown
      const lastPopTime = localStorage.getItem(STORAGE_KEY);
      const currentTime = new Date().getTime();
      const cooldownMs = cooldownHours * 60 * 60 * 1000;

      if (lastPopTime && currentTime - parseInt(lastPopTime, 10) < cooldownMs) {
        return; // Masih dalam masa cooldown, batalkan popunder
      }

      // Buka URL tujuan di tab baru
      const popWindow = window.open(targetUrl, '_blank');

      if (popWindow) {
        // Fokuskan kembali tab utama agar jendela baru menjadi popunder (berada di belakang)
        popWindow.blur();
        window.focus();

        // Simpan timestamp kapan popunder terakhir dipicu
        localStorage.setItem(STORAGE_KEY, currentTime.toString());

        // Hapus event listener agar tidak terdeteksi klik terus-menerus dalam sesi ini
        window.removeEventListener('click', handleClick);
      }
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [targetUrl, cooldownHours]);

  return null; // Komponen ini tidak merender elemen visual
}
