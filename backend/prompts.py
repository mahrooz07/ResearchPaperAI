def generate_title_prompt(idea: str) -> str:
    return f"""Based on the following research idea, generate a professional, academic title suitable for an IEEE research paper.
The title should be concise, specific, and impactful.
Return ONLY the title string, no quotes, no extra text.

Research Idea:
{idea}"""

def generate_section_prompt(section: str, idea: str, title: str, authors: list, references: list = None) -> str:
    author_details = "\\n".join([f"- {a.name} ({a.affiliation}, {a.department}, {a.country})" for a in authors]) if authors else "None provided"
    
    ref_context = ""
    ref_inst = ""
    if references:
        ref_context = "\\nAvailable References:\\n" + "\\n".join([f"[{idx+1}] {r}" for idx, r in enumerate(references)])
        ref_inst = "\\n- Use the references above to insert inline citations like [1], [2] organically within the text where appropriate."
        
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
5. Provide ONLY plain text. No markdown, no HTML, no LaTeX.
6. Make it comprehensive and detailed (at least 3-4 paragraphs where applicable).{ref_inst}

Now generate the content for '{section}':"""

def generate_regeneration_prompt(section: str, idea: str, title: str, authors: list, existing_sections: list, references: list = None) -> str:
    author_details = "\\n".join([f"- {a.name} ({a.affiliation}, {a.department}, {a.country})" for a in authors]) if authors else "None provided"
    
    existing_context = "\\n".join([f"--- {s['section']} ---\\n{s['content']}" for s in existing_sections if s['section'] != section])
    
    ref_context = ""
    ref_inst = ""
    if references:
        ref_context = "\\nAvailable References:\\n" + "\\n".join([f"[{idx+1}] {r}" for idx, r in enumerate(references)])
        ref_inst = "\\n- Use the references above to insert inline citations like [1], [2] organically within the text where appropriate."
        
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
5. Provide ONLY plain text. No markdown, no HTML, no LaTeX.
6. Make it comprehensive and detailed (at least 3-4 paragraphs where applicable).{ref_inst}

Now regenerate the content for '{section}':"""
