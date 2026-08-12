"""
AI resume parsing pipeline (Phase 5).

This is a deliberately dependency-light, rule-based pipeline: pdfplumber for
text extraction, then regex/heuristic extraction and a transparent, explainable
scoring model. No opaque ML model is used, which means every number the
candidate sees (resume score, ATS score, missing keywords) can be explained
in the ai_feedback text — important for a feature that's telling people why
their resume might be getting rejected.

Swapping this out for a real NLP/LLM-based extractor later is a drop-in
replacement: everything downstream (Resume model, serializers, dashboard)
only depends on the shape of the dict this module returns.
"""
import re
from collections import Counter

import pdfplumber

EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_RE = re.compile(r"(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}")

SECTION_HEADERS = {
    "summary": ["summary", "objective", "profile"],
    "experience": ["experience", "work experience", "employment history", "professional experience"],
    "education": ["education", "academic background"],
    "skills": ["skills", "technical skills", "core competencies"],
    "projects": ["projects", "personal projects"],
    "certifications": ["certifications", "licenses", "certificates"],
}

# In-demand skills used for the generic (pre-application) keyword-gap check.
# Per-job keyword gaps are computed separately at application time against
# that job's actual `skills_required`.
BENCHMARK_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Django", "Node.js", "SQL",
    "PostgreSQL", "Docker", "Kubernetes", "AWS", "Git", "REST API", "GraphQL",
    "CI/CD", "Redis", "Testing", "Agile", "Communication", "Leadership",
]

ACTION_VERBS = [
    "led", "built", "designed", "developed", "implemented", "launched", "improved",
    "reduced", "increased", "managed", "created", "architected", "optimized",
    "delivered", "shipped", "mentored", "automated", "migrated",
]

COURSE_SUGGESTIONS = {
    "python": "Python for Everybody (Coursera)",
    "javascript": "The Complete JavaScript Course (Udemy)",
    "react": "React — The Complete Guide (Udemy)",
    "django": "Django for Everybody (Coursera)",
    "sql": "SQL for Data Science (Coursera)",
    "docker": "Docker & Kubernetes: The Practical Guide (Udemy)",
    "aws": "AWS Certified Cloud Practitioner (AWS Training)",
    "typescript": "Understanding TypeScript (Udemy)",
    "node.js": "Node.js, Express, MongoDB Bootcamp (Udemy)",
    "git": "Git & GitHub Bootcamp (Udemy)",
    "testing": "Test-Driven Development Fundamentals (Pluralsight)",
    "leadership": "Leading People and Teams (Coursera)",
    "communication": "Improving Communication Skills (Coursera)",
}


def extract_text(file_obj) -> str:
    """Extract raw text from a PDF file object (Django FieldFile)."""
    text_parts = []
    with pdfplumber.open(file_obj) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_contact_info(text: str) -> dict:
    email_match = EMAIL_RE.search(text)
    phone_match = PHONE_RE.search(text)

    # Name heuristic: first non-empty line, title-cased, 1-4 words, no digits/@ symbol.
    name = ""
    for line in text.strip().splitlines()[:5]:
        line = line.strip()
        if not line or "@" in line or any(ch.isdigit() for ch in line):
            continue
        words = line.split()
        if 1 <= len(words) <= 4 and line[0].isupper():
            name = line
            break

    return {
        "name": name,
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(0) if phone_match else "",
    }


def _find_sections(text: str) -> dict:
    """Splits resume text into named sections based on common headers."""
    lines = text.splitlines()
    header_positions = []  # (line_index, section_key)

    for i, line in enumerate(lines):
        cleaned = line.strip().lower().rstrip(":")
        for key, aliases in SECTION_HEADERS.items():
            if cleaned in aliases:
                header_positions.append((i, key))
                break

    sections = {}
    for idx, (line_no, key) in enumerate(header_positions):
        end = header_positions[idx + 1][0] if idx + 1 < len(header_positions) else len(lines)
        sections[key] = "\n".join(lines[line_no + 1:end]).strip()
    return sections


def extract_skills(text: str, known_skill_names: list[str]) -> list[str]:
    """Matches known skill names against the resume text (whole-word,
    case-insensitive). `known_skill_names` should come from the live
    Skill table so new skills are picked up without a code change."""
    found = []
    lowered = text.lower()
    for skill in known_skill_names:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill.lower()) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, lowered):
            found.append(skill)
    return sorted(set(found))


def extract_education(section_text: str) -> list[dict]:
    """Best-effort line-grouping: each non-empty line becomes one entry's
    raw text, since resume education formatting varies too much for a
    single reliable structured pattern without full NLP."""
    entries = []
    for line in section_text.splitlines():
        line = line.strip()
        if line:
            entries.append({"raw": line})
    return entries[:6]


def extract_experience(section_text: str) -> list[dict]:
    entries = []
    for line in section_text.splitlines():
        line = line.strip()
        if line:
            entries.append({"raw": line})
    return entries[:10]


