# Tech Career Discovery Platform

A fully AI-powered career guidance platform built for the MLOps Mentorship Program. Mentees complete an 18-question psychometric assessment, state their career goals in free text, and receive a personalised 12-month learning roadmap matched to their natural aptitude — with live AI-powered conflict detection when their stated goal and assessed aptitude diverge.

---

## Live Demo

Deploy your own copy in under 2 minutes. See [Deployment](#deployment) below.

---

## Features

- 18-question psychometric career assessment with single and multi-select questions
- Free text goal capture with AI-powered semantic analysis
- 8 career domain profiles covering 28 tech career paths
- Weighted content-based recommender system scoring mentees across all 8 domains
- Real-time AI goal alignment analysis using the Claude API
- Three-layer conflict resolution when stated goal and aptitude do not match
  - Plain language warning to the mentee
  - Dual roadmap choice (follow goal vs follow aptitude)
  - Mentor flag with specific 1-on-1 talking points
- Interactive 12-month roadmap with 4 phases per domain
- Each phase includes skills, courses, projects, and monthly milestones
- Google Sheets database integration for mentor follow-up
- Single HTML file, zero dependencies, deployable anywhere

---

## Project Structure

```
tech-career-platform/
│
├── index.html                  # Full platform (questionnaire + roadmaps)
├── google-apps-script.js       # Google Sheets backend receiver
│
├── docs/
│   ├── TECHNICAL.md            # Recommender system deep dive
│   ├── SETUP.md                # Google Sheets and deployment setup
│   └── SCREENSHOTS.md          # Screenshots and demo walkthrough
│
└── README.md
```

---

## How It Works

### User Flow

```
Home Page
    ↓
Step 1: Name + Email (intake)
    ↓
Step 2: Free text goal ("what do you want to learn?")
    ↓
Step 3: 18-question psychometric assessment
    ↓
Results Page
    ├── AI analyses goal vs aptitude scores
    ├── If match → aligned roadmap recommendation
    └── If conflict → warning + dual choice + mentor flag
         ↓
12-Month Roadmap (interactive, domain-specific)
```

### Recommender System (summary)

The platform uses a **weighted utility-based content filtering** recommender. Each of the 18 questions contains a scores vector `[d0, d1, d2, d3, d4, d5, d6, d7]` — one weight per domain. As the mentee answers, their scores accumulate across all 8 domains. The domain with the highest total score becomes their top recommendation.

The Claude AI layer adds a semantic analysis pass on top: it reads the mentee's free-text goal, maps it to a domain, compares it with the scored result, and generates a natural language explanation of the alignment or conflict.

See [docs/TECHNICAL.md](docs/TECHNICAL.md) for the full technical breakdown.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Recommender | Weighted utility matrix (custom) |
| AI Analysis | Anthropic Claude API (claude-sonnet) |
| Database | Google Sheets via Apps Script Web App |
| Hosting | Netlify (static, free tier) |

No npm. No build step. No framework. One file.

---

## Deployment

### Option 1: Netlify (recommended, 2 minutes)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop `index.html` into the deploy box
3. Your platform is live at a public URL

### Option 2: GitHub Pages

1. Fork this repository
2. Go to Settings → Pages
3. Set source to `main` branch, root folder
4. Rename `index.html` to `index.html` (already done)
5. Your platform is live at `yourusername.github.io/tech-career-platform`

---

## Google Sheets Setup

To capture mentee data into your own spreadsheet:

1. Create a new Google Sheet at [sheets.google.com](https://sheets.google.com)
2. Click **Extensions → Apps Script**
3. Paste the contents of `google-apps-script.js`
4. Click **Deploy → New Deployment → Web App**
5. Set: Execute as = Me, Who has access = Anyone
6. Copy the Web App URL
7. Open `index.html`, find the line:
   ```javascript
   const SHEET_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
   ```
8. Replace the placeholder with your URL and redeploy

Your sheet will auto-create headers on first submission and capture:

| Column | Data |
|---|---|
| Timestamp | When they submitted |
| Full Name | Mentee name |
| Email | For follow-up |
| Stated Goal | Their free text goal verbatim |
| Goal Domain (AI) | What domain Claude mapped their goal to |
| Alignment Status | match / partial / conflict |
| Top Aptitude Match | Highest scoring domain |
| Second Match | Second highest domain |
| Mentor Note (AI) | Claude-generated 1-on-1 talking point |
| All Domain Scores | Full scores across all 8 domains |

---

## The 8 Career Domains

| # | Domain | Career Paths |
|---|---|---|
| 1 | AI & Machine Learning | ML Engineer, MLOps Engineer, AI Product Manager |
| 2 | Data | Data Engineer, Data Analyst, Analytics Engineer |
| 3 | Software Engineering | Backend, Frontend, Full Stack, Mobile Engineer |
| 4 | Cloud & Infrastructure | Cloud Engineer, DevOps Engineer, SRE |
| 5 | Security | Cybersecurity Analyst, Pen Tester, Security Engineer |
| 6 | Product & Design | Product Manager, UX/UI Designer, Product Designer |
| 7 | Emerging Tech | Web3, AR/VR, Robotics, AI Systems Designer |
| 8 | Virtual Assistant | General VA, Technical VA, Social Media VA, Executive VA |

---

## Roadmap Content

Each domain has a 4-phase 12-month learning roadmap. Every phase contains:

- Skills to build (specific tools and concepts)
- Courses and resources (mostly free, with direct links)
- Projects to build (portfolio-ready, practical)
- Monthly milestones (measurable checkpoints)
- First step this week (one concrete action to take today)

---

## Extending This Project

Ideas for future development:

- Add user authentication and persistent profiles
- Build a mentor dashboard showing all mentee results in one view
- Add weekly progress check-in system
- Integrate email automation for follow-up sequences
- Add peer matching (connect mentees in the same domain)
- Build a mobile app version using React Native

---

## About

Built by a practising MLOps Engineer as a mentorship infrastructure tool for a growing cohort of 35 tech mentees. Designed to replace manual career guidance intake with a structured, data-driven, AI-augmented process.

---

## License

MIT License. Free to use, fork, and extend.
