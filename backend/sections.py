from pydantic import BaseModel
from typing import List, Optional

class TitleRequest(BaseModel):
    idea: str

class TitleResponse(BaseModel):
    title: str

class Author(BaseModel):
    name: str
    affiliation: str
    department: str
    email: str
    country: str

class SectionRequest(BaseModel):
    idea: str
    title: str
    section: str
    authors: List[Author] = []
    references: List[str] = []
    image_provided: bool = False
    image_path: Optional[str] = None
    num_pages: int = 5
    
class ReferenceRequest(BaseModel):
    idea: str
    num_results: int = 15

class ReferenceResponse(BaseModel):
    references: List[str]

class ExportWordRequest(BaseModel):
    title: str
    authors: List[Author]
    sections: List[dict] # Contains {"section": str, "content": str, "image_provided": bool, "image_path": str}
    images: List[str] = [] # URLs to images
    references: List[str] = []

class ExportPdfRequest(BaseModel):
    title: str
    authors: List[Author]
    sections: List[dict]
    references: List[str] = []
    images: List[str] = []

class RegenerateRequest(BaseModel):
    idea: str
    title: str
    authors: List[Author] = []
    section_name: str
    existing_sections: List[dict]
    references: List[str] = []
    image_provided: bool = False
    image_path: Optional[str] = None
    num_pages: int = 5

class SavePaperRequest(BaseModel):
    title: str
    authors: List[Author]
    idea: str
    sections: List[dict]
    references: List[str]
    images: List[str]

class SavePaperResponse(BaseModel):
    paper_id: str
    message: str

class LoadPaperResponse(BaseModel):
    title: str
    authors: List[Author]
    idea: str
    sections: List[dict]
    references: List[str]
    images: List[str]

class SectionResponse(BaseModel):
    section: str
    content: str

AVAILABLE_SECTIONS = [
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
    "Conclusion",
    "References"
]

class ChatRequest(BaseModel):
    message: str
    html_context: str

class ChatResponse(BaseModel):
    reply: str
    updated_content: Optional[str] = None
