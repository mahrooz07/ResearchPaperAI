import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PaperEditor = forwardRef(({ content, setContent }, ref) => {
    const reactQuillRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getEditor: () => {
            return reactQuillRef.current ? reactQuillRef.current.getEditor() : null;
        }
    }));

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="editor-container">
            <ReactQuill
                ref={reactQuillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
            />
        </div>
    );
});

export default PaperEditor;
