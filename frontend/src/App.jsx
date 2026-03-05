import React, { useState, useRef } from 'react';
import {
  generateTitleText, generateSectionText, generateReferencesText,
  exportWordDocument, exportPdfDocument, regenerateSectionText,
  savePaperProfile, loadPaperProfile, uploadImageFile
} from './api';
import IdeaInput from './components/IdeaInput';
import SectionSelector from './components/SectionSelector';
import ImageUploader from './components/ImageUploader';
import PaperEditor from './components/PaperEditor';
import AuthorForm from './components/AuthorForm';
import { FileText, Download, BookOpen, Save, UploadCloud, RefreshCw } from 'lucide-react';
import './index.css';

const AVAILABLE_SECTIONS = [
  "Abstract", "Literature Survey", "Existing Work", "Methodology",
  "System Architecture", "Data Flow", "Technical Architecture (Tech Stack)",
  "Gap Analysis", "Result Analysis", "Implementation", "Future Work",
  "Conclusion"
];

function App() {
  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState(null);
  const [loadingTitle, setLoadingTitle] = useState(false);

  const [authors, setAuthors] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

  // Section images: { "Methodology": { provided: true, path: "/uploads/img.png" } }
  const [sectionImages, setSectionImages] = useState({});
  const [uploadingSectionImages, setUploadingSectionImages] = useState({});

  const [generatingSections, setGeneratingSections] = useState(false);
  const [generatingRefs, setGeneratingRefs] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const [editorContent, setEditorContent] = useState("");

  // Data state to pass to export
  const [sectionsData, setSectionsData] = useState([]);
  const [referencesData, setReferencesData] = useState([]);
  const [imagesData, setImagesData] = useState([]);

  const [loadPaperId, setLoadPaperId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [regeneratingSection, setRegeneratingSection] = useState(null);

  const editorRef = useRef(null);

  const handleGenerateTitle = async () => {
    if (!idea.trim()) return;
    setLoadingTitle(true);
    try {
      const { data } = await generateTitleText(idea);
      const generatedTitle = data.title.replace(/['"]+/g, '');
      setTitle(generatedTitle);

      const titleHtml = `<h1 style="text-align: center;">${generatedTitle}</h1><br/>`;
      setEditorContent(prev => prev.includes(generatedTitle) ? prev : titleHtml + prev);
    } catch (err) {
      alert("Error generating title: " + err.message);
    } finally {
      setLoadingTitle(false);
    }
  };

  const handleInsertAuthors = () => {
    if (authors.length === 0) {
      alert("No authors to insert. Please add authors first.");
      return;
    }
    let html = `<div style="text-align: center;">`;
    authors.forEach((author) => {
      html += `<p style="margin: 0; padding: 0;"><strong>${author.name}</strong></p>
<p style="margin: 0; padding: 0;">${author.department || ''}, ${author.affiliation || ''}</p>
<p style="margin: 0; padding: 0;">${author.country || ''}</p>
<p style="margin: 0; padding: 0;">${author.email || ''}</p><br/>`;
    });
    html += `</div>`;
    setEditorContent(prev => html + prev);
  };

  const toggleSection = (section) => {
    setSelectedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const selectAll = () => {
    if (selectedSections.length === AVAILABLE_SECTIONS.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(AVAILABLE_SECTIONS);
    }
  };

  const handleSectionImageCheck = (section, checked) => {
    setSectionImages(prev => ({
      ...prev,
      [section]: { provided: checked, path: null }
    }));
  };

  const handleSectionImageUpload = async (section, file) => {
    if (!file) return;
    setUploadingSectionImages(prev => ({ ...prev, [section]: true }));
    try {
      const res = await uploadImageFile(file);
      setSectionImages(prev => ({
        ...prev,
        [section]: { provided: true, path: res.data.url }
      }));
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingSectionImages(prev => ({ ...prev, [section]: false }));
    }
  };

  const appendToEditor = (htmlContent) => {
    setEditorContent(prev => prev + htmlContent + "<br/>");
  };

  const insertImageToEditor = (url, filename) => {
    const imgHtml = `<p><img src="http://localhost:8000${url}" alt="${filename}" style="max-width:100%;" /></p><p><br/></p>`;
    appendToEditor(imgHtml);
    setImagesData(prev => [...prev, url]);
  };

  const rebuildEditorContent = (newSectionsData, refsData = referencesData) => {
    let html = "";
    if (title) html += `<h1 style="text-align: center;">${title}</h1><br/>`;
    if (authors.length > 0) {
      html += `<div style="text-align: center;">`;
      authors.forEach((author) => {
        html += `<p style="margin: 0; padding: 0;"><strong>${author.name}</strong></p>
<p style="margin: 0; padding: 0;">${author.department || ''}, ${author.affiliation || ''}</p>
<p style="margin: 0; padding: 0;">${author.country || ''}</p>
<p style="margin: 0; padding: 0;">${author.email || ''}</p><br/>`;
      });
      html += `</div>`;
    }

    newSectionsData.forEach(sec => {
      const formattedContent = sec.content.split('\\n').join('<br/>');
      html += `<h2>${sec.section}</h2><p>${formattedContent}</p>`;
      if (sec.image_provided) {
        if (sec.image_path) {
          html += `<p><img src="http://localhost:8000${sec.image_path}" style="max-width:100%;" /></p><p><br/></p>`;
        } else {
          html += `<p style="text-align: center; font-style: italic;">(Insert diagram for ${sec.section} here)</p><br/>`;
        }
      }
    });

    if (refsData.length > 0) {
      const refsHtml = refsData.map((r, i) => `[${i + 1}] ${r}`).join('<br/>');
      html += `<h2>References</h2><p>${refsHtml}</p>`;
    }

    setEditorContent(html);
  };

  const handleGenerateSections = async () => {
    if (!title || selectedSections.length === 0) {
      alert("Please ensure you have a title and have selected at least one section.");
      return;
    }

    setGeneratingSections(true);
    const newSectionsData = [...sectionsData];

    for (const section of AVAILABLE_SECTIONS) {
      if (selectedSections.includes(section)) {
        try {
          const imgProvided = sectionImages[section]?.provided || false;
          const imgPath = sectionImages[section]?.path || null;

          const { data } = await generateSectionText(idea, title, section, authors, referencesData, imgProvided, imgPath);

          newSectionsData.push({
            section: section,
            content: data.content,
            image_provided: imgProvided,
            image_path: imgPath
          });
          rebuildEditorContent(newSectionsData);
        } catch (err) {
          console.error(`Error generating ${section}`, err);
          appendToEditor(`<h2>${section}</h2><p style="color:red">Error generating section.</p>`);
        }
      }
    }

    setSectionsData(newSectionsData);
    setGeneratingSections(false);
  };

  const handleRegenerateSection = async (sectionName) => {
    setRegeneratingSection(sectionName);
    try {
      const targetImgProvided = sectionImages[sectionName]?.provided || false;
      const targetImgPath = sectionImages[sectionName]?.path || null;

      const { data } = await regenerateSectionText(idea, title, authors, sectionName, sectionsData, referencesData, targetImgProvided, targetImgPath);

      const newSectionsData = sectionsData.map(sec => {
        if (sec.section === sectionName) {
          return {
            section: sectionName,
            content: data.content,
            image_provided: targetImgProvided,
            image_path: targetImgPath
          };
        }
        return sec;
      });

      setSectionsData(newSectionsData);
      rebuildEditorContent(newSectionsData);
    } catch (err) {
      alert("Error regenerating section: " + err.message);
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleGenerateReferences = async () => {
    if (!idea) {
      alert("Please provide a research idea first.");
      return;
    }
    setGeneratingRefs(true);
    try {
      const { data } = await generateReferencesText(idea);
      const newRefsData = [...referencesData, ...data.references];
      setReferencesData(newRefsData);
      rebuildEditorContent(sectionsData, newRefsData);
    } catch (err) {
      alert("Error generating references: " + err.message);
    } finally {
      setGeneratingRefs(false);
    }
  };

  const triggerDownload = (url, fallbackName) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8000${url}`;
    link.download = fallbackName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportWord = async () => {
    if (!title) return alert("Please generate a title first.");
    setExporting(true);
    try {
      const { data } = await exportWordDocument(title, authors, sectionsData, referencesData, imagesData);
      triggerDownload(data.url, 'paper.docx');
    } catch (err) {
      alert("Error exporting Word document: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!title) return alert("Please generate a title first.");
    setExportingPdf(true);
    try {
      const { data } = await exportPdfDocument(title, authors, sectionsData, referencesData, imagesData);
      triggerDownload(data.url, 'paper.pdf');
    } catch (err) {
      alert("Error exporting PDF document: " + err.message);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSavePaper = async () => {
    if (!title) return alert("Please generate a paper first.");
    setSaving(true);
    try {
      const { data } = await savePaperProfile(title, authors, idea, sectionsData, referencesData, imagesData);
      alert(`Saved! You can load this later using ID: ${data.paper_id}`);
    } catch (err) {
      alert("Error saving paper: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPaper = async () => {
    if (!loadPaperId.trim()) return alert("Please enter a paper ID.");
    setLoading(true);
    try {
      const { data } = await loadPaperProfile(loadPaperId);
      setTitle(data.title);
      setAuthors(data.authors);
      setIdea(data.idea);
      setSectionsData(data.sections || []);
      setReferencesData(data.references || []);
      setImagesData(data.images || []);
      rebuildEditorContent(data.sections || [], data.references || []);
    } catch (err) {
      alert("Error loading paper: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>RpaperAI</h1>
        <p>AI-Powered IEEE Research Paper Generator</p>
      </header>

      <div className="sidebar">
        <IdeaInput
          idea={idea}
          setIdea={setIdea}
          generateTitle={handleGenerateTitle}
          title={title}
          setTitle={setTitle}
          loadingTitle={loadingTitle}
        />

        <div className="panel" style={{ paddingBottom: '1rem' }}>
          <AuthorForm
            authors={authors}
            setAuthors={setAuthors}
          />
          <button
            onClick={handleInsertAuthors}
            disabled={authors.length === 0}
            style={{ background: '#059669', marginTop: '0.5rem' }}
          >
            Insert Authors to Editor
          </button>
        </div>

        <SectionSelector
          selectedSections={selectedSections}
          toggleSection={toggleSection}
          selectAll={selectAll}
          sectionImages={sectionImages}
          handleSectionImageCheck={handleSectionImageCheck}
          handleSectionImageUpload={handleSectionImageUpload}
          uploadingSectionImages={uploadingSectionImages}
        />

        <div className="panel" style={{ gap: '0.75rem' }}>
          <button
            className="generate-all-btn"
            onClick={handleGenerateSections}
            disabled={generatingSections || selectedSections.length === 0 || !title}
          >
            <FileText size={18} />
            {generatingSections ? "Generating Paper..." : "Generate Selected Sections"}
          </button>

          <button
            onClick={handleGenerateReferences}
            disabled={generatingRefs || !idea}
            style={{ background: '#3b82f6' }}
          >
            <BookOpen size={18} />
            {generatingRefs ? "Finding References..." : "Generate Refs (Citations)"}
          </button>
        </div>

        <ImageUploader onUploadComplete={insertImageToEditor} />

        {sectionsData.length > 0 && (
          <div className="panel">
            <div className="panel-title">
              <RefreshCw size={24} color="#818cf8" />
              <span>Regenerate Sections</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sectionsData.map(sec => (
                <button
                  key={sec.section}
                  disabled={regeneratingSection !== null}
                  onClick={() => handleRegenerateSection(sec.section)}
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                >
                  {regeneratingSection === sec.section ? "Regenerating..." : `Regenerate ${sec.section}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="panel" style={{ gap: '0.75rem' }}>
          <div className="panel-title">
            <Save size={24} color="#818cf8" />
            <span>Paper Management</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Paper ID (e.g., Deep_Learning.json)"
              value={loadPaperId}
              onChange={(e) => setLoadPaperId(e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={handleLoadPaper} disabled={loading} style={{ width: 'auto', background: '#374151' }}>
              <UploadCloud size={16} /> Load
            </button>
          </div>

          <button
            onClick={handleSavePaper}
            disabled={saving || sectionsData.length === 0}
            style={{ background: '#2563eb' }}
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Workspace to JSON"}
          </button>
        </div>

        <div className="panel" style={{ gap: '0.75rem' }}>
          <button
            onClick={handleExportWord}
            disabled={exporting || sectionsData.length === 0}
            style={{ background: '#8b5cf6' }}
          >
            <Download size={18} />
            {exporting ? "Exporting..." : "Export as Word"}
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || sectionsData.length === 0}
            style={{ background: '#dc2626' }}
          >
            <FileText size={18} />
            {exportingPdf ? "Compiling PDF..." : "Export as IEEE PDF"}
          </button>
        </div>
      </div>

      <div className="main-content">
        <PaperEditor
          ref={editorRef}
          content={editorContent}
          setContent={setEditorContent}
        />
      </div>
    </div>
  );
}

export default App;
