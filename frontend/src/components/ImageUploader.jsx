import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { uploadImageFile } from '../api';

export default function ImageUploader({ onUploadComplete }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadImageFile(file);
            onUploadComplete(res.data.url, res.data.filename);
        } catch (err) {
            alert("Image upload failed: " + err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="panel">
            <div className="panel-title">
                <ImagePlus size={24} color="#818cf8" />
                <span>Upload Diagrams</span>
            </div>
            <div
                className="upload-zone"
                onClick={() => !uploading && fileInputRef.current.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                />
                {uploading ? (
                    <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
                ) : (
                    <>
                        <ImagePlus size={32} color="var(--primary-color)" />
                        <p>Click to upload architectures or diagrams</p>
                    </>
                )}
            </div>
        </div>
    );
}
