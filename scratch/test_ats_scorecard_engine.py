import sys
import json
import re

print("=" * 60)
print("TESTING P1.3 GRANULAR ATS HEALTH SCORECARD ENGINE")
print("=" * 60)

ATS_KEYWORD_TAXONOMY = [
    "ATS", "Recruitment", "AI", "Leadership", "Analytics", "Optimization",
    "Sourcing", "Talent Acquisition", "Screening", "Interviews", "Python",
    "SQL", "Management", "Operations", "Compliance", "Strategy", "Execution",
    "Performance", "Stakeholders", "Reporting", "Cross-Functional", "Roadmap",
    "Architecture", "Scalability"
]

STRONG_ACTION_VERB_REGEX = re.compile(
    r'^(spearheaded|engineered|architected|optimized|developed|orchestrated|accelerated|streamlined|delivered|implemented|led|built|automated|managed|designed|scaled|launched|formulated|executed|mentored|drove|established|reduced|increased|boosted|transformed|negotiated|authored|published|conducted|standardized|secured|championed|pioneered|migrated|centralized|revamped|instituted|directed|supervised|coordinated|achieved)',
    re.IGNORECASE
)

METRIC_REGEX = re.compile(
    r'(\b\d+([,.]\d+)?\s*(%|percent|k|m|b|x|users|clients|candidates|hires|engineers|teams|days|hours|minutes|seconds|ms|queries|requests|rps|tps|scale|revenue|budget|arr|gmv)\b|\$\s*\d+|\b\d{2,}\b)',
    re.IGNORECASE
)

def calculate_granular_ats_scorecard(resume, target_keywords=None):
    if not resume:
        return {
            "overallScore": 0,
            "grade": "Incomplete",
            "dimensions": {}
        }

    full_text = json.dumps(resume).lower()
    all_bullets = []
    for exp in resume.get("experiences", []):
        all_bullets.extend(exp.get("bullets", []))
    total_bullets = len(all_bullets)

    # 1. Keywords (25%)
    kw_taxonomy = target_keywords if target_keywords else ATS_KEYWORD_TAXONOMY
    matched_kws = [kw for kw in kw_taxonomy if kw.lower() in full_text]
    kw_ratio = len(matched_kws) / len(kw_taxonomy) if kw_taxonomy else 1
    keyword_score = min(100, round(kw_ratio * 100))

    # 2. Action Verbs (20%)
    action_verb_count = sum(1 for b in all_bullets if STRONG_ACTION_VERB_REGEX.match(b.strip()))
    action_verb_ratio = (action_verb_count / total_bullets) if total_bullets > 0 else 0
    action_verb_score = min(100, round(action_verb_ratio * 100))

    # 3. Metrics (20%)
    metric_count = sum(1 for b in all_bullets if METRIC_REGEX.search(b))
    metric_ratio = (metric_count / total_bullets) if total_bullets > 0 else 0
    metric_score = min(100, round(min(1.0, metric_ratio / 0.40) * 100))

    # 4. Structure (20%)
    structure_points = 0
    max_points = 5
    if resume.get("header", {}).get("name") and (resume.get("contact", {}).get("email") or resume.get("contact", {}).get("phone")):
        structure_points += 1
    if resume.get("header", {}).get("summary") and len(resume.get("header", {}).get("summary")) > 20:
        structure_points += 1
    if resume.get("experiences") and all(e.get("role") and (e.get("company") or e.get("dates")) for e in resume.get("experiences")):
        structure_points += 1
    if resume.get("education") or resume.get("certifications"):
        structure_points += 1
    if resume.get("skills") and len(resume.get("skills")) >= 3:
        structure_points += 1
    structure_score = round((structure_points / max_points) * 100)

    # 5. Brevity (15%)
    optimal_count = sum(1 for b in all_bullets if 10 <= len(b.strip().split()) <= 35)
    brevity_ratio = (optimal_count / total_bullets) if total_bullets > 0 else 1
    brevity_score = min(100, round(brevity_ratio * 100))

    overall_score = round(
        (keyword_score * 0.25) +
        (action_verb_score * 0.20) +
        (metric_score * 0.20) +
        (structure_score * 0.20) +
        (brevity_score * 0.15)
    )

    grade = "Excellent"
    if overall_score < 60:
        grade = "Needs Improvement"
    elif overall_score < 75:
        grade = "Good"
    elif overall_score < 88:
        grade = "Very Good"

    return {
        "overallScore": overall_score,
        "grade": grade,
        "dimensions": {
            "keywords": {"score": keyword_score, "matched": len(matched_kws)},
            "actionVerbs": {"score": action_verb_score, "count": action_verb_count},
            "metrics": {"score": metric_score, "count": metric_count},
            "structure": {"score": structure_score, "points": structure_points},
            "brevity": {"score": brevity_score, "optimal": optimal_count}
        },
        "totalBullets": total_bullets
    }

