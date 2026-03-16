def generate_title_prompt(idea: str) -> str:
    return f"""Based on the following research idea, generate a professional, academic title suitable for an IEEE research paper.
The title should be concise, specific, and impactful.
Return ONLY the title string, no quotes, no extra text.

Research Idea:
{idea}"""

def generate_section_prompt(section: str, idea: str, title: str, authors: list, references: list = None, num_pages: int = 5) -> str:
    author_details = "\\n".join([f"- {a.name} ({a.affiliation}, {a.department}, {a.country})" for a in authors]) if authors else "None provided"
    
    ref_context = ""
    ref_inst = ""
    lit_survey_override = ""
    
    if references:
        # Separate the snippet internally for LLM context, but only ask it to cite the front part
        clean_refs = []
        snippets = []
        for idx, r in enumerate(references):
            parts = r.split("|||SNIPPET|||")
            cit = parts[0].strip()
            snip = parts[1].strip() if len(parts) > 1 else "No abstract snippet available."
            clean_refs.append(f"[{idx+1}] {cit}")
            snippets.append(f"[{idx+1}] {cit}\\nSnippet: {snip}")
            
        ref_context = "\\nAvailable References (Use exactly these for citations):\\n" + "\\n".join(snippets)
        ref_inst = "\\n- Use the references above to insert inline citations like [1], [2] organically within the text where appropriate."

        if "literature" in section.lower() or "existing" in section.lower():
            lit_survey_override = """
CRITICAL REQUIREMENT FOR LITERATURE SURVEY:
DO NOT write standard paragraphs. You MUST output EXACTLY 15 paragraphs, one for each provided reference, following EXACTLY this format structure:
"In [X], Author et al. proposed a method for [problem] using [algorithm/technique]. Their approach achieved high accuracy, but the system required large computational resources."
"In [Y], Author et al. developed a machine learning–based model to improve [task]. The results showed better performance compared with traditional methods; however, the model suffered from overfitting on small datasets."
Do NOT hallucinate papers. Read the Reference Snippets provided above and inject their actual contextual details (problems, techniques, results, flaws) into that exact string structure for every single citation [1] through [15].
"""

    abstract_override = ""
    if section.lower() == "abstract":
        abstract_override = "\\n- At the very end of this section, you MUST add a new paragraph starting with 'Keywords: ' followed by 5 comma-separated highly relevant technical keywords."
        
    references_override = ""
    if section.lower() == "references":
        references_override = "\\nCRITICAL REQUIREMENT FOR REFERENCES:\\nYou MUST output ONLY the numbered list of references. DO NOT include any introductory sentences, explanations, or concluding remarks. Just output the citations exactly as they are provided in the Available References section."
        
    length_scale = max(2, int(num_pages / 2)) # Rough paragraph scaling heuristic
    length_inst = f"\\n- The expected paper length is {num_pages} pages, so make this section appropriately comprehensive (about {length_scale} to {length_scale+2} detailed paragraphs)."
    if lit_survey_override or references_override: length_inst = "" # overrides standard length instructions

    return f"""Write the '{section}' section for an IEEE research paper.
Paper Title: {title}
Author Details:
{author_details}

Research Idea: {idea}
{ref_context}

Instructions:
1. Write in a formal, academic tone appropriate for IEEE publications.
2. Structure the content logically.
3. Depending on the section ({section}), include relevant terminology and depth.
4. Do not include the section heading itself in the output, just the body text.
5. Provide ONLY plain text. No markdown, no HTML, no LaTeX.{length_inst}{ref_inst}{abstract_override}{lit_survey_override}{references_override}

Now generate the content for '{section}':"""

