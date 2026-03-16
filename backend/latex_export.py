import os
import subprocess

def create_latex_document(title: str, authors: list, sections: list, references: list, images: list, output_filename: str = "paper") -> str:
    # Build author string for IEEEtran
    author_blocks = []
    for a in authors:
        block = f"\\IEEEauthorblockN{{{a.name}}}\n\\IEEEauthorblockA{{\\textit{{{a.department}}} \\\\\n\\textit{{{a.affiliation}}}\\\\\n{a.country} \\\\\n{a.email}}}"
        author_blocks.append(block)
    author_latex = "\\and\n".join(author_blocks) if author_blocks else "\\IEEEauthorblockN{Anonymous}\n\\IEEEauthorblockA{Anonymous Institution}"

    # Build sections
    sections_latex = ""
    for sec in sections:
        sec_name = sec['section']
        content = sec['content']
        
        # Determine IEEE section type
        if sec_name.lower() == "abstract":
            sections_latex += f"\\begin{{abstract}}\n{content}\n\\end{{abstract}}\n\n"
        else:
            sections_latex += f"\\section{{{sec_name}}}\n{content}\n\n"
            
            # Handle images
            if sec.get('image_provided'):
                if sec.get('image_path'):
                    # The image_path usually is like /uploads/filename.png
                    img_filename = os.path.basename(sec['image_path'])
                    local_img_path = os.path.join(os.getcwd(), "uploads", img_filename)
                    # IEEE figure anchoring with [H]
                    sections_latex += f"\\begin{{figure}}[H]\n\\centering\n\\includegraphics[width=\\linewidth]{{{local_img_path}}}\n\\caption{{{sec_name} Diagram}}\n\\end{{figure}}\n\n"
                else:
                    sections_latex += f"\\vspace{{2cm}}\n\\begin{{center}}\\textit{{(Insert diagram for {sec_name} here)}}\\end{{center}}\n\\vspace{{2cm}}\n\n"

    # Handle global images at end if not tied to sections
    # In phase 3 we are tying them to sections, but we'll include any leftover standard images just in case
    if images:
        for img_url in images:
             # Skip if already used in a section
             used = any(img_url == s.get('image_path') for s in sections)
             if not used:
                 img_filename = os.path.basename(img_url)
                 local_img_path = os.path.join(os.getcwd(), "uploads", img_filename)
                 sections_latex += f"\\begin{{figure}}[H]\n\\centering\n\\includegraphics[width=\\linewidth]{{{local_img_path}}}\n\\caption{{Attached Figure}}\n\\end{{figure}}\n\n"


    # Build references using thebibliography
    refs_latex = ""
    if references:
        refs_latex = f"\\begin{{thebibliography}}{{1}}\n"
        for idx, r in enumerate(references):
            refs_latex += f"\\bibitem{{ref{idx+1}}}\n{r}\n"
        refs_latex += f"\\end{{thebibliography}}\n"


    latex_code = f"""\\documentclass[conference]{{IEEEtran}}
\\usepackage[utf8]{{inputenc}}
\\usepackage{{graphicx}}
\\usepackage{{cite}}
\\usepackage{{amsmath,amssymb,amsfonts}}
\\usepackage{{algorithmic}}
\\usepackage{{textcomp}}
\\usepackage{{xcolor}}
\\usepackage{{float}}

\\begin{{document}}

\\title{{{title}}}

\\author{{{author_latex}}}

\\maketitle

{sections_latex}

{refs_latex}

\\end{{document}}
"""

    os.makedirs("uploads", exist_ok=True)
    tex_path = os.path.join("uploads", f"{output_filename}.tex")
    pdf_path = os.path.join("uploads", f"{output_filename}.pdf")
    
    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(latex_code)
        
    # Compile with pdflatex
    try:
        subprocess.run(["pdflatex", "-output-directory=uploads", "-interaction=nonstopmode", tex_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # Run twice for references formatting
        subprocess.run(["pdflatex", "-output-directory=uploads", "-interaction=nonstopmode", tex_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError as e:
        print(f"pdflatex compilation failed: {e}")
        # Even if it errors (e.g. missing images), often it produces a PDF. 
        if not os.path.exists(pdf_path):
             raise RuntimeError("PDF compilation failed. Please ensure pdflatex is installed and functional.")
             
    return f"/uploads/{output_filename}.pdf"