# RUN TEST 1: Baseline Candidate Evaluation
test_resume = {
    "header": {
        "name": "Rohit Kumar",
        "title": "Lead Talent Acquisition Specialist",
        "summary": "Accomplished Talent Acquisition Lead with 8+ years driving technical recruitment, ATS optimization, and AI sourcing strategies."
    },
    "contact": {
        "email": "rohit@example.com",
        "phone": "+91 9876543210",
        "location": "Bengaluru, India"
    },
    "skills": ["Technical Sourcing", "ATS Optimization", "Talent Acquisition", "Leadership", "Analytics", "Python", "SQL"],
    "experiences": [
        {
            "role": "Lead Talent Acquisition Partner",
            "company": "Global Tech Solutions",
            "dates": "2021 – Present",
            "bullets": [
                "Spearheaded enterprise recruiting strategy across 4 business units, hiring 120+ software engineers annually.",
                "Optimized ATS candidate workflow, reducing time-to-hire by 34% and saving $450k in agency spend.",
                "Orchestrated cross-functional sourcing sprints using Python analytics and AI candidate matching platforms."
            ]
        },
        {
            "role": "Senior Technical Recruiter",
            "company": "Apex Innovations",
            "dates": "2018 – 2021",
            "bullets": [
                "Engineered scalable recruiting pipelines for cloud infrastructure teams, achieving 98% offer acceptance rate.",
                "Conducted 500+ structured technical interviews and standardized candidate evaluation scorecards."
            ]
        }
    ],
    "education": [{"degree": "Bachelor of Technology", "institution": "VTU"}],
    "certifications": ["Certified Diversity Recruiter (CDR)"]
}

scorecard = calculate_granular_ats_scorecard(test_resume)
print(f"Candidate Overall Score: {scorecard['overallScore']}% ({scorecard['grade']})")
print(f"  • Keywords Score: {scorecard['dimensions']['keywords']['score']}% ({scorecard['dimensions']['keywords']['matched']} matched)")
print(f"  • Action Verbs Score: {scorecard['dimensions']['actionVerbs']['score']}% ({scorecard['dimensions']['actionVerbs']['count']}/5 bullets)")
print(f"  • Metrics Score: {scorecard['dimensions']['metrics']['score']}% ({scorecard['dimensions']['metrics']['count']}/5 bullets)")
print(f"  • Structure Score: {scorecard['dimensions']['structure']['score']}% ({scorecard['dimensions']['structure']['points']}/5 sections)")
print(f"  • Brevity Score: {scorecard['dimensions']['brevity']['score']}% ({scorecard['dimensions']['brevity']['optimal']}/5 optimal)")

assert scorecard["overallScore"] >= 80, f"Expected overall score >= 80, got {scorecard['overallScore']}"
assert scorecard["dimensions"]["structure"]["score"] == 100, "Expected structure score 100%"
assert scorecard["dimensions"]["actionVerbs"]["count"] == 5, f"Expected 5 action verbs, got {scorecard['dimensions']['actionVerbs']['count']}"
assert scorecard["dimensions"]["metrics"]["count"] >= 3, "Expected at least 3 metrics bullets"

print("\n--- 1. DETERMINISTIC DIMENSIONAL AUDIT: PASS ---")

# RUN TEST 2: Incomplete Resume Edge Case
incomplete_resume = {
    "header": {"name": "Incomplete Candidate"},
    "experiences": []
}
inc_scorecard = calculate_granular_ats_scorecard(incomplete_resume)
print(f"Incomplete Candidate Score: {inc_scorecard['overallScore']}% ({inc_scorecard['grade']})")
assert inc_scorecard["overallScore"] < 50, "Expected low score for incomplete resume"
assert inc_scorecard["dimensions"]["structure"]["score"] < 40, "Expected low structure score"

print("--- 2. INCOMPLETE RESUME SAFE-STOP AUDIT: PASS ---")

# RUN TEST 3: Zero-Mutation Invariant
orig_hash = hash(json.dumps(test_resume, sort_keys=True))
_ = calculate_granular_ats_scorecard(test_resume)
post_hash = hash(json.dumps(test_resume, sort_keys=True))
assert orig_hash == post_hash, "MUTATION DETECTED: calculate_granular_ats_scorecard modified input resume!"
print("--- 3. ZERO-MUTATION RESUME INVARIANT: PASS ---")

print("=" * 60)
print("P1.3 GRANULAR ATS SCORECARD UNIT SUITE: 100% PASS")
print("=" * 60)
