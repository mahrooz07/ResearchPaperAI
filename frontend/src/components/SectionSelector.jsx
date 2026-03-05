import React, { useRef } from 'react';
import { Layers, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadImageFile } from '../api';

const AVAILABLE_SECTIONS = [
    "Abstract",
    "Literature Survey",
    "Existing Work",
    "Methodology",
    "System Architecture",
    "Data Flow",
    "Technical Architecture (Tech Stack)",
    "Gap Analysis",
    "Result Analysis",
    "Implementation",
    "Future Work",
    "Conclusion"
];

export default function SectionSelector({
    selectedSections,
    toggleSection,
    selectAll,
    sectionImages,
    handleSectionImageCheck,
    handleSectionImageUpload,
    uploadingSectionImages
}) {

    return (
        <div className="panel">
            <div className="panel-title">
                <Layers size={24} color="#818cf8" />
                <span>Sections</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select sections to generate.</span>
                <button
                    onClick={selectAll}
                    style={{ background: 'transparent', color: 'var(--primary-color)', padding: 0, width: 'auto', fontSize: '0.85rem' }}>
                    Select All
                </button>
            </div>
            <div className="section-list">
                {AVAILABLE_SECTIONS.map((section) => {
                    const isSelected = selectedSections.includes(section);
                    const hasImageChecked = sectionImages[section]?.provided || false;
                    const imagePath = sectionImages[section]?.path || null;
                    const isUploading = uploadingSectionImages[section] || false;

                    return (
                        <div key={section} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent', padding: '0.5rem', borderRadius: '6px' }}>
                            <label className="checkbox-label" style={{ padding: 0, background: 'transparent' }}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSection(section)}
                                />
                                <span style={{ fontWeight: isSelected ? 600 : 400 }}>{section}</span>
                            </label>

                            {isSelected && (
                                <div style={{ paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label className="checkbox-label" style={{ padding: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <input
                                            type="checkbox"
                                            checked={hasImageChecked}
                                            onChange={(e) => handleSectionImageCheck(section, e.target.checked)}
                                        />
                                        Include Image for {section}
                                    </label>

                                    {hasImageChecked && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="file"
                                                id={`file-${section}`}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                                onChange={(e) => handleSectionImageUpload(section, e.target.files[0])}
                                            />
                                            <button
                                                onClick={() => document.getElementById(`file-${section}`).click()}
                                                disabled={isUploading || imagePath !== null}
                                                style={{
                                                    padding: '0.4rem 0.75rem',
                                                    fontSize: '0.8rem',
                                                    background: imagePath ? '#059669' : 'var(--surface-color)',
                                                    border: '1px solid var(--border-color)',
                                                    color: 'white',
                                                    width: 'auto',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                            >
                                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : (imagePath ? <CheckCircle2 size={14} /> : <Upload size={14} />)}
                                                {isUploading ? "Uploading..." : (imagePath ? "Image Uploaded" : "Upload Optional Image")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
