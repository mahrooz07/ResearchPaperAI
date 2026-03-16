import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sections import TitleRequest, TitleResponse, SectionRequest, SectionResponse, ReferenceRequest, ReferenceResponse, ExportWordRequest, ExportPdfRequest, RegenerateRequest, SavePaperRequest, SavePaperResponse, LoadPaperResponse, ChatRequest, ChatResponse
from llm import generate_text
from prompts import generate_title_prompt, generate_section_prompt, generate_regeneration_prompt, generate_chat_prompt
from reference_agent import generate_references
from word_export import create_word_document
from latex_export import create_latex_document
import json

app = FastAPI(title="RpaperAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
PAPERS_DIR = "papers"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PAPERS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/generate-title", response_model=TitleResponse)
def generate_title(req: TitleRequest):
    try:
        prompt = generate_title_prompt(req.idea)
        title = generate_text(prompt)
        return TitleResponse(title=title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-section", response_model=SectionResponse)
def generate_section(req: SectionRequest):
    try:
        prompt = generate_section_prompt(req.section, req.idea, req.title, req.authors, req.references, req.num_pages)
        content = generate_text(prompt)
        return SectionResponse(section=req.section, content=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-image")
def upload_image(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename, "url": f"/{UPLOAD_DIR}/{file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-references", response_model=ReferenceResponse)
def api_generate_references(req: ReferenceRequest):
    try:
        refs = generate_references(req.idea)
        return ReferenceResponse(references=refs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export-word")
def api_export_word(req: ExportWordRequest):
    try:
        url = create_word_document(
            title=req.title,
            authors=req.authors,
            sections=req.sections,
            references=req.references,
            images=req.images
        )
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export-pdf")
def api_export_pdf(req: ExportPdfRequest):
    try:
        url = create_latex_document(
            title=req.title,
            authors=req.authors,
            sections=req.sections,
            references=req.references,
            images=req.images
        )
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/regenerate-section", response_model=SectionResponse)
def api_regenerate_section(req: RegenerateRequest):
    try:
        prompt = generate_regeneration_prompt(
            req.section_name, req.idea, req.title, req.authors, req.existing_sections, req.references, req.num_pages
        )
        content = generate_text(prompt)
        return SectionResponse(section=req.section_name, content=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-paper", response_model=SavePaperResponse)
def api_save_paper(req: SavePaperRequest):
    try:
        # Sanitize title for filename
        safe_title = "".join([c for c in req.title if c.isalpha() or c.isdigit() or c==' ']).rstrip()
        filename = f"{safe_title.replace(' ', '_')}.json"
        filepath = os.path.join(PAPERS_DIR, filename)
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(req.model_dump(), f, indent=4)
            
        return SavePaperResponse(paper_id=filename, message="Paper saved successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/load-paper", response_model=LoadPaperResponse)
def api_load_paper(paper_id: str):
    try:
        filepath = os.path.join(PAPERS_DIR, paper_id)
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Paper not found")
            
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            return LoadPaperResponse(**data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
def api_chat(req: ChatRequest):
    try:
        import re
        prompt = generate_chat_prompt(req.message, req.html_context)
        response_text = generate_text(prompt)
        
        # Extract JSON ignoring conversational artifacts
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            data = json.loads(match.group(0))
            return ChatResponse(
                reply=data.get("reply", "I processed your request."),
                updated_content=data.get("updated_content")
            )
        else:
            return ChatResponse(reply=response_text, updated_content=None)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