def compute_resume_score(*, sections: dict, skills: list[str], contact: dict, word_count: int) -> int:
    """Weighted 0-100 completeness/strength score. Every weight here is
    intentionally simple and documented so it can be explained in ai_feedback."""
    score = 0
    if contact["email"]:
        score += 10
    if contact["phone"]:
        score += 5
    if contact["name"]:
        score += 5
    if sections.get("summary"):
        score += 10
    if sections.get("experience"):
        score += 20
    if sections.get("education"):
        score += 15
    if sections.get("projects") or sections.get("certifications"):
        score += 10
    score += min(len(skills), 10) * 1.5  # up to 15 pts for skill breadth
    if 250 <= word_count <= 1000:
        score += 10  # penalize resumes that are too thin or too dense
    return min(round(score), 100)


def compute_ats_score(*, text: str, contact: dict, sections: dict) -> int:
    """0-100 — approximates how cleanly an applicant tracking system would
    parse this resume: standard sections, contact info, action-verb usage,
    reasonable length, and avoidance of characters PDF-text extraction
    typically mangles (tables/columns/graphics)."""
    score = 0
    if contact["email"]:
        score += 20
    if contact["phone"]:
        score += 10
    if sections.get("experience"):
        score += 20
    if sections.get("education"):
        score += 15
    if sections.get("skills"):
        score += 15

    word_count = len(text.split())
    if 250 <= word_count <= 900:
        score += 10

    verb_hits = sum(1 for verb in ACTION_VERBS if re.search(rf"\b{verb}\b", text.lower()))
    score += min(verb_hits, 5) * 2  # up to 10 pts

    return min(round(score), 100)


def keyword_analysis(skills_found: list[str]) -> tuple[list[str], list[str]]:
    found_lower = {s.lower() for s in skills_found}
    matched = [s for s in BENCHMARK_SKILLS if s.lower() in found_lower]
    missing = [s for s in BENCHMARK_SKILLS if s.lower() not in found_lower]
    return matched, missing


def recommend_courses(missing_skills: list[str], limit: int = 5) -> list[dict]:
    recs = []
    for skill in missing_skills:
        course = COURSE_SUGGESTIONS.get(skill.lower())
        if course:
            recs.append({"skill": skill, "course": course})
        if len(recs) >= limit:
            break
    return recs


def build_feedback(*, resume_score: int, ats_score: int, sections: dict, missing_skills: list[str]) -> str:
    notes = []
    if resume_score >= 80:
        notes.append("Strong resume overall — well-structured with good detail.")
    elif resume_score >= 55:
        notes.append("Solid foundation, but a few gaps are holding your score back.")
    else:
        notes.append("This resume needs some structural work before it's ready to send out.")

    if not sections.get("summary"):
        notes.append("Add a brief summary at the top — recruiters skim this first.")
    if not sections.get("experience"):
        notes.append("No clear experience section was detected — make sure it's labeled clearly (e.g. \"Experience\").")
    if not sections.get("skills"):
        notes.append("Add a dedicated skills section so ATS systems can parse them reliably.")
    if ats_score < 60:
        notes.append("Some formatting may not survive ATS parsing — avoid tables, columns, and graphics.")
    if missing_skills:
        top_missing = ", ".join(missing_skills[:3])
        notes.append(f"Consider highlighting or building experience in: {top_missing}.")

    return " ".join(notes)


def parse_resume_file(file_obj, known_skill_names: list[str]) -> dict:
    """Top-level entry point: runs the full pipeline and returns a dict
    matching the Resume model's AI-output fields."""
    text = extract_text(file_obj)
    contact = extract_contact_info(text)
    sections = _find_sections(text)
    skills = extract_skills(text, known_skill_names)
    education = extract_education(sections.get("education", ""))
    experience = extract_experience(sections.get("experience", ""))
    word_count = len(text.split())

    resume_score = compute_resume_score(sections=sections, skills=skills, contact=contact, word_count=word_count)
    ats_score = compute_ats_score(text=text, contact=contact, sections=sections)
    matched_keywords, missing_keywords = keyword_analysis(skills)
    courses = recommend_courses(missing_keywords)
    feedback = build_feedback(
        resume_score=resume_score, ats_score=ats_score, sections=sections, missing_skills=missing_keywords,
    )

    return {
        "extracted_name": contact["name"],
        "extracted_email": contact["email"],
        "extracted_phone": contact["phone"],
        "extracted_skills": skills,
        "extracted_education": education,
        "extracted_experience": experience,
        "resume_score": resume_score,
        "ats_score": ats_score,
        "keyword_matches": matched_keywords,
        "missing_keywords": missing_keywords,
        "recommended_courses": courses,
        "ai_feedback": feedback,
    }


def compute_job_match_score(*, candidate_skill_names: set[str], job_skill_names: set[str],
                             candidate_years: int, job_experience_level: str) -> int:
    """Job-match percentage for a specific application: skill overlap
    (weighted most heavily) plus an experience-level fit adjustment."""
    if not job_skill_names:
        skill_score = 50  # no listed requirements — neutral baseline
    else:
        overlap = len(candidate_skill_names & job_skill_names)
        skill_score = round((overlap / len(job_skill_names)) * 80)

    level_years = {"entry": 0, "mid": 2, "senior": 5, "lead": 8}
    expected = level_years.get(job_experience_level, 2)
    diff = candidate_years - expected
    if diff >= 0:
        experience_score = 20 if diff <= 3 else 15
    else:
        experience_score = max(0, 20 + diff * 5)

    return min(round(skill_score + experience_score), 100)
