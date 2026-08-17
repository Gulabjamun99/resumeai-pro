import { generateFullDocumentOptimization } from '../src/utils/ats/fullDocumentOptimizer.js';
import { executeChangePlan } from '../src/utils/atsEngine.js';
import { enforceContentLocks } from '../src/services/lockEnforcer.js';
import { runCompleteValidationSuite } from '../src/services/validationSuite.js';

const SAMPLE_CV = {
  header: {
    name: "Aarav Mehta",
    title: "Senior Software Engineer",
    summary: "Dedicated software engineer with 6 years of experience in building enterprise web applications."
  },
  contact: {
    email: "aarav.mehta@example.com",
    phone: "+91-9876543210",
    address: "Bangalore, India",
    linkedin: "https://linkedin.com/in/aaravmehta"
  },
  skills: ["React", "JavaScript", "Node.js", "Postgres", "AWS", "K8s", "Docker"],
  education: [
    "Bachelor of Technology in Computer Science — IIT Delhi (2018)"
  ],
  certifications: [
    "AWS Certified Solutions Architect"
  ],
  experiences: [
    {
      id: "exp-1",
      company: "CloudScale Technologies",
      role: "Lead Full Stack Engineer",
      period: "Jan 2022 – Present",
      location: "Bangalore, India",
      bullets: [
        "Responsible for leading a team of 8 engineers in developing cloud-native microservices.",
        "Worked on optimizing database query latency, resulting in a 35% speedup across 10M daily requests.",
        "In charge of deploying Docker containers and managing K8s clusters on AWS.",
        "Handled REST API architectures and integrated automated CI/CD deployment pipelines."
      ]
    },
    {
      id: "exp-2",
      company: "Innovate Apps Pvt Ltd",
      role: "Software Development Engineer II",
      period: "Jul 2018 – Dec 2021",
      location: "Hyderabad, India",
      bullets: [
        "Participated in the rewrite of the core payment processing gateway using React and Node.js.",
        "Maintained 99.95% service uptime and resolved critical production incidents.",
        "Assisted in reducing frontend bundle size by 40% with code-splitting."
      ]
    }
  ]
};

const TARGET_JD = `
We are seeking a Senior Full Stack Engineer (React, Node.js, AWS, Kubernetes, PostgreSQL) to architect high-throughput distributed systems.
Requirements:
- Strong expertise in React, Node.js, TypeScript, REST APIs, and PostgreSQL.
- Proven experience with AWS cloud architecture, Docker, and Kubernetes (K8s).
- Experience leading engineering teams and optimizing system latency.
- Knowledge of Golang and Rust is a plus.
`;

const fullPlan = generateFullDocumentOptimization(TARGET_JD, SAMPLE_CV);
console.log("Blocked actions:", fullPlan.blockedActions);

const execFull = executeChangePlan(SAMPLE_CV, fullPlan);
const lockedCv = enforceContentLocks(SAMPLE_CV, SAMPLE_CV, execFull.proposedCv, fullPlan);
const valReport = runCompleteValidationSuite(SAMPLE_CV, lockedCv, "Pura CV is JD ke hisab se bana do", { scope: 'FULL_CV_JD_ALIGNMENT' }, fullPlan);
console.log("valReport:", JSON.stringify(valReport, null, 2));
