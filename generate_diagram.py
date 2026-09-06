import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Polygon, Circle, Rectangle

# Configure presentation fonts
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'Helvetica', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

def draw_cylinder(ax, x, y, w, h, label, fc='#FFFFFF', ec='#475569', tc='#0F172A', tag=''):
    """Draws a clean database cylinder shape"""
    ellipse_h = h * 0.28
    
    # Body rectangle
    body = Rectangle((x, y - h + ellipse_h/2), w, h - ellipse_h, fc=fc, ec=ec, lw=1.2, zorder=4)
    ax.add_patch(body)
    
    # Bottom ellipse
    bottom = patches.Ellipse((x + w/2, y - h + ellipse_h/2), w, ellipse_h, fc=fc, ec=ec, lw=1.2, zorder=3)
    ax.add_patch(bottom)
    
    # Top ellipse (rim)
    top = patches.Ellipse((x + w/2, y - ellipse_h/2), w, ellipse_h, fc=fc, ec=ec, lw=1.2, zorder=5)
    ax.add_patch(top)
    
    # Text
    lines = label.split('\n')
    line_h = 2.0
    start_y = (y - h/2) + ((len(lines)-1) * line_h / 2) - 0.5
    for i, line in enumerate(lines):
        is_bold = (i == 0)
        ax.text(x + w/2, start_y - (i * line_h), line, fontsize=7.2 if not is_bold else 7.8,
                fontweight='bold' if is_bold else 'normal', color=tc, ha='center', va='center', zorder=6)
    
    if tag:
        ax.text(x + w/2, y - h + 1.8, f"[{tag}]", fontsize=6.2, fontweight='bold', color='#15803D', ha='center', va='center', zorder=6)

