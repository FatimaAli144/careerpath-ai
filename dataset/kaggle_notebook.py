# ============================================================
# CareerPath AI — Kaggle Data Processing Notebook
# ============================================================
# HOW TO USE:
# 1. Go to https://www.kaggle.com and create an account
# 2. Open the dataset:
#    https://www.kaggle.com/datasets/asaniczka/1-3m-linkedin-jobs-and-skills-2024
# 3. Click "New Notebook" on that dataset page
# 4. Paste this entire script into a code cell
# 5. Click "Run All"
# 6. Download the output file "careerpath_jobs_processed.csv"
# 7. Place that file in your project's dataset/ folder
# 8. Rename it to careerpath_jobs.csv (replace the existing one)
# ============================================================

import pandas as pd
import json
import random
import re

random.seed(42)

# ── Load dataset ─────────────────────────────────────────────────────────────
print("Loading job postings from Kaggle dataset...")
df = pd.read_csv('/kaggle/input/1-3m-linkedin-jobs-and-skills-2024/job_postings.csv')
print(f"Total jobs loaded: {len(df):,}")
print("Columns:", list(df.columns))

# ── Filter for tech / relevant roles ─────────────────────────────────────────
TECH_KEYWORDS = [
    'engineer', 'developer', 'analyst', 'designer', 'data', 'machine learning',
    'python', 'java', 'react', 'frontend', 'backend', 'full stack', 'fullstack',
    'devops', 'cloud', 'mobile', 'android', 'ios', 'flutter', 'product manager',
    'software', 'qa', 'quality', 'security', 'artificial intelligence', 'ai ',
    ' ml ', 'nlp', 'blockchain', 'networking', 'database', 'ui/ux', 'ui ux',
    'content', 'marketing', 'business analyst', 'scrum', 'agile',
]

pattern = '|'.join(TECH_KEYWORDS)
title_col = 'title' if 'title' in df.columns else df.columns[1]
tech_df = df[df[title_col].fillna('').str.lower().str.contains(pattern, na=False)]
print(f"Tech/relevant jobs found: {len(tech_df):,}")

# ── Sample a manageable number ────────────────────────────────────────────────
SAMPLE_SIZE = 500
sample = tech_df.sample(min(SAMPLE_SIZE, len(tech_df)), random_state=42).copy()
print(f"Sampled: {len(sample)} jobs")

# ── Skill extraction from description / skills fields ────────────────────────
KNOWN_SKILLS = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Next.js',
    'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel',
    'Java', 'C++', 'C#', 'Go', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Flutter',
    'React Native', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Git', 'Linux',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Keras', 'OpenCV',
    'Tableau', 'Power BI', 'Excel', 'Figma', 'Adobe XD', 'Photoshop',
    'GraphQL', 'REST APIs', 'Microservices', 'Agile', 'Scrum', 'Jira',
    'Machine Learning', 'Deep Learning', 'NLP', 'Data Analysis', 'Statistics',
    'Communication', 'Problem Solving', 'Leadership', 'Project Management',
]

def extract_skills(row):
    text = ' '.join([
        str(row.get('description', '') or ''),
        str(row.get('skills_desc', '') or ''),
        str(row.get('title', '') or ''),
    ]).lower()
    matched = [s for s in KNOWN_SKILLS if s.lower() in text]
    if not matched:
        matched = ['Communication', 'Problem Solving']
    return matched[:6]

# ── Salary mapping (LinkedIn uses USD ranges, convert to ₨ approximate) ──────
def format_salary(row):
    low = row.get('min_salary') or row.get('salary_low') or row.get('min_amount')
    high = row.get('max_salary') or row.get('salary_high') or row.get('max_amount')
    try:
        low = float(low)
        high = float(high)
        # LinkedIn salary is annual USD — convert to monthly ₨ (1 USD ≈ 280 ₨, annual/12)
        low_pkr = int((low / 12) * 280 / 1000)
        high_pkr = int((high / 12) * 280 / 1000)
        return f"₨ {low_pkr}–{high_pkr}k"
    except Exception:
        return "₨ Negotiable"

# ── Job type mapping ──────────────────────────────────────────────────────────
def map_type(row):
    t = str(row.get('formatted_work_type', '') or row.get('work_type', '') or '').lower()
    if 'full' in t:   return 'Full-time'
    if 'part' in t:   return 'Part-time'
    if 'intern' in t: return 'Internship'
    if 'contract' in t or 'freelance' in t: return 'Contract'
    return 'Full-time'

# ── Experience level ──────────────────────────────────────────────────────────
def map_experience(row):
    e = str(row.get('formatted_experience_level', '') or '').lower()
    if 'entry' in e or 'junior' in e: return '0-2 years'
    if 'mid'   in e or 'assoc'  in e: return '2-5 years'
    if 'senior' in e or 'direct' in e: return '5+ years'
    return '1-3 years'

# ── Company name ──────────────────────────────────────────────────────────────
def get_company(row):
    for col in ['company_name', 'company', 'organization']:
        if col in row and pd.notna(row[col]) and str(row[col]).strip():
            return str(row[col]).strip()
    return 'Tech Company'

# ── Location ─────────────────────────────────────────────────────────────────
def get_location(row):
    loc = str(row.get('location', '') or '').strip()
    if not loc or loc == 'nan':
        return 'Remote'
    # Add work mode hint
    work = str(row.get('work_type', '') or '').lower()
    if 'remote' in work or 'remote' in loc.lower():
        return f"{loc.split(',')[0]} · Remote"
    return loc.split(',')[0] + ' · On-site'

# ── Posted date ───────────────────────────────────────────────────────────────
POSTED_OPTIONS = ['1 day ago', '2 days ago', '3 days ago', '1 week ago', '2 weeks ago']

# ── Build output rows ─────────────────────────────────────────────────────────
print("\nProcessing jobs...")
result = []
for i, (_, row) in enumerate(sample.iterrows()):
    title = str(row.get('title', 'Software Engineer')).strip()
    if not title or title == 'nan':
        continue

    skills = extract_skills(row)
    result.append({
        'id':          f'li_{i+1}',
        'title':       title,
        'company':     get_company(row),
        'location':    get_location(row),
        'city':        str(row.get('location', 'Remote') or 'Remote').split(',')[0].strip(),
        'skills':      ', '.join(skills),
        'salary':      format_salary(row),
        'match':       random.randint(72, 96),
        'type':        map_type(row),
        'experience':  map_experience(row),
        'posted':      random.choice(POSTED_OPTIONS),
        'description': str(row.get('description', '') or '')[:300].replace('\n', ' ').strip(),
    })

output = pd.DataFrame(result)
output.to_csv('careerpath_jobs_processed.csv', index=False)

print(f"\n✅ Done! Saved {len(output)} jobs.")
print("\nSample output:")
print(output[['title', 'company', 'type', 'salary']].head(10).to_string())
print("\n📥 Download 'careerpath_jobs_processed.csv' from the Output section on the right.")
print("   Place it in your project's dataset/ folder as 'careerpath_jobs.csv'")