def generate_regeneration_prompt(section: str, idea: str, title: str, authors: list, existing_sections: list, references: list = None, num_pages: int = 5) -> str:
    author_details = "\\n".join([f"- {a.name} ({a.affiliation}, {a.department}, {a.country})" for a in authors]) if authors else "None provided"
    
    existing_context = "\\n".join([f"--- {s['section']} ---\\n{s['content']}" for s in existing_sections if s['section'] != section])
    
    ref_context = ""
    ref_inst = ""
    lit_survey_override = ""
    
    if references:
        # Separate the snippet internally for LLM context, but only ask it to cite the front part
        clean_refs = []
        snippets = []
        for idx, r in enumerate(references):
            parts = r.split("|||SNIPPET|||")
            cit = parts[0].strip()
            snip = parts[1].strip() if len(parts) > 1 else "No abstract snippet available."
            clean_refs.append(f"[{idx+1}] {cit}")
            snippets.append(f"[{idx+1}] {cit}\\nSnippet: {snip}")
            
        ref_context = "\\nAvailable References (Use exactly these for citations):\\n" + "\\n".join(snippets)
        ref_inst = "\\n- Use the references above to insert inline citations like [1], [2] organically within the text where appropriate."

        if "literature" in section.lower() or "existing" in section.lower():
            lit_survey_override = """
CRITICAL REQUIREMENT FOR LITERATURE SURVEY:
DO NOT write standard paragraphs. You MUST output EXACTLY 15 paragraphs, one for each provided reference, following EXACTLY this format structure:
"In [X], Author et al. proposed a method for [problem] using [algorithm/technique]. Their approach achieved high accuracy, but the system required large computational resources."
"In [Y], Author et al. developed a machine learning–based model to improve [task]. The results showed better performance compared with traditional methods; however, the model suffered from overfitting on small datasets."
Do NOT hallucinate papers. Read the Reference Snippets provided above and inject their actual contextual details (problems, techniques, results, flaws) into that exact string structure for every single citation [1] through [15].
"""

    abstract_override = ""
    if section.lower() == "abstract":
        abstract_override = "\\n- At the very end of this section, you MUST add a new paragraph starting with 'Keywords: ' followed by 5 comma-separated highly relevant technical keywords."
        
    references_override = ""
    if section.lower() == "references":
        references_override = "\\nCRITICAL REQUIREMENT FOR REFERENCES:\\nYou MUST output ONLY the numbered list of references. DO NOT include any introductory sentences, explanations, or concluding remarks. Just output the citations exactly as they are provided in the Available References section."
        
    length_scale = max(2, int(num_pages / 2)) # Rough paragraph scaling heuristic
    length_inst = f"\\n- The expected paper length is {num_pages} pages, so make this section appropriately comprehensive (about {length_scale} to {length_scale+2} detailed paragraphs)."
    if lit_survey_override or references_override: length_inst = ""

    return f"""Regenerate the '{section}' section for an IEEE research paper fitting into the existing context.
    
Paper Title: {title}
Author Details:
{author_details}

Research Idea: {idea}
{ref_context}

Existing Paper Context (DO NOT rewrite these, use as context):
{existing_context}

Instructions:
1. Write in a formal, academic tone appropriate for IEEE publications.
2. Structure the content logically, ensuring it flows well with the Existing Paper Context.
3. Depending on the section ({section}), include relevant terminology and depth.
4. Do not include the section heading itself in the output, just the body text.
5. Provide ONLY plain text. No markdown, no HTML, no LaTeX.{length_inst}{ref_inst}{abstract_override}{lit_survey_override}{references_override}

Now regenerate the content for '{section}':"""

def generate_chat_prompt(message: str, html_context: str) -> str:
    return f"""You are a helpful AI assistant integrated into a Research Paper editor.
The user is currently writing a research paper and has asked you a question or requested an edit.

CURRENT EDITOR HTML CONTENT:
-------------
{html_context}
-------------

USER MESSAGE: {message}

Your task is to respond to the user, and IF the user asks you to edit the paper, supply the fully updated HTML content.
Provide your response ONLY as a valid JSON object with the following schema:
{{
  "reply": "Your conversational response to the user",
  "updated_content": "The COMPLETE modified HTML if an edit was requested, OR null if no edit was needed."
}}
DO NOT wrap the JSON in markdown code blocks. NO OTHER TEXT. ONLY RAW JSON.
"""
