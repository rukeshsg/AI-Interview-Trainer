import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Configure crisp presentation fonts
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'Helvetica', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

def draw_architecture():
    # 16:9 widescreen presentation canvas (1920x1080 at 120 DPI, or 4800x2700 at 300 DPI)
    fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 160)
    ax.set_ylim(0, 90)
    ax.axis('off')

    # ─────────────────────────────────────────────────────────────────────────
    # HEADER
    # ─────────────────────────────────────────────────────────────────────────
    ax.text(6, 84.8, "AI Interview Trainer", fontsize=20, fontweight='bold', color='#0F172A', va='center')
    ax.text(47.5, 84.8, "– System Architecture & Agent Workflow Blueprint", fontsize=15.5, fontweight='semibold', color='#2563EB', va='center')
    ax.text(6, 81.6, "Problem Statement No. 22: Interview Trainer Agent  |  IBM University Engagement / AICTE Project Track", 
            fontsize=9.5, fontweight='medium', color='#64748B', va='center')

    # Header badges (top right)
    def draw_badge(x, y, text, bg, border, fg):
        badge_w = len(text)*0.92 + 4.5
        ax.add_patch(patches.FancyBboxPatch((x, y-1.6), badge_w, 3.2, boxstyle="round,pad=0.3",
                                           fc=bg, ec=border, lw=1.2, zorder=3))
        ax.text(x + badge_w/2, y, text, fontsize=7.5, fontweight='bold', color=fg, ha='center', va='center', zorder=4)

    draw_badge(106, 83.6, "IBM watsonx Orchestrate", "#EFF6FF", "#BFDBFE", "#1D4ED8")
    draw_badge(134, 83.6, "RAG Knowledge Layer", "#F0FDF4", "#BBF7D0", "#15803D")

    # Divider line
    ax.plot([6, 154], [78.8, 78.8], color='#CBD5E1', lw=1.2, zorder=2)

    # ─────────────────────────────────────────────────────────────────────────
    # HELPER FUNCTIONS FOR CARDS & ARROWS
    # ─────────────────────────────────────────────────────────────────────────
    def draw_card(x, y, w, h, title, items, tag="", bg="#FFFFFF", border="#CBD5E1", title_col="#0F172A", is_ibm=False):
        # Card body
        ax.add_patch(patches.FancyBboxPatch((x, y-h), w, h, boxstyle="round,pad=0.5",
                                           fc=bg, ec=border, lw=2.2 if is_ibm else 1.2, zorder=3))
        
        # IBM Header banner if active
        if is_ibm:
            ax.add_patch(patches.FancyBboxPatch((x, y-4.2), w, 4.2, boxstyle="round,pad=0.4",
                                               fc='#0F62FE', ec='#0F62FE', lw=1, zorder=4))
            ax.text(x + 1.8, y - 1.5, title, fontsize=10.5, fontweight='bold', color='#FFFFFF', va='center', zorder=5)
            ax.text(x + 1.8, y - 3.0, "AI Agent & Orchestration Layer  (IBM Cloud)", fontsize=7.5, fontweight='medium', color='#DBEAFE', va='center', zorder=5)
            curr_y = y - 6.0
        else:
            ax.text(x + 1.8, y - 2.2, title, fontsize=9.8, fontweight='bold', color=title_col, va='center', zorder=4)
            if tag:
                tag_w = len(tag)*0.85 + 2.5
                ax.add_patch(patches.FancyBboxPatch((x + w - tag_w - 1.5, y - 3.2), tag_w, 2.0,
                                                   boxstyle="round,pad=0.2", fc='#F1F5F9', ec='#CBD5E1', lw=0.8, zorder=4))
                ax.text(x + w - tag_w/2 - 1.5, y - 2.2, tag, fontsize=6.8, fontweight='bold', color='#475569', ha='center', va='center', zorder=5)
            curr_y = y - 4.8

        # Items list
        for item in items:
            ax.plot(x + 2.2, curr_y, marker='o', markersize=3.2, color='#3B82F6', zorder=4)
            ax.text(x + 4.2, curr_y, item, fontsize=7.8, color='#334155', va='center', zorder=4)
            curr_y -= 2.35

    def draw_down_arrow(x, y_start, y_end, label=""):
        ax.annotate('', xy=(x, y_end), xytext=(x, y_start),
                    arrowprops=dict(arrowstyle="->,head_width=0.45,head_length=0.65", color="#64748B", lw=1.8), zorder=2)
        if label:
            ax.text(x + 1.2, (y_start + y_end)/2, label, fontsize=7.0, fontweight='semibold', color='#475569', va='center', zorder=3)

    def draw_right_arrow(x_start, x_end, y, label=""):
        ax.annotate('', xy=(x_end, y), xytext=(x_start, y),
                    arrowprops=dict(arrowstyle="->,head_width=0.45,head_length=0.65", color="#2563EB", lw=2.0), zorder=2)
        if label:
            ax.text((x_start + x_end)/2, y + 1.5, label, fontsize=7.4, fontweight='bold', color='#1D4ED8', ha='center', va='center', zorder=3)

    # ─────────────────────────────────────────────────────────────────────────
    # COLUMN HEADERS
    # ─────────────────────────────────────────────────────────────────────────
    col_x = [6, 43, 80, 117]
    col_w = 34

    ax.text(col_x[0], 76.0, "1. CANDIDATE & CLIENT LAYER", fontsize=8.5, fontweight='bold', color='#475569', va='center')
    ax.text(col_x[1], 76.0, "2. AI ORCHESTRATION & AGENT", fontsize=8.5, fontweight='bold', color='#0F62FE', va='center')
    ax.text(col_x[2], 76.0, "3. QUESTIONS & CANDIDATE FLOW", fontsize=8.5, fontweight='bold', color='#475569', va='center')
    ax.text(col_x[3], 76.0, "4. EVALUATION & REPORTING", fontsize=8.5, fontweight='bold', color='#475569', va='center')

    # ─────────────────────────────────────────────────────────────────────────
    # COLUMN 1: Candidate & Client & Backend
    # ─────────────────────────────────────────────────────────────────────────
    # Box 1: Candidate Profile
    draw_card(col_x[0], 73.5, col_w, 17, "Candidate Profile Ingestion", [
        "Candidate Identity & Target Role",
        "Experience Tier (Fresher to Senior)",
        "Core Skills & Target Company",
        "PDF / DOCX Resume Text Parsing",
        "Role-Specific Preferences"
    ], tag="Context")

    draw_down_arrow(col_x[0] + col_w/2, 56.0, 53.0)

    # Box 2: Web Application
    draw_card(col_x[0], 52.5, col_w, 17, "Web Application (Client SPA)", [
        "React 19 + TypeScript + Vite",
        "Candidate Flight Deck & Setup",
        "One-Question-at-a-Time Arena",
        "Audio Controls & Waveform Preview",
        "Markdown & Code Syntax Viewer"
    ], tag="React 19", border="#93C5FD")

    draw_down_arrow(col_x[0] + col_w/2, 35.0, 32.0)

    # Box 3: Backend REST API
    draw_card(col_x[0], 31.5, col_w, 17, "Backend / REST API Layer", [
        "Node.js 20 + Express 4 API",
        "Session & Interview History Management",
        "Resume Parser (pdf-parse / mammoth)",
        "SQLite Relational Persistence",
        "Prompt Builder & Response Normalizer"
    ], tag="Node.js")

    # ─────────────────────────────────────────────────────────────────────────
    # COLUMN 2: IBM watsonx Orchestrate & RAG Knowledge Base
    # ─────────────────────────────────────────────────────────────────────────
    # Prominent Box: IBM watsonx Orchestrate & Interview Trainer Agent
    draw_card(col_x[1], 73.5, col_w, 36.5, "IBM watsonx Orchestrate", [
        "Interview Trainer Agent Core",
        "Personalized Question Generation",
        "Real-Time 5-Rubric Answer Evaluation",
        "Reference Model Answer Synthesis",
        "Targeted Improvement Recommendations",
        "Interactive Conversational Career Coach",
        "Secure IBM IAM Token Authentication",
        "JSON Response Schema Normalization"
    ], is_ibm=True, border="#0F62FE", bg="#FFFFFF")

    # Bidirectional connector between Agent and RAG Knowledge Base
    ax.annotate('', xy=(col_x[1] + col_w/2, 31.8), xytext=(col_x[1] + col_w/2, 36.5),
                arrowprops=dict(arrowstyle="<->,head_width=0.45,head_length=0.65", color="#16A34A", lw=2.2), zorder=2)
    ax.text(col_x[1] + col_w/2 + 1.2, 34.2, "RAG Knowledge Grounding", fontsize=7.2, fontweight='bold', color='#15803D', va='center')

    # RAG Knowledge Base Box
    draw_card(col_x[1], 31.5, col_w, 17, "RAG Knowledge Base", [
        "Technical Standards (Python, SQL, System)",
        "HR Interview & Behavioral STAR Guides",
        "Role-Specific Competency Matrices",
        "Scoring Rubrics & Anti-Patterns",
        "Preparation Strategy Knowledge"
    ], tag="RAG Core", border="#22C55E", bg="#F0FDF4", title_col="#15803D")

    # ─────────────────────────────────────────────────────────────────────────
    # COLUMN 3: Question Delivery, Answers, & Voice Branch
    # ─────────────────────────────────────────────────────────────────────────
    # Box 6: Personalized Questions
    draw_card(col_x[2], 73.5, col_w, 17, "Personalized Questions", [
        "Technical Domain Questions (60%)",
        "HR & Cultural Alignment (20%)",
        "Behavioral STAR Questions (20%)",
        "Adaptive Difficulty Calibration",
        "Resume-Aware Custom Prompts"
    ], tag="Generated")

    draw_down_arrow(col_x[2] + col_w/2, 56.0, 53.0, "Candidate Responds")

    # Box 7: Candidate Answer
    draw_card(col_x[2], 52.5, col_w, 16.5, "Candidate Answer Submission", [
        "Text Input & Structured Responses",
        "Spoken Audio Response Capture",
        "Immediate Answer Submission",
        "Real-Time Response Packaging"
    ], tag="Multimodal")

    # Voice Branch Box (Supporting branch)
    ax.add_patch(patches.FancyBboxPatch((col_x[2], 14.5), col_w, 17.5, boxstyle="round,pad=0.4",
                                       fc='#FFFBEB', ec='#F59E0B', lw=1.2, linestyle='--', zorder=3))
    ax.text(col_x[2] + 1.8, 29.8, "IBM Voice Services Branch", fontsize=8.8, fontweight='bold', color='#B45309', va='center', zorder=4)
    ax.text(col_x[2] + 2.2, 27.0, "• Candidate Voice  ->  IBM Speech-to-Text", fontsize=7.6, color='#92400E', va='center', zorder=4)
    ax.text(col_x[2] + 4.8, 24.6, "-> Transcribed Text  ->  Agent", fontsize=7.4, fontweight='semibold', color='#B45309', va='center', zorder=4)
    ax.text(col_x[2] + 2.2, 21.6, "• Agent Question  ->  IBM Text-to-Speech", fontsize=7.6, color='#92400E', va='center', zorder=4)
    ax.text(col_x[2] + 4.8, 19.2, "-> Audio Synthesis  ->  AI Voice Response", fontsize=7.4, fontweight='semibold', color='#B45309', va='center', zorder=4)
    ax.text(col_x[2] + 2.2, 16.2, "• Browser Native Web Speech API Fallback", fontsize=7.0, fontstyle='italic', color='#78350F', va='center', zorder=4)

    # ─────────────────────────────────────────────────────────────────────────
    # COLUMN 4: Answer Evaluation & Performance Report
    # ─────────────────────────────────────────────────────────────────────────
    # Box 8: 5-Rubric AI Evaluation
    draw_card(col_x[3], 73.5, col_w, 22.5, "AI Answer Evaluation", [
        "1. Technical Accuracy (30% Weight)",
        "2. Relevance & Alignment (25% Weight)",
        "3. Clarity & Structure (20% Weight)",
        "4. Completeness & Depth (15% Weight)",
        "5. Communication Acumen (10% Weight)",
        "Reference Model Answer Comparison",
        "Itemized Positive & Missing Elements"
    ], tag="5 Rubrics", border="#60A5FA")

    draw_down_arrow(col_x[3] + col_w/2, 50.5, 47.5, "Session Aggregate")

    # Box 9: Performance Report
    draw_card(col_x[3], 47.0, col_w, 23.5, "Comprehensive Report Dossier", [
        "Overall Weighted Score (/10.0)",
        "Competency Breakdown Radar",
        "Demonstrated Candidate Strengths",
        "Identified Knowledge & Delivery Gaps",
        "Actionable Preparation Tips",
        "Exportable Summary Dossier",
        "Interview Readiness Level Verdict"
    ], tag="Final Dossier", border="#0F172A", bg="#F8FAFC")

    # ─────────────────────────────────────────────────────────────────────────
    # CROSS-COLUMN FLOW CONNECTORS
    # ─────────────────────────────────────────────────────────────────────────
    # Backend (Col 1) -> IBM watsonx Orchestrate (Col 2)
    ax.annotate('', xy=(col_x[1], 64.5), xytext=(col_x[0] + col_w, 23),
                arrowprops=dict(arrowstyle="->,head_width=0.45,head_length=0.65",
                                connectionstyle="arc3,rad=-0.15", color="#0F62FE", lw=2.2), zorder=2)
    ax.text(col_x[0] + col_w + 1.2, 48.5, "REST / Auth\nPayload", fontsize=7.2, fontweight='bold', color='#0F62FE', va='center')

    # Agent (Col 2) -> Questions (Col 3)
    draw_right_arrow(col_x[1] + col_w, col_x[2], 65.0, "Generates")

    # Candidate Answer (Col 3) -> Evaluation (Col 4)
    draw_right_arrow(col_x[2] + col_w, col_x[3], 65.0, "Evaluates")

    # ─────────────────────────────────────────────────────────────────────────
    # FOOTER: Platform Context & Development Note
    # ─────────────────────────────────────────────────────────────────────────
    ax.plot([6, 154], [10.5, 10.5], color='#CBD5E1', lw=1.2, zorder=2)

    # Left note: IBM Cloud
    ax.add_patch(patches.FancyBboxPatch((6, 3.8), 71, 5.2, boxstyle="round,pad=0.3",
                                       fc='#FFFFFF', ec='#CBD5E1', lw=1.0, zorder=3))
    ax.text(8.5, 6.4, "IBM Cloud:", fontsize=8.4, fontweight='bold', color='#0F172A', va='center', zorder=4)
    ax.text(21.5, 6.4, "Cloud environment supporting IBM watsonx Orchestrate & Speech services.",
            fontsize=7.8, color='#475569', va='center', zorder=4)

    # Right note: IBM Bob
    ax.add_patch(patches.FancyBboxPatch((83, 3.8), 71, 5.2, boxstyle="round,pad=0.3",
                                       fc='#FFFFFF', ec='#CBD5E1', lw=1.0, zorder=3))
    ax.text(85.5, 6.4, "IBM Bob:", fontsize=8.4, fontweight='bold', color='#0F172A', va='center', zorder=4)
    ax.text(96.5, 6.4, "Development environment used to build and refine the application & agent workflow.",
            fontsize=7.8, color='#475569', va='center', zorder=4)

    plt.tight_layout()
    
    # Save high-res PNG (300 DPI for ultra-crisp PowerPoint slides)
    png_path = "AI_Interview_Trainer_Architecture.png"
    plt.savefig(png_path, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    print(f"Generated: {png_path}")

    # Also save to docs/
    docs_png = "docs/AI_Interview_Trainer_Architecture.png"
    plt.savefig(docs_png, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    print(f"Generated: {docs_png}")

    # Save vector SVG format for direct PowerPoint editing
    svg_path = "AI_Interview_Trainer_Architecture.svg"
    plt.savefig(svg_path, format='svg', bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    print(f"Generated: {svg_path}")

if __name__ == '__main__':
    draw_architecture()