def draw_block_diagram():
    fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 160)
    ax.set_ylim(0, 90)
    ax.axis('off')

    # ─────────────────────────────────────────────────────────────────────────
    # HEADER
    # ─────────────────────────────────────────────────────────────────────────
    ax.text(6, 86.0, "AI Interview Trainer", fontsize=18, fontweight='bold', color='#0F172A', va='center')
    ax.text(42, 86.0, "– System Architecture Blueprint", fontsize=15, fontweight='semibold', color='#2563EB', va='center')
    ax.text(6, 83.2, "Problem Statement No. 22: Interview Trainer Agent  |  IBM University Engagement / AICTE Project Track", 
            fontsize=9.0, fontweight='medium', color='#64748B', va='center')

    # Top badges
    def draw_top_badge(x, y, text, bg, border, fg):
        bw = len(text)*0.88 + 4.0
        ax.add_patch(FancyBboxPatch((x, y-1.4), bw, 2.8, boxstyle="round,pad=0.2", fc=bg, ec=border, lw=1.0, zorder=3))
        ax.text(x + bw/2, y, text, fontsize=7.2, fontweight='bold', color=fg, ha='center', va='center', zorder=4)

    draw_top_badge(108, 84.5, "IBM watsonx Orchestrate", "#EFF6FF", "#BFDBFE", "#1D4ED8")
    draw_top_badge(134, 84.5, "RAG Knowledge Layer", "#F0FDF4", "#BBF7D0", "#15803D")

    # Top divider
    ax.plot([6, 154], [81.0, 81.0], color='#CBD5E1', lw=1.0, zorder=2)

    # ─────────────────────────────────────────────────────────────────────────
    # SUBGRAPH CONTAINERS
    # ─────────────────────────────────────────────────────────────────────────
    def draw_subgraph(x, y, w, h, title, subtitle="", bg="#FFFFFF", border="#CBD5E1", title_col="#0F172A", is_ibm=False):
        # Container background box
        ax.add_patch(FancyBboxPatch((x, y - h), w, h, boxstyle="round,pad=0.4", fc=bg, ec=border, lw=1.8 if is_ibm else 1.2, zorder=1))
        # Container title
        ax.text(x + 2.0, y - 2.0, title, fontsize=9.0, fontweight='bold', color=title_col, va='center', zorder=2)
        if subtitle:
            ax.text(x + w - 2.0, y - 2.0, subtitle, fontsize=7.2, fontweight='semibold', color='#64748B', ha='right', va='center', zorder=2)

    # Card / Node inside subgraphs
    def draw_node(x, y, w, h, title, subtitle="", fc="#FFFFFF", ec="#94A3B8", tc="#0F172A", lw=1.0, is_primary=False):
        ax.add_patch(FancyBboxPatch((x, y - h), w, h, boxstyle="round,pad=0.3",
                                   fc='#EFF6FF' if is_primary else fc,
                                   ec='#2563EB' if is_primary else ec,
                                   lw=1.5 if is_primary else lw, zorder=4))
        
        lines = title.split('\n')
        if subtitle:
            lines.append(subtitle)
        
        line_h = 2.0
        start_y = (y - h/2) + ((len(lines)-1) * line_h / 2)
        for i, line in enumerate(lines):
            is_sub = (subtitle and i == len(lines)-1)
            is_first = (i == 0)
            ax.text(x + w/2, start_y - (i * line_h), line,
                    fontsize=6.8 if is_sub else (7.8 if is_first else 7.2),
                    fontweight='normal' if is_sub else ('bold' if is_first else 'medium'),
                    color='#64748B' if is_sub else tc,
                    ha='center', va='center', zorder=5)

    def draw_conn(p1, p2, label="", color="#64748B", lw=1.3, style="->", rad=0.0):
        ax.annotate('', xy=p2, xytext=p1,
                    arrowprops=dict(arrowstyle=f"{style},head_width=0.4,head_length=0.6",
                                    connectionstyle=f"arc3,rad={rad}", color=color, lw=lw), zorder=3)
        if label:
            mx = (p1[0] + p2[0]) / 2
            my = (p1[1] + p2[1]) / 2 + (1.2 if rad==0 else 0)
            lbl_w = len(label) * 0.72 + 2.0
            ax.add_patch(FancyBboxPatch((mx - lbl_w/2, my - 1.2), lbl_w, 2.4, boxstyle="round,pad=0.1",
                                       fc='#FFFFFF', ec='#E2E8F0', lw=0.8, zorder=6))
            ax.text(mx, my, label, fontsize=6.5, fontweight='bold', color=color, ha='center', va='center', zorder=7)

    # ─────────────────────────────────────────────────────────────────────────
    # 1. FRONTEND LAYER (TOP CONTAINER)
    # ─────────────────────────────────────────────────────────────────────────
    draw_subgraph(6, 79, 148, 16, "Frontend Client Layer (Vercel SPA)", "React 19  •  TypeScript  •  Vite  •  Tailwind CSS 4",
                  bg="#F8FAFC", border="#93C5FD", title_col="#1D4ED8")

    draw_node(9, 74.5, 23, 8.5, "Candidate Profile Setup\n& Flight Deck", "Target Role & Skills")
    draw_node(36, 74.5, 23, 8.5, "Resume Ingestion UI\n(PDF / DOCX)", "Keyword Extraction")
    draw_node(63, 74.5, 25, 8.5, "Mock Interview Arena\n(One-at-a-Time)", "Live Q&A Simulation", is_primary=True)
    draw_node(92, 74.5, 24, 8.5, "AI Career Coach\nChat Interface", "Markdown & Code Copy")
    draw_node(120, 74.5, 20, 8.5, "Web Speech Audio Client\n(Browser Native STT/TTS)", "Microphone & Speaker")
    draw_node(142, 74.5, 10, 8.5, "AppContext\nState Store", "Session")

    # ─────────────────────────────────────────────────────────────────────────
    # 2. BACKEND API LAYER (MIDDLE CONTAINER)
    # ─────────────────────────────────────────────────────────────────────────
    draw_subgraph(6, 59.5, 148, 22.5, "Backend API Layer (Render Web Service)", "Node.js 20  •  Express 4  •  TypeScript",
                  bg="#F8FAFC", border="#64748B", title_col="#0F172A")

    # Express Gateway
    draw_node(63, 56.0, 25, 6.0, "Node.js 20 Express REST API", "Central Router & Controllers", is_primary=True)

    # Backend components inside container
    draw_node(9, 48.0, 23, 7.5, "IBM Cloud IAM Token Manager\n(OAuth2 Bearer Token Auth)", "Identity & Access")
    draw_node(36, 48.0, 23, 7.5, "Prompt Builder & Engine\n(Context & Schema Normalizer)", "promptBuilder.ts")
    draw_node(63, 48.0, 25, 7.5, "Interview Session Manager\n(State & History Controller)", "interview.ts")
    draw_node(92, 48.0, 24, 7.5, "Resume Parser Module\n(pdf-parse / mammoth)", "resumeParser.ts")
    draw_node(120, 48.0, 31, 7.5, "Score Calculator Engine (5 Rubrics)\n& Response Parser Normalizer", "scoreCalculator.ts")

    # Sub-container: Storage Layer (nested inside backend)
    draw_subgraph(9, 39.5, 50, 2.0, "", "") # visual backing
    draw_cylinder(ax, 11, 40.0, 21, 7.2, "SQLite Embedded DB\n(@databases/sqlite)", tag="ACID Store")
    draw_node(36, 39.0, 21, 6.2, "Local Temporary\nResume Uploads", "File Storage")

    # ─────────────────────────────────────────────────────────────────────────
    # 3. IBM CLOUD & AI INFRASTRUCTURE (BOTTOM CONTAINER)
    # ─────────────────────────────────────────────────────────────────────────
    draw_subgraph(6, 33.5, 148, 24.5, "IBM Cloud & AI Infrastructure", "Hosted IBM Cloud Enterprise Environment",
                  bg="#FFFFFF", border="#0F62FE", title_col="#0F62FE", is_ibm=True)

    # IBM watsonx Orchestrate Sub-Box (Prominent)
    draw_subgraph(9, 30.0, 95, 19.5, "IBM watsonx Orchestrate — AI Agent & Orchestration Layer", "POST /v1/orchestrate/{agentId}/chat/completions",
                  bg="#EFF6FF", border="#0F62FE", title_col="#0F62FE", is_ibm=True)

    # Orchestrate API
    draw_node(13, 26.0, 26, 6.0, "watsonx Orchestrate API\n(IAM Bearer Authenticated)", "Secure Gateway", is_primary=True)

    # Interview Trainer Agent Core Box
    draw_node(43, 26.5, 33, 13.5, "Interview Trainer Agent Core",
              "• Adaptive Question Generation (Tech/HR/STAR)\n• Real-Time 5-Rubric Answer Evaluation\n• Reference Model Answer Synthesis\n• Targeted Improvement Recommendations\n• Conversational Career Strategy Coaching",
              fc="#FFFFFF", ec="#0F62FE", tc="#0F172A", lw=1.5)

    # RAG Knowledge Base Cylinder
    draw_cylinder(ax, 80, 26.5, 21, 13.5, "RAG Knowledge Base\n(Curated Domain Material)\n\n• Tech (Python, SQL, System)\n• HR & Behavioral STAR\n• Evaluation Rubric Matrices",
                  fc="#F0FDF4", ec="#22C55E", tc="#15803D", tag="Grounding Layer")

    # IBM Watson Speech Services Box
    draw_subgraph(109, 30.0, 42, 19.5, "IBM Watson Speech Services", "Dual-Tier Voice Processing",
                  bg="#FFFBEB", border="#F59E0B", title_col="#B45309")
    
    draw_node(112, 25.5, 36, 6.0, "IBM Speech-to-Text (STT)\nCandidate Voice -> Transcribed Text", "High-Fidelity Audio")
    draw_node(112, 18.0, 36, 6.0, "IBM Text-to-Speech (TTS)\nAgent Question -> Audio Synthesis", "Natural Voice AllisonV3")

    # ─────────────────────────────────────────────────────────────────────────
    # 4. CONNECTORS & FLOW ARROWS
    # ─────────────────────────────────────────────────────────────────────────
    # Frontend -> Backend (HTTPS REST)
    draw_conn((75.5, 66.0), (75.5, 56.0), label="HTTPS REST API", color="#2563EB", lw=2.0)

    # Backend -> Storage
    draw_conn((21.5, 40.5), (21.5, 33.0), label="", color="#475569")
    draw_conn((46.5, 40.5), (46.5, 33.0), label="", color="#475569")

    # Backend Express -> Internal modules
    draw_conn((65, 50.0), (20.5, 48.0), color="#64748B", rad=0.08)
    draw_conn((70, 50.0), (47.5, 48.0), color="#64748B")
    draw_conn((75.5, 50.0), (75.5, 48.0), color="#64748B")
    draw_conn((81, 50.0), (104, 48.0), color="#64748B")
    draw_conn((86, 50.0), (135, 48.0), color="#64748B", rad=-0.08)

    # IAM Manager -> watsonx API (Bearer Token)
    draw_conn((20.5, 40.5), (26, 26.0), label="Bearer Auth", color="#0F62FE", lw=1.6)

    # Prompt Builder / Express -> watsonx API (Chat Completions)
    draw_conn((47.5, 40.5), (39, 23.0), label="Chat Completions Payload", color="#0F62FE", lw=1.8)

    # watsonx API -> Interview Trainer Agent
    draw_conn((39, 20.0), (43, 20.0), color="#0F62FE", lw=1.8)

    # Agent <-> RAG Knowledge Base (Bidirectional)
    draw_conn((76, 20.0), (80, 20.0), style="<->", label="RAG Grounding", color="#16A34A", lw=2.0)

    # Express -> Speech Services
    draw_conn((135.5, 40.5), (130, 25.5), label="Voice Audio / REST", color="#D97706", lw=1.4)

    # ─────────────────────────────────────────────────────────────────────────
    # FOOTER: Platform & Dev Notes
    # ─────────────────────────────────────────────────────────────────────────
    ax.plot([6, 154], [7.5, 7.5], color='#CBD5E1', lw=1.0, zorder=2)

    # Left note: IBM Cloud
    ax.add_patch(FancyBboxPatch((6, 1.8), 71, 4.8, boxstyle="round,pad=0.2", fc='#FFFFFF', ec='#CBD5E1', lw=1.0, zorder=3))
    ax.text(8.5, 4.2, "IBM Cloud:", fontsize=8.2, fontweight='bold', color='#0F172A', va='center', zorder=4)
    ax.text(20.5, 4.2, "Cloud environment supporting IBM watsonx Orchestrate & Speech services.",
            fontsize=7.6, color='#475569', va='center', zorder=4)

    # Right note: IBM Bob
    ax.add_patch(FancyBboxPatch((83, 1.8), 71, 4.8, boxstyle="round,pad=0.2", fc='#FFFFFF', ec='#CBD5E1', lw=1.0, zorder=3))
    ax.text(85.5, 4.2, "IBM Bob:", fontsize=8.2, fontweight='bold', color='#0F172A', va='center', zorder=4)
    ax.text(96.0, 4.2, "Development environment used to build and refine the application & agent workflow.",
            fontsize=7.6, color='#475569', va='center', zorder=4)

    plt.tight_layout()

    # Save 300 DPI high-res PNG
    png_path = "AI_Interview_Trainer_Architecture.png"
    plt.savefig(png_path, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    print(f"Generated: {png_path}")

    # Also save to docs/
    docs_png = "docs/AI_Interview_Trainer_Architecture.png"
    plt.savefig(docs_png, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    print(f"Generated: {docs_png}")

    # Save SVG vector format
    svg_path = "AI_Interview_Trainer_Architecture.svg"
    plt.savefig(svg_path, format='svg', bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    print(f"Generated: {svg_path}")

if __name__ == '__main__':
    draw_block_diagram()
