import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ImagePlus,
    Trash2,
    Upload,
    CheckCircle,
    AlertCircle,
    X,
    Images,
    ArrowLeftRight,
    Loader2
} from 'lucide-react';

type Tab = 'photos' | 'beforeafter';

interface GalleryImage {
    id: number | string;
    image_url: string;
    label: string | null;
    created_at: string;
}

interface Transformation {
    id: number | string;
    label: string | null;
    before_image_url: string;
    after_image_url: string;
    created_at: string;
}

const Transformations = () => {
    const [tab, setTab] = useState<Tab>('photos');
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [transformations, setTransformations] = useState<Transformation[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(true);
    const [loadingBA, setLoadingBA] = useState(true);

    // Upload state — Gallery Photos
    const [uploading, setUploading] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoLabel, setPhotoLabel] = useState('');
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Upload state — Before & After
    const [baUploading, setBaUploading] = useState(false);
    const [beforeFile, setBeforeFile] = useState<File | null>(null);
    const [afterFile, setAfterFile] = useState<File | null>(null);
    const [beforePreview, setBeforePreview] = useState<string | null>(null);
    const [afterPreview, setAfterPreview] = useState<string | null>(null);
    const [baLabel, setBaLabel] = useState('');
    const beforeInputRef = useRef<HTMLInputElement>(null);
    const afterInputRef = useRef<HTMLInputElement>(null);

    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [deletingIds, setDeletingIds] = useState<Set<number | string>>(new Set());

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchGallery = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const r = await fetch('/api/gallery-images', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await r.json();
            setGalleryImages(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch gallery:', e);
            setGalleryImages([]);
        } finally {
            setLoadingPhotos(false);
        }
    };

    const fetchTransformations = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const r = await fetch('/api/transformations', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await r.json();
            setTransformations(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch transformations:', e);
            setTransformations([]);
        } finally {
            setLoadingBA(false);
        }
    };

    useEffect(() => {
        fetchGallery();
        fetchTransformations();
    }, []);

    // ── Gallery Photo handlers ──────────────────────────────────────
    const handlePhotoSelect = (file: File) => {
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handlePhotoUpload = async () => {
        if (!photoFile) { showToast('error', 'Please select a photo'); return; }
        setUploading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const form = new FormData();
            form.append('image', photoFile);
            if (photoLabel.trim()) form.append('label', photoLabel.trim());
            const res = await fetch('/api/gallery-images', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: form
            });
            if (!res.ok) throw new Error((await res.json()).error);
            showToast('success', 'Photo added to gallery!');
            setPhotoFile(null);
            setPhotoPreview(null);
            setPhotoLabel('');
            await fetchGallery();
        } catch (e: any) {
            showToast('error', e.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handlePhotoDelete = async (id: number | string) => {
        if (!confirm('Remove this photo from the gallery?')) return;
        setDeletingIds(prev => new Set(prev).add(id));
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/gallery-images/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await res.json();
            if (res.ok) {
                setGalleryImages(prev => prev.filter(i => i.id !== id));
                showToast('success', 'Photo removed');
            } else {
                throw new Error(data.error || 'Delete failed');
            }
        } catch (e: any) {
            showToast('error', e.message || 'Failed to delete photo');
        } finally {
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleBAUpload = async () => {
        if (!beforeFile || !afterFile) { showToast('error', 'Select both before and after images'); return; }
        setBaUploading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const form = new FormData();
            form.append('before', beforeFile);
            form.append('after', afterFile);
            if (baLabel.trim()) form.append('label', baLabel.trim());
            const res = await fetch('/api/transformations', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: form
            });
            if (!res.ok) throw new Error((await res.json()).error);
            showToast('success', 'Transformation uploaded!');
            setBeforeFile(null);
            setAfterFile(null);
            setBeforePreview(null);
            setAfterPreview(null);
            setBaLabel('');
            await fetchTransformations();
        } catch (e: any) {
            showToast('error', e.message || 'Upload failed');
        } finally {
            setBaUploading(false);
        }
    };

    const handleBADelete = async (id: number | string) => {
        if (!confirm('Delete this transformation?')) return;
        setDeletingIds(prev => new Set(prev).add(id));
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/transformations/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await res.json();
            if (res.ok) {
                setTransformations(prev => prev.filter(t => t.id !== id));
                showToast('success', 'Deleted');
            } else {
                throw new Error(data.error || 'Delete failed');
            }
        } catch (e: any) {
            showToast('error', e.message || 'Failed to delete transformation');
        } finally {
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    // ── Shared DropZone ──────────────────────────────────────────────
    const DropZone = ({ label, preview, inputRef, onSelect, accent = false }: {
        label: string; preview: string | null; inputRef: React.RefObject<HTMLInputElement | null>;
        onSelect: (f: File) => void; accent?: boolean;
    }) => (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) onSelect(f); }}
            className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all h-52 flex flex-col items-center justify-center gap-3 group
        ${preview ? 'border-emerald-400' : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40'}`}
        >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) onSelect(f); }} />
            {preview ? (
                <>
                    <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">Click to change</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-white/90 text-slate-800 text-xs font-bold px-2 py-1 rounded-full">{label}</div>
                </>
            ) : (
                <>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                        <ImagePlus className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-slate-700">{label}</p>
                        <p className="text-xs text-slate-400 mt-1">Click or drag & drop</p>
                    </div>
                </>
            )}
        </div>
    );

    const safeGallery = Array.isArray(galleryImages) ? galleryImages : [];
    const safeBA = Array.isArray(transformations) ? transformations : [];

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white font-medium
              ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {toast.message}
                        <button onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900">Homepage Gallery</h1>
                <p className="text-slate-500 mt-1">Manage all photos shown in the Cleaning Transformations section.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                <button onClick={() => setTab('photos')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${tab === 'photos' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Images className="w-4 h-4" /> Gallery Photos ({safeGallery.length})
                </button>
                <button onClick={() => setTab('beforeafter')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${tab === 'beforeafter' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                    <ArrowLeftRight className="w-4 h-4" /> Before & After ({safeBA.length})
                </button>
            </div>

            {/* ── TAB: Gallery Photos ── */}
            {tab === 'photos' && (
                <div className="space-y-6">
                    {/* Upload */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-emerald-500" /> Add Photo
                        </h2>
                        <div className="max-w-sm">
                            <DropZone label="Gallery Photo" preview={photoPreview} inputRef={photoInputRef} onSelect={handlePhotoSelect} accent />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <input type="text" value={photoLabel} onChange={e => setPhotoLabel(e.target.value)}
                                placeholder="Optional label"
                                className="flex-1 max-w-sm px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                            <button onClick={handlePhotoUpload} disabled={uploading || !photoFile}
                                className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 justify-center">
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {uploading ? 'Adding...' : 'Add Photo'}
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Images className="w-5 h-5 text-emerald-500" /> Current Photos
                            <span className="text-sm font-normal text-slate-500 ml-1 lg:inline hidden">— shown in the 6-photo grid on the homepage</span>
                        </h2>
                        {loadingPhotos ? (
                            <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
                        ) : safeGallery.length === 0 ? (
                            <div className="text-center py-14 text-slate-400">
                                <Images className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No photos uploaded yet</p>
                                <p className="text-sm mt-1">Fallback images are shown on the homepage until you add photos here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {safeGallery.map(img => (
                                    <motion.div key={img.id} layout className="relative group rounded-2xl overflow-hidden aspect-square shadow-sm border border-slate-100">
                                        <img src={img.image_url} alt={img.label || 'Gallery'} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            {img.label && <p className="text-white text-xs font-semibold px-2 text-center">{img.label}</p>}
                                            <button onClick={() => handlePhotoDelete(img.id)}
                                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB: Before & After ── */}
            {tab === 'beforeafter' && (
                <div className="space-y-6">
                    {/* Upload */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-emerald-500" /> Add Before & After Pair
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <DropZone label="Before" preview={beforePreview} inputRef={beforeInputRef}
                                onSelect={f => { setBeforeFile(f); setBeforePreview(URL.createObjectURL(f)); }} />
                            <DropZone label="After" preview={afterPreview} inputRef={afterInputRef}
                                onSelect={f => { setAfterFile(f); setAfterPreview(URL.createObjectURL(f)); }} accent />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input type="text" value={baLabel} onChange={e => setBaLabel(e.target.value)}
                                placeholder="Optional label (e.g. Kitchen Deep Clean)"
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                            <button onClick={handleBAUpload} disabled={baUploading || !beforeFile || !afterFile}
                                className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 justify-center">
                                {baUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {baUploading ? 'Uploading...' : 'Upload Pair'}
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ArrowLeftRight className="w-5 h-5 text-emerald-500" /> Published Pairs
                            <span className="text-sm font-normal text-slate-500 ml-1 lg:inline hidden">— first pair powers the interactive slider</span>
                        </h2>
                        {loadingBA ? (
                            <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
                        ) : safeBA.length === 0 ? (
                            <div className="text-center py-14 text-slate-400">
                                <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No before & after pairs yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {safeBA.map((t, idx) => (
                                    <motion.div key={t.id} layout className="border border-slate-200 rounded-2xl overflow-hidden group">
                                        {idx === 0 && (
                                            <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-2">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Active Homepage Slider
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2">
                                            <div className="relative">
                                                <img src={t.before_image_url} alt="Before" className="w-full aspect-video object-cover" />
                                                <div className="absolute top-2 left-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Before</div>
                                            </div>
                                            <div className="relative">
                                                <img src={t.after_image_url} alt="After" className="w-full aspect-video object-cover" />
                                                <div className="absolute top-2 left-2 bg-emerald-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">After</div>
                                            </div>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-800">{t.label || 'Cleaning Transformation'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => handleBADelete(t.id)}
                                                disabled={deletingIds.has(t.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-40">
                                                {deletingIds.has(t.id) ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transformations;
