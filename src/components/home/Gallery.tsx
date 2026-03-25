import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { getApiUrl } from '../../lib/api';

interface Transformation {
    id: number;
    label: string | null;
    before_image_url: string;
    after_image_url: string;
}

interface GalleryImage {
    id: number;
    image_url: string;
    label: string | null;
}

// Static fallback images — AI-generated cleaning photos
const FALLBACK_IMAGES = [
    "/gallery-1.png",
    "/gallery-2.png",
    "/gallery-3.png",
    "/gallery-4.png",
    "/gallery-5.png",
    "/gallery-6.png",
];

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [transformations, setTransformations] = useState<Transformation[]>([]);
    const [loadedImages, setLoadedImages] = useState<string[]>([]);

    useEffect(() => {
        // Fetch individual gallery photos AND transformations in parallel
        Promise.all([
            fetch(getApiUrl('/api/gallery-images')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/transformations')).then(r => r.json()).catch(() => []),
        ]).then(([photos, txs]: [GalleryImage[], Transformation[]]) => {
            // Prefer admin-uploaded gallery photos; fallback to static Unsplash
            if (Array.isArray(photos) && photos.length > 0) {
                setLoadedImages(photos.map((p: { image_url: string }) => p.image_url).slice(0, 6));
            } else if (Array.isArray(txs) && txs.length > 0) {
                // Use after images from transformations as the grid photos
                const imgs = txs.flatMap((t: { after_image_url: string; before_image_url: string }) => [t.after_image_url, t.before_image_url]);
                setLoadedImages(imgs.slice(0, 6));
            } else {
                setLoadedImages(FALLBACK_IMAGES);
            }
            if (Array.isArray(txs) && txs.length > 0) setTransformations(txs);
        });
    }, []);

    // Use first transformation for the interactive slider if available
    const sliderBefore = transformations[0]?.before_image_url ??
        "/branded-clean-before.png";
    const sliderAfter = transformations[0]?.after_image_url ??
        "/branded-clean-after.png";

    const images = loadedImages.length > 0 ? loadedImages : FALLBACK_IMAGES;

    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-6xl mb-6">Cleaning Transformations</h2>
                    <p className="text-xl text-ink-muted">See the Broom & Box difference in action through our before and after gallery.</p>
                </div>

                {/* Interactive Slider */}
                <div className="mb-24">
                    <BeforeAfterSlider beforeImage={sliderBefore} afterImage={sliderAfter} />
                </div>

                <div className="text-center mb-10">
                    <h3 className="text-2xl font-bold text-ink">More Results</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((img, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="relative aspect-square rounded-3xl overflow-hidden cursor-pointer group shadow-lg"
                            onClick={() => setSelectedImage(img)}
                        >
                            <img
                                src={img}
                                alt="Cleaning Transformation"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl">
                                    <Maximize2 className="text-primary w-6 h-6" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-6"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button className="absolute top-10 right-10 text-white p-2 hover:bg-white/10 rounded-full">
                            <X className="w-8 h-8" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            src={selectedImage}
                            className="max-w-full max-h-full rounded-2xl shadow-2xl"
                            referrerPolicy="no-referrer"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Gallery;
