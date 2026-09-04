"use client";

import { useState, useEffect } from "react";

interface PlayerWrapperProps {
    src: string;
    cooldownHours?: number;
}

export default function PlayerWrapper({ src, cooldownHours = 0.5 }: PlayerWrapperProps) {
    const [showOverlay, setShowOverlay] = useState(true);

    useEffect(() => {
        // Cek apakah popunder masih dalam jeda cooldown
        const lastClick = localStorage.getItem("popunder_last_click");
        if (lastClick) {
            const cooldownMs = cooldownHours * 60 * 60 * 1000;
            if (Date.now() - parseInt(lastClick, 10) < cooldownMs) {
                setShowOverlay(false);
            }
        }
    }, [cooldownHours]);

    const handleOverlayClick = () => {
        // Jalankan iklan popunder
        window.open("https://www.google.com/", "_blank");

        // Simpan timestamp cooldown
        localStorage.setItem("popunder_last_click", Date.now().toString());

        // Sembunyikan lapisan transparan agar klik kedua langsung mengenai tombol play iframe
        setShowOverlay(false);
    };

    return (
        <div className="relative w-full h-[30vh] md:h-[55vh] lg:h-[70vh] bg-black rounded-lg overflow-hidden">
            {/* Lapisan transparan penghadang klik pertama */}
            {showOverlay && (
                <div
                    onClick={handleOverlayClick}
                    className="absolute inset-0 z-50 cursor-pointer bg-transparent"
                />
            )}

            {/* Embed Video Doodstream */}
            <iframe
                className="w-full h-full border-0"
                src={src}
                scrolling="no"
                allowFullScreen={true}
            />
        </div>
    );
}
