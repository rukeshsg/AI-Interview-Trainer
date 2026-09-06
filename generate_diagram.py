import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

# Set clean presentation fonts
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'Helvetica', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

def draw_clean_architecture():
    # 16:9 ratio high-resolution figure (1920x1080 equivalent at high DPI)
    fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 160)
    ax.set_ylim(0, 90)
    ax.axis('off')

    # ─────────────────────────────────────────────────────────────────────────
    # HEADER (Clean, Professional, Minimal)
    # ─────────────────────────────────────────────────────────────────────────
    ax.text(8, 85.5, "AI Interview Trainer", fontsize=19, fontweight='bold', color='#0F172A', va='center')
    ax.text(48, 85.5, "– System Architecture & Flow", fontsize=15, fontweight='semibold', color='#2563EB', va='center')
    ax.text(8, 82.5, "Problem Statement No. 22: Interview Trainer Agent  |  IBM University Engagement / AICTE Project Track", 
            fontsize=9.2, color='#64748B', va='center')

    # Header Badges
    def draw_badge(x, y, text, bg, border, fg):
        bw = len(text) * 0.9 + 4.0
        ax.add_patch(FancyBboxPatch((x, y-1.5), bw, 3.0, boxstyle="round,pad=0.2", fc=bg, ec=border, lw=1.0, zorder=3))
        ax.text(x + bw/2, y, text, fontsize=7.5, fontweight='bold', color=fg, ha='center', va='center', zorder=4)

    draw_badge(106, 84.0, "IBM watsonx Orchestrate", "#EFF6FF", "#BFDBFE", "#1D4ED8")
    draw_badge(134, 84.0, "RAG Knowledge Base", "#F0FDF4", "#BBF7D0", "#15803D")

    # Header Divider Line
    ax.plot([8, 152], [80.0, 80.0], color='#E2E8F0', lw=1.2, zorder=2)

    # ─────────────────────────────────────────────────────────────────────────
    # DRAWING UTILITIES
    # ─────────────────────────────────────────────────────────────────────────
    def draw_box(x, y, w, h, title, subtitle="", items=None, fc="#FFFFFF", ec="#CBD5E1", tc="#0F172A", is_highlight=False, hl_color="#0F62FE"):
        # Base box
        ax.add_patch(FancyBboxPatch((x, y - h), w, h, boxstyle="round,pad=0.35",
                                   fc=fc, ec=hl_color if is_highlight else ec, lw=2.0 if is_highlight else 1.2, zorder=3))
        
        # Header text
        if subtitle:
            ax.text(x + w/2, y - 2.2, title, fontsize=9.2, fontweight='bold', color=tc, ha='center', va='center', zorder=4)
            ax.text(x + w/2, y - 4.2, subtitle, fontsize=7.2, fontweight='medium', color='#64748B', ha='center', va='center', zorder=4)
            curr_y = y - 6.4
        else:
            ax.text(x + w/2, y - (h/2 if not items else 2.5), title, fontsize=9.2, fontweight='bold', color=tc, ha='center', va='center', zorder=4)
            curr_y = y - 4.8

        # Bullet items
        if items:
            for item in items:
                ax.plot(x + 2.5, curr_y, marker='o', markersize=2.8, color=hl_color if is_highlight else '#3B82F6', zorder=4)
                ax.text(x + 4.2, curr_y, item, fontsize=7.3, color='#334155', va='center', zorder=4)
                curr_y -= 2.1

    def draw_arrow(p1, p2, label="", color="#64748B", lw=1.6, style="->", rad=0.0):
        ax.annotate('', xy=p2, xytext=p1,
                    arrowprops=dict(arrowstyle=f"{style},head_width=0.45,head_length=0.65",
                                    connectionstyle=f"arc3,rad={rad}", color=color, lw=lw), zorder=2)
        if label:
            mx = (p1[0] + p2[0]) / 2
            my = (p1[1] + p2[1]) / 2
            lbl_w = len(label) * 0.72 + 2.0
            ax.add_patch(FancyBboxPatch((mx - lbl_w/2, my - 1.1), lbl_w, 2.2, boxstyle="round,pad=0.1",
                                       fc='#FFFFFF', ec='#E2E8F0', lw=0.8, zorder=5))
            ax.text(mx, my, label, fontsize=6.8, fontweight='bold', color=color, ha='center', va='center', zorder=6)

    # ─────────────────────────────────────────────────────────────────────────
    # LEFT PIPELINE: CANDIDATE -> APP -> BACKEND -> IBM AGENT & RAG
    # ─────────────────────────────────────────────────────────────────────────
    left_x = 10
    box_w = 42

    # Step 1: Candidate Profile / Resume
    draw_box(left_x, 76.5, box_w, 9.5, "1. Candidate Profile & Resume", "", [
        "Candidate Identity, Target Role & Level",
        "Skills, Target Company & Preferences",
        "PDF / DOCX Resume Text Ingestion"
    ], fc="#F8FAFC", ec="#94A3B8")

    draw_arrow((left_x + box_w/2, 67.0), (left_x + box_w/2, 63.5))

    # Step 2: React Web Application
    draw_box(left_x, 63.5, box_w, 9.5, "2. React Web Application (Client)", "React 19  •  TypeScript  •  Vite  •  Tailwind CSS", [
        "Candidate Flight Deck & Setup Matrix",
        "One-Question-at-a-Time Mock Arena",
        "AI Coaching Assistant Chat Interface"
    ], fc="#F0F9FF", ec="#7DD3FC", tc="#0369A1")

    draw_arrow((left_x + box_w/2, 54.0), (left_x + box_w/2, 50.5), label="HTTPS REST")

    # Step 3: Node.js Backend / REST API
    draw_box(left_x, 50.5, box_w, 9.5, "3. Node.js Backend / REST API", "Node.js 20  •  Express 4  •  SQLite Persistence", [
        "Interview Session & History Manager",
        "Resume Parser Module (pdf-parse / mammoth)",
        "Prompt Engine & JSON Schema Normalizer"
    ], fc="#F8FAFC", ec="#94A3B8")

    draw_arrow((left_x + box_w/2, 41.0), (left_x + box_w/2, 37.5), label="IAM Auth & Chat REST", color="#0F62FE")

    # Step 4: IBM watsonx Orchestrate (Prominent Box)
    draw_box(left_x, 37.5, box_w, 11.5, "4. IBM watsonx Orchestrate", "AI Agent & Orchestration Layer (IBM Cloud)", [
        "Live REST Endpoint: /chat/completions",
        "IAM Token Exchange & Security Pipeline",
        "Autonomous Agent Execution Engine"
    ], fc="#EFF6FF", ec="#0F62FE", tc="#0F62FE", is_highlight=True, hl_color="#0F62FE")

    draw_arrow((left_x + box_w/2, 26.0), (left_x + box_w/2, 22.5), color="#0F62FE")

    # Step 5: Interview Trainer Agent
    draw_box(left_x, 22.5, box_w, 10.5, "5. Interview Trainer Agent", "Configured Agent Core", [
        "Personalized Question Generation",
        "Real-Time 5-Rubric Answer Evaluation",
        "Model Answer Guidance & Suggestions"
    ], fc="#EFF6FF", ec="#0F62FE", tc="#1E3A8A", is_highlight=True, hl_color="#0F62FE")

    # ─────────────────────────────────────────────────────────────────────────
    # CENTER: RAG KNOWLEDGE BASE (Connected Bidirectionally to Agent)
    # ─────────────────────────────────────────────────────────────────────────
    rag_x = 60
    rag_w = 40

    # Bidirectional connector Agent <-> RAG Knowledge Base
    draw_arrow((left_x + box_w, 17.2), (rag_x, 17.2), style="<->", label="RAG Grounding", color="#16A34A", lw=2.0)

    # Step 6: RAG Knowledge Base (Prominent Box)
    draw_box(rag_x, 24.5, rag_w, 14.5, "RAG Knowledge Base", "Curated Domain Grounding Layer", [
        "Technical Knowledge (Python, SQL, System)",
        "HR & Cultural Alignment Benchmarks",
        "Behavioral STAR Method Evaluation Guides",
        "5-Dimension Scoring Rubrics & Matrices",
        "Interview Preparation Strategies"
    ], fc="#F0FDF4", ec="#22C55E", tc="#15803D", is_highlight=True, hl_color="#22C55E")

    # ─────────────────────────────────────────────────────────────────────────
    # RIGHT PIPELINE: QUESTIONS -> CANDIDATE ANSWER -> EVALUATION -> REPORT
    # ─────────────────────────────────────────────────────────────────────────
    right_x = 108
    right_w = 44

    # Connect Agent -> Questions
    draw_arrow((left_x + box_w, 20.5), (right_x, 72.0), label="Generates Questions", color="#2563EB", lw=2.0, rad=-0.25)

    # Step 7: Interview Questions
    draw_box(right_x, 76.5, right_w, 9.5, "6. Interview Questions", "Personalized & Adaptive Delivery", [
        "Technical Questions (60% Weight)",
        "HR & Cultural Fit Questions (20% Weight)",
        "Behavioral STAR Questions (20% Weight)",
        "Difficulty Calibration (Easy, Medium, Hard)"
    ], fc="#F8FAFC", ec="#94A3B8")

    draw_arrow((right_x + right_w/2, 67.0), (right_x + right_w/2, 63.5), label="Candidate Responds")

    # Step 8: Candidate Answer
    draw_box(right_x, 63.5, right_w, 8.5, "7. Candidate Answer", "Multimodal Response Input", [
        "Text Response & Code Entry",
        "Spoken Audio Response Capture",
        "Real-Time Response Submission"
    ], fc="#F8FAFC", ec="#94A3B8")

    draw_arrow((right_x + right_w/2, 55.0), (right_x + right_w/2, 51.5))

    # Step 9: AI Answer Evaluation
    draw_box(right_x, 51.5, right_w, 12.0, "8. AI Answer Evaluation", "5 Standardized Competency Rubrics", [
        "Technical Accuracy (30% Weight)",
        "Relevance & Direct Alignment (25% Weight)",
        "Clarity & Structure (20% Weight)",
        "Completeness & Depth (15% Weight)",
        "Communication Acumen (10% Weight)"
    ], fc="#EFF6FF", ec="#3B82F6", tc="#1D4ED8")

    draw_arrow((right_x + right_w/2, 39.5), (right_x + right_w/2, 36.0), label="Session Aggregation")

    # Step 10: Performance Report
    draw_box(right_x, 36.0, right_w, 11.5, "9. Performance Report Dossier", "Final Executive Assessment", [
        "Overall Weighted Score (/10.0)",
        "Demonstrated Strengths & Positives",
        "Identified Growth Areas & Gaps",
        "Role-Specific Improvement Tips",
        "Interview Readiness Level Verdict"
    ], fc="#F8FAFC", ec="#0F172A", tc="#0F172A")

    # ─────────────────────────────────────────────────────────────────────────
    # SUPPORTING VOICE BRANCH (Center Middle)
    # ─────────────────────────────────────────────────────────────────────────
    voice_x = 58
    voice_y = 66.5
    voice_w = 44
    voice_h = 16.0

    ax.add_patch(FancyBboxPatch((voice_x, voice_y - voice_h), voice_w, voice_h, boxstyle="round,pad=0.3",
                               fc='#FFFBEB', ec='#F59E0B', lw=1.2, linestyle='--', zorder=3))
    
    ax.text(voice_x + voice_w/2, voice_y - 2.0, "Supporting Voice Services Branch", fontsize=8.8, fontweight='bold', color='#B45309', ha='center', va='center', zorder=4)
    ax.text(voice_x + voice_w/2, voice_y - 3.8, "IBM Speech-to-Text  ->  Agent  ->  IBM Text-to-Speech", fontsize=7.2, fontweight='semibold', color='#D97706', ha='center', va='center', zorder=4)

    # Box inside voice: STT
    draw_box(voice_x + 2.0, voice_y - 5.5, voice_w - 4.0, 4.2, "IBM Speech-to-Text (STT)", "Candidate Voice -> Transcribed Text -> Agent", fc="#FFFFFF", ec="#FDE68A", tc="#92400E")
    
    # Box inside voice: TTS
    draw_box(voice_x + 2.0, voice_y - 10.5, voice_w - 4.0, 4.2, "IBM Text-to-Speech (TTS)", "Agent Question -> Audio Synthesis -> AI Voice", fc="#FFFFFF", ec="#FDE68A", tc="#92400E")

    # Connect Voice box to Agent and Candidate Answer
    draw_arrow((voice_x + voice_w, voice_y - 7.5), (right_x, 60.0), style="<->", color="#F59E0B", lw=1.2)
    draw_arrow((left_x + box_w, 22.0), (voice_x, voice_y - 12.0), style="<->", color="#F59E0B", lw=1.2, rad=0.15)

    # ─────────────────────────────────────────────────────────────────────────
    # FOOTER LABELS (IBM Cloud & IBM Bob)
    # ─────────────────────────────────────────────────────────────────────────
    ax.plot([8, 152], [9.0, 9.0], color='#E2E8F0', lw=1.2, zorder=2)

    # Left note: IBM Cloud
    ax.add_patch(FancyBboxPatch((8, 3.0), 68, 4.8, boxstyle="round,pad=0.2", fc='#F8FAFC', ec='#CBD5E1', lw=1.0, zorder=3))
    ax.text(10.5, 5.4, "IBM Cloud:", fontsize=8.2, fontweight='bold', color='#0F172A', va='center', zorder=4)
    ax.text(22.5, 5.4, "Cloud environment supporting IBM watsonx Orchestrate & Speech services.",
            fontsize=7.6, color='#475569', va='center', zorder=4)

    # Right note: IBM Bob
    ax.add_patch(FancyBboxPatch((84, 3.0), 68, 4.8, boxstyle="round,pad=0.2", fc='#F8FAFC', ec='#CBD5E1', lw=1.0, zorder=3))
    ax.text(86.5, 5.4, "IBM Bob:", fontsize=8.2, fontweight='bold', color='#0F172A', va='center', zorder=4)
    ax.text(97.5, 5.4, "Development environment used to build and refine the application & agent workflow.",
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
    draw_clean_architecture()
