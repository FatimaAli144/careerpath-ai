// CareerPath AI — Platform Data (no user-specific mock data)
window.MOCK = (function () {

  // Shared lookup lists (used in dropdowns & skill pickers)
  const skills = [
    // Frontend
    "React", "Vue.js", "Angular", "Next.js", "TypeScript", "HTML/CSS", "Tailwind CSS", "Redux",
    // Backend
    "Node.js", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "NestJS", "Express.js", "Go", "PHP",
    // Mobile
    "React Native", "Flutter", "Swift", "Kotlin",
    // Data / ML
    "Python", "R", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Keras", "OpenCV", "NLP", "LLMs", "Hugging Face",
    // Databases
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Firebase", "DynamoDB",
    // Cloud / DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Nginx", "Git",
    // Data Tools
    "Tableau", "Power BI", "Excel", "Google Analytics", "dbt", "Apache Spark", "Looker",
    // Design
    "Figma", "Adobe XD", "Photoshop", "UI/UX Design", "User Research",
    // Business
    "Project Management", "Agile/Scrum", "SEO", "Digital Marketing",
    // Security
    "Cybersecurity", "Ethical Hacking", "Network Security",
    // Other
    "Blockchain", "IoT", "GraphQL", "REST APIs", "Microservices", "System Design",
    // Legacy / misc
    "SQL", "Data Viz", "ML", "Java", "Communication", "Project Mgmt",
  ];

  const universities = [
    "LUMS, Lahore",
    "NUST, Islamabad",
    "IBA Karachi",
    "GIKI",
    "PIEAS, Islamabad",
    "FAST-NUCES, Lahore",
    "FAST-NUCES, Islamabad",
    "FAST-NUCES, Karachi",
    "FAST-NUCES, Peshawar",
    "UET Lahore",
    "UET Peshawar",
    "UET Taxila",
    "COMSATS, Islamabad",
    "COMSATS, Lahore",
    "COMSATS, Wah",
    "COMSATS, Abbottabad",
    "NED University, Karachi",
    "MUET Jamshoro",
    "ITU Lahore",
    "Air University, Islamabad",
    "Bahria University, Islamabad",
    "Bahria University, Karachi",
    "SZABIST, Karachi",
    "SZABIST, Islamabad",
    "University of Punjab, Lahore",
    "University of Karachi",
    "Quaid-i-Azam University, Islamabad",
    "University of Peshawar",
    "GCU Lahore",
    "BZU Multan",
    "Virtual University",
    "Forman Christian College, Lahore",
    "UMT Lahore",
    "Superior University, Lahore",
    "Riphah International University",
    "KFUEIT, Rahim Yar Khan",
    "University of Agriculture, Faisalabad",
    "University of Balochistan, Quetta",
  ];

  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"];

  // Job listings — platform data, not user-specific
  const jobs = [
    {
      id: "j1", title: "Data Analyst", company: "Careem",
      location: "Karachi · Hybrid", skills: ["Python", "SQL", "Tableau"],
      salary: "₨ 180–240k", match: 94, type: "Full-time", posted: "2 days ago",
    },
    {
      id: "j2", title: "Junior Product Designer", company: "Sastaticket",
      location: "Lahore · On-site", skills: ["Figma", "Research", "Prototyping"],
      salary: "₨ 140–180k", match: 86, type: "Full-time", posted: "4 days ago",
    },
    {
      id: "j3", title: "Frontend Engineer Intern", company: "Bazaar Technologies",
      location: "Karachi · On-site", skills: ["React", "TypeScript", "CSS"],
      salary: "₨ 90–120k", match: 81, type: "Internship", posted: "1 week ago",
    },
    {
      id: "j4", title: "Marketing Analyst", company: "Foodpanda PK",
      location: "Islamabad · Remote", skills: ["SQL", "Excel", "GA4"],
      salary: "₨ 150–200k", match: 74, type: "Full-time", posted: "1 week ago",
    },
  ];

  // ── Admin dashboard data ──────────────────────────────────────────────────

  const adminStats = [
    { label: "Total students",  value: "12,438", delta: "+8.2% MoM" },
    { label: "Employers",       value: "284",     delta: "+12 this month" },
    { label: "Job postings",    value: "1,072",   delta: "+18% MoM" },
    { label: "Applications",    value: "9,840",   delta: "+22% MoM" },
  ];

  const topRoles = [
    { label: "Data Analyst",       value: 312, pct: 100 },
    { label: "Frontend Engineer",  value: 264, pct: 84  },
    { label: "Product Designer",   value: 198, pct: 63  },
    { label: "Backend Engineer",   value: 176, pct: 56  },
    { label: "Marketing Analyst",  value: 142, pct: 45  },
    { label: "Sales Associate",    value: 108, pct: 34  },
  ];

  const applicationFunnel = [
    { label: "Applied",     value: 9840, pct: 100  },
    { label: "Reviewed",    value: 4920, pct: 50   },
    { label: "Shortlisted", value: 1968, pct: 20   },
    { label: "Interview",   value: 738,  pct: 7.5  },
    { label: "Offer",       value: 246,  pct: 2.5  },
  ];

  const universityCounts = [
    { label: "LUMS, Lahore",    value: 412, pct: 100 },
    { label: "NUST, Islamabad", value: 380, pct: 92  },
    { label: "FAST-NUCES",      value: 296, pct: 72  },
    { label: "IBA Karachi",     value: 244, pct: 59  },
    { label: "UET Lahore",      value: 208, pct: 50  },
    { label: "GIKI",            value: 142, pct: 34  },
  ];

  const skillCloud = [
    { name: "React",      count: 1842 }, { name: "Python",     count: 1620 },
    { name: "SQL",        count: 1480 }, { name: "Excel",      count: 1240 },
    { name: "Figma",      count: 980  }, { name: "Node.js",    count: 920  },
    { name: "Java",       count: 880  }, { name: "AWS",        count: 760  },
    { name: "ML",         count: 720  }, { name: "Tableau",    count: 540  },
    { name: "TypeScript", count: 480  }, { name: "GraphQL",    count: 220  },
  ];

  const studentTable = [
    { name: "Aisha Khan",       email: "aisha.khan@nust.edu.pk",  university: "NUST, Islamabad", skills: ["React", "Node.js", "AWS"],  joined: "May 02, 2026", status: "Active",     tone: "green" },
    { name: "Bilal Iqbal",      email: "bilal.i@lums.edu.pk",     university: "LUMS, Lahore",    skills: ["Python", "ML", "SQL"],      joined: "Apr 28, 2026", status: "Active",     tone: "green" },
    { name: "Hira Naveed",      email: "hira.n@uet.edu.pk",       university: "UET Lahore",      skills: ["Figma", "Research"],        joined: "Apr 22, 2026", status: "Active",     tone: "green" },
    { name: "Usman Tariq",      email: "usman.t@iba.edu.pk",      university: "IBA Karachi",     skills: ["SQL", "Tableau", "Excel"],  joined: "Apr 18, 2026", status: "Onboarding", tone: "amber" },
    { name: "Mahnoor Siddiqui", email: "mahnoor.s@giki.edu.pk",   university: "GIKI",            skills: ["Java", "Spring", "AWS"],    joined: "Apr 10, 2026", status: "Active",     tone: "green" },
  ];

  const employerTable = [
    { name: "Careem",              email: "talent@careem.com",      location: "Karachi",   postings: 12, joined: "Jan 14, 2026", status: "Verified", tone: "green" },
    { name: "Bazaar Technologies", email: "hr@bazaartech.com",      location: "Karachi",   postings: 7,  joined: "Feb 02, 2026", status: "Verified", tone: "green" },
    { name: "Sastaticket",         email: "careers@sastaticket.pk", location: "Lahore",    postings: 4,  joined: "Feb 18, 2026", status: "Verified", tone: "green" },
    { name: "Foodpanda PK",        email: "people@foodpanda.pk",    location: "Islamabad", postings: 9,  joined: "Feb 24, 2026", status: "Verified", tone: "green" },
    { name: "Tajir",               email: "hello@tajir.com",        location: "Lahore",    postings: 3,  joined: "Mar 11, 2026", status: "Pending",  tone: "amber" },
  ];

  // ── Employer dashboard data ───────────────────────────────────────────────

  const employerStats = [
    { label: "Applicants (30d)", value: "184" },
    { label: "Avg. match score", value: "82%" },
    { label: "Active jobs",      value: "6"   },
    { label: "Shortlisted",      value: "24"  },
  ];

  const pipelineStages = [
    { label: "New",         value: 84, pct: 100 },
    { label: "Reviewed",    value: 52, pct: 62  },
    { label: "Shortlisted", value: 24, pct: 29  },
    { label: "Interview",   value: 12, pct: 14  },
    { label: "Offer",       value: 4,  pct: 5   },
  ];

  const applicantsTable = [
    { name: "Zara Ahmed",  email: "zara.ahmed@lums.edu.pk", university: "LUMS, Lahore",    skills: ["React", "Python", "Figma"], applied: "Frontend Engineer", status: "New",         tone: "blue"  },
    { name: "Bilal Iqbal", email: "bilal.i@lums.edu.pk",    university: "LUMS, Lahore",    skills: ["Python", "ML", "SQL"],      applied: "Data Analyst",      status: "Reviewed",    tone: "amber" },
    { name: "Aisha Khan",  email: "aisha.khan@nust.edu.pk", university: "NUST, Islamabad", skills: ["React", "Node.js"],         applied: "Frontend Engineer", status: "Shortlisted", tone: "green" },
    { name: "Hira Naveed", email: "hira.n@uet.edu.pk",      university: "UET Lahore",      skills: ["Figma", "Research"],        applied: "Product Designer",  status: "New",         tone: "blue"  },
  ];

  const myJobs = [
    { id: "ej1", title: "Senior Data Analyst",         posted: "May 04, 2026", applicants: 38, skills: ["Python", "SQL", "Tableau"],        salary: "₨ 220–320k", location: "Karachi · Hybrid",   status: "Open",   tone: "green" },
    { id: "ej2", title: "Frontend Engineer",           posted: "Apr 28, 2026", applicants: 64, skills: ["React", "TypeScript"],             salary: "₨ 180–280k", location: "Karachi · Remote",   status: "Open",   tone: "green" },
    { id: "ej3", title: "Marketing Operations Intern", posted: "Apr 18, 2026", applicants: 52, skills: ["Excel", "GA4", "Communication"],   salary: "₨ 60–80k",   location: "Lahore · On-site",   status: "Open",   tone: "green" },
    { id: "ej4", title: "Product Designer",            posted: "Mar 28, 2026", applicants: 41, skills: ["Figma", "Research", "Prototyping"],salary: "₨ 200–300k", location: "Islamabad · Hybrid", status: "Closed", tone: "gray"  },
  ];

  const impactStats = [
    { label: "Youth guided",        value: "12,438" },
    { label: "Jobs posted",         value: "1,072"  },
    { label: "Employers joined",    value: "284"    },
    { label: "Avg. skill coverage", value: "78%"    },
  ];

  const digitalEconomyStats = [
    { label: "IT export growth",   value: 24,  suffix: "%",     pct: 100 },
    { label: "Freelance earnings", value: 18,  suffix: "% YoY", pct: 75  },
    { label: "Tech jobs added",    value: 142, suffix: "k",     pct: 86  },
    { label: "Women in tech",      value: 32,  suffix: "%",     pct: 53  },
    { label: "Mobile penetration", value: 89,  suffix: "%",     pct: 95  },
  ];

  return {
    skills, universities, cities, jobs,
    adminStats, topRoles, applicationFunnel, universityCounts, skillCloud,
    studentTable, employerTable,
    employerStats, pipelineStages, applicantsTable, myJobs,
    impactStats, digitalEconomyStats,
  };
})();
