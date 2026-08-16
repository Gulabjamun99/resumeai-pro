/**
 * CANONICAL TAXONOMY & CONTROLLED SYNONYM REGISTRY (P1.4 DIRECTIVE)
 * 
 * Strict confidence tiers:
 * - EXACT: Literal case-insensitive match on normalized term
 * - STRONG: Controlled 1:1 synonym or canonical abbreviation (e.g. K8s -> Kubernetes, GCP -> Google Cloud Platform)
 * - PARTIAL: Related domain relationship (e.g. PostgreSQL -> SQL, Microservices -> Distributed Systems)
 * - NONE: No supporting evidence
 */

export const CANONICAL_SYNONYMS = {
  // Cloud & DevOps
  "kubernetes": { canonical: "kubernetes", aliases: ["k8s"], confidence: "STRONG" },
  "k8s": { canonical: "kubernetes", aliases: ["kubernetes"], confidence: "STRONG" },
  "google cloud platform": { canonical: "gcp", aliases: ["gcp", "google cloud"], confidence: "STRONG" },
  "gcp": { canonical: "gcp", aliases: ["google cloud platform", "google cloud"], confidence: "STRONG" },
  "amazon web services": { canonical: "aws", aliases: ["aws"], confidence: "STRONG" },
  "aws": { canonical: "aws", aliases: ["amazon web services"], confidence: "STRONG" },
  "ci/cd": { canonical: "ci/cd", aliases: ["ci-cd", "continuous integration", "continuous deployment"], confidence: "STRONG" },
  "continuous integration": { canonical: "ci/cd", aliases: ["ci/cd", "ci-cd"], confidence: "STRONG" },

  // Languages & Frameworks
  "postgresql": { canonical: "postgresql", aliases: ["postgres"], confidence: "STRONG" },
  "postgres": { canonical: "postgresql", aliases: ["postgresql"], confidence: "STRONG" },
  "typescript": { canonical: "typescript", aliases: ["ts"], confidence: "STRONG" },
  "ts": { canonical: "typescript", aliases: ["typescript"], confidence: "STRONG" },
  "javascript": { canonical: "javascript", aliases: ["js", "ecmascript"], confidence: "STRONG" },
  "js": { canonical: "javascript", aliases: ["javascript"], confidence: "STRONG" },
  "golang": { canonical: "go", aliases: ["go"], confidence: "STRONG" },
  "go": { canonical: "go", aliases: ["golang"], confidence: "STRONG" },

  // AI & Data
  "machine learning": { canonical: "machine learning", aliases: ["ml"], confidence: "STRONG" },
  "ml": { canonical: "machine learning", aliases: ["machine learning"], confidence: "STRONG" },
  "artificial intelligence": { canonical: "artificial intelligence", aliases: ["ai"], confidence: "STRONG" },
  "ai": { canonical: "artificial intelligence", aliases: ["artificial intelligence"], confidence: "STRONG" },
  "natural language processing": { canonical: "nlp", aliases: ["nlp"], confidence: "STRONG" },
  "nlp": { canonical: "nlp", aliases: ["natural language processing"], confidence: "STRONG" },
  "large language models": { canonical: "llm", aliases: ["llms", "llm"], confidence: "STRONG" },
  "llms": { canonical: "llm", aliases: ["large language models", "llm"], confidence: "STRONG" },
  "llm": { canonical: "llm", aliases: ["large language models", "llms"], confidence: "STRONG" },

  // Recruitment & ATS
  "talent acquisition": { canonical: "talent acquisition", aliases: ["ta"], confidence: "STRONG" },
  "ta": { canonical: "talent acquisition", aliases: ["talent acquisition"], confidence: "STRONG" },
  "applicant tracking system": { canonical: "ats", aliases: ["ats"], confidence: "STRONG" },
  "ats": { canonical: "ats", aliases: ["applicant tracking system"], confidence: "STRONG" }
};

/**
 * PARTIAL RELATIONSHIPS REGISTRY
 * These maps represent related concepts that grant PARTIAL confidence (never STRONG or EXACT).
 */
export const PARTIAL_RELATIONSHIPS = {
  "postgresql": ["sql", "relational database", "rdbms", "database"],
  "postgres": ["sql", "relational database", "rdbms", "database"],
  "mysql": ["sql", "relational database", "rdbms", "database"],
  "sql": ["database", "data querying"],
  "microservices": ["distributed systems", "service-oriented architecture", "soa", "rest api"],
  "distributed systems": ["microservices", "system architecture"],
  "talent acquisition": ["technical recruiting", "it recruitment", "sourcing", "headhunting", "hiring"],
  "technical recruiting": ["talent acquisition", "sourcing", "screening", "interviewing"],
  "kubernetes": ["docker", "containerization", "containers", "orchestration"],
  "docker": ["containers", "containerization"],
  "react": ["frontend", "javascript", "ui development"],
  "node.js": ["backend", "javascript", "server-side"]
};

/**
 * SHORT TOKENS REQUIRING ISOLATED TOKENIZER BOUNDARIES
 * Prevents false-positive substring matches like "AI" in "email/training", "AWS" in "laws", "Go" in "good", "C" in "react".
 */
export const STANDALONE_SHORT_TOKENS = new Set([
  "go", "c", "r", "ai", "ml", "ta", "ts", "js", "aws", "sql", "gcp", "k8s", "nlp", "llm", "llms", "ats", "ci", "cd"
]);

export const ATS_KEYWORD_TAXONOMY = [
  "ATS", "Recruitment", "AI", "Leadership", "Analytics", "Optimization",
  "Sourcing", "Talent Acquisition", "Screening", "Interviews", "Python",
  "SQL", "Management", "Operations", "Compliance", "Strategy", "Execution",
  "Performance", "Stakeholders", "Reporting", "Cross-Functional", "Roadmap",
  "Architecture", "Scalability"
];
