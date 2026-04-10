# Technical Documentation: The Recommender System

This document explains how the career recommendation engine works, the decisions behind its design, and how the AI layer integrates with the scoring system. Written so you can explain it in a portfolio review, job interview, or to a technical audience.

---

## Overview

The platform uses a **hybrid recommender system** combining two approaches:

1. **Weighted utility-based content filtering** — the psychometric assessment
2. **LLM-powered semantic analysis** — the goal alignment layer

Neither approach alone is sufficient. The scoring matrix is fast and consistent but cannot understand free text. The LLM is flexible and articulate but cannot quantify aptitude. Together they produce a recommendation that is both measurable and explainable.

---

## Part 1: The Scoring Matrix (Content-Based Filtering)

### What is content-based filtering?

Content-based filtering recommends items based on a comparison between a **user profile** and **item profiles**. In this system:

- The **items** are the 8 career domains
- The **user profile** is built dynamically as the mentee answers 18 questions
- Each answer updates the user profile by adding weighted scores to each domain

This is different from collaborative filtering (which recommends based on what similar users chose) because we do not have enough users or historical data to rely on similarity between mentees. Content-based filtering works from zero — it only needs the current mentee's answers.

### The Utility Matrix

At the core of the system is a **utility matrix**. Each question option carries a scores vector:

```javascript
{ text: "I enjoy math and use it comfortably", scores: [2, 2, 1, 0, 0, 0, 1, 0] }
```

The vector has 8 values, one per domain:

```
Index:  0          1       2                    3                    4         5                 6              7
Domain: AI & ML    Data    Software Engineering  Cloud & Infra        Security  Product & Design  Emerging Tech  Virtual Assistant
Score:  2          2       1                    0                    0         0                 1              0
```

A score of `2` means this answer is a strong signal for that domain. A score of `0` means no signal. A score of `3` (used on highly diagnostic questions) is a very strong signal.

### Score Accumulation

As the mentee answers each question, the selected option's scores vector is added to a running total array:

```javascript
const scores = new Array(8).fill(0); // starts at all zeros

// For each answer:
options[selectedIndex].scores.forEach((s, i) => {
  scores[i] += s;
});
```

After 18 questions, `scores` holds the cumulative aptitude signal for each domain. The domain with the highest total is recommended.

### Multi-Select Questions

Four questions allow multiple selections (questions 3, 5, 6, 9). For these, all selected options contribute their scores:

```javascript
const selectedIndices = [0, 2, 5]; // mentee selected 3 options
selectedIndices.forEach(ai => {
  options[ai].scores.forEach((s, i) => { scores[i] += s; });
});
```

This reflects that real aptitudes are multidimensional. A person who is excited by both "analyzing data" and "protecting systems from attackers" gets credit for both signals.

### Score Design Principles

The scores were designed with three rules:

**Rule 1: Specificity.** Questions that directly measure a domain's core requirement (e.g. "I like finding the flaw or weak point in a system" for Security) carry a score of `3`. General signals carry `1` or `2`.

**Rule 2: Separation.** No single answer should score high across all domains. If every answer had equal weight everywhere, the system would not differentiate between mentees.

**Rule 3: Coverage.** Every domain should be reachable from multiple questions. A mentee who is ideal for Cloud & Infrastructure should accumulate signals from at least 6 of the 18 questions, not just 1 or 2.

### Example: Full Scoring Walk-Through

Consider a mentee who answers:

| Question | Selected Answer | Key scores added |
|---|---|---|
| Background | "Science or math background" | AI: +2, Data: +2 |
| Problem instinct | "Look for patterns or trends" | AI: +1, Data: +2 |
| Exciting activity | "Analyzing data to find useful insights" | Data: +3 |
| Math comfort | "I enjoy them and use them comfortably" | AI: +2, Data: +2 |
| Learning style | "Deep dives into one subject" | AI: +2, Data: +2 |

After these 5 questions: Data score = 11, AI score = 7, all others remain low. The system is already converging on Data as the top recommendation — 13 questions still to go.

### Final Ranking

After all 18 questions:

```javascript
const ranked = domains
  .map((d, i) => ({ ...d, score: scores[i], index: i }))
  .sort((a, b) => b.score - a.score);

const topMatch = ranked[0];
const secondMatch = ranked[1];
```

---

## Part 2: The AI Semantic Layer

### Why we need it

The scoring matrix is excellent at quantifying aptitude from structured answers. But it cannot:

- Read free text
- Understand what "I want to build apps for farmers in rural areas" means in terms of domain
- Judge whether a stated career goal is realistic given someone's aptitude scores
- Generate a human-readable explanation of why there is a conflict

The Claude API fills all four gaps.

### How the AI call works

After the scoring matrix produces results, the platform makes a single API call with a carefully structured prompt:

```javascript
const prompt = `You are a tech career advisor reviewing a mentee's profile.

MENTEE'S STATED GOAL (in their own words):
"${menteeGoal}"

ASSESSMENT RESULTS:
Top aptitude match: ${top.name}
Second aptitude match: ${second.name}
All domain scores: ${scoresSummary}

Respond ONLY with valid JSON in this exact format:
{
  "goalDomain": "...",
  "alignmentStatus": "match" or "conflict" or "partial",
  "alignmentSummary": "...",
  "warningText": "...",
  "mentorNote": "...",
  "choiceContext": "..."
}`;
```

The prompt:

- Gives the model both the quantitative data (scores) and the qualitative input (goal text)
- Forces structured JSON output so parsing is reliable
- Assigns a specific role ("tech career advisor") to constrain the tone
- Separates outputs by audience (mentee-facing vs mentor-facing)

### What the AI decides

The model performs three tasks in a single inference:

**Task 1: Intent classification.** Map the free text goal to one of the 8 domains. This is semantic understanding — "I want to protect companies from hackers" maps to Security even if the word "security" never appears.

**Task 2: Gap analysis.** Compare the classified goal domain with the top aptitude score. If Security is the goal domain and Data is the top aptitude score, that is a conflict.

**Task 3: Explanation generation.** Write three separate texts: one for the mentee (the warning), one for the mentor (the note), and one neutral context sentence explaining what choosing each path means.

### Why JSON output

Forcing JSON output makes the AI response machine-readable. Instead of parsing natural language (which is brittle), we parse a structured object:

```javascript
const analysis = JSON.parse(clean);
// analysis.alignmentStatus === 'conflict'
// analysis.warningText === "You want to work in security..."
// analysis.mentorNote === "This mentee's goal and aptitude diverge..."
```

This gives us both the structured data (for the Google Sheet columns) and the display text (for the UI) from a single API call.

### The three-layer conflict response

When `alignmentStatus` is `conflict` or `partial`, the UI renders three components:

```
Layer 1: Warning to mentee
Purpose: Honest, plain language explanation of the gap
Tone: Informative, not discouraging
Audience: The mentee

Layer 2: Dual roadmap choice
Purpose: Give the mentee agency — they choose which path to take
Logic: goalDomain → one roadmap button, top aptitude match → another
Audience: The mentee

Layer 3: Mentor flag
Purpose: Give the mentor specific intelligence before the first 1-on-1
Content: AI-generated, specific to this mentee's exact gap
Audience: The mentor only
```

This three-layer approach is intentional. A system that just overrides the mentee's stated goal with the "correct" recommendation would be paternalistic and demotivating. A system that ignores the conflict entirely would be irresponsible. The three layers respect mentee autonomy while ensuring the mentor has full context.

---

## Part 3: Hybrid Architecture

The final recommendation is a product of both systems working together:

```
Psychometric Assessment (18 questions)
        ↓
  Utility Matrix Scoring
        ↓
  Domain Rankings (quantitative)
        ↓                           ←── Free Text Goal (qualitative)
  Claude API Analysis
        ↓
  Alignment Classification
  (match / partial / conflict)
        ↓
  Results UI
  ├── If match: single roadmap recommendation
  └── If conflict: warning + dual choice + mentor flag
```

The scoring matrix answers: "What is this person naturally suited for?"
The AI layer answers: "Does what they want match what they are suited for?"

---

## Part 4: Limitations and Future Improvements

### Current limitations

**Cold start is not a problem here** (we have no historical data, but the system does not need it). However:

- **Score calibration is manual.** The weights in the utility matrix were designed by a domain expert (the mentor). They have not been statistically validated against outcomes. Future improvement: collect outcome data and use it to calibrate weights.

- **No personalisation over time.** The system treats every mentee identically. It does not learn from previous mentees' results. Future improvement: store outcomes (did the recommended path work out?) and use them to refine weights.

- **Binary domain assignment.** The system assigns one top domain. Real career paths are often multi-domain (e.g. an ML Engineer needs both AI and Cloud skills). Future improvement: blend the top 2 domains into a hybrid roadmap.

- **LLM dependency.** The AI analysis layer requires an API call. If the API is unavailable, the analysis is skipped silently. Future improvement: add a rule-based fallback using the goal text and keyword matching.

### Potential extensions

| Extension | Approach |
|---|---|
| Statistical calibration | Collect outcome data, run logistic regression on scores vs career satisfaction |
| Collaborative filtering layer | Cluster mentees by score profile, show "mentees like you chose..." |
| Progress tracking | Monthly check-ins feed back into the profile and update recommendations |
| A/B testing | Test different score weights against long-term mentee outcomes |
| Multi-domain roadmaps | Blend top 2 domain roadmaps for mentees who score closely on two domains |

---

## Part 5: How to Explain This in an Interview

If asked about this project in a technical interview, here is how to frame it:

**"What kind of recommender system is this?"**
It is a content-based filtering system using a hand-crafted utility matrix. Each item (career domain) is represented as a profile of required aptitudes. Each user is profiled by their responses to 18 psychometric questions. The recommendation is the item whose profile most closely matches the user's accumulated score vector. There is no collaborative component because we do not have sufficient user history data.

**"Why not use machine learning for the scoring?"**
The dataset is too small. With 35 mentees, there is not enough labelled training data to train a classifier reliably. The hand-crafted weights encode domain expertise directly, which is appropriate at this scale. If the platform grows to thousands of users with tracked outcomes, a supervised approach would make sense.

**"What does the Claude API actually do?"**
It acts as a zero-shot intent classifier and gap analysis engine. It takes the mentee's free text goal, classifies it into one of 8 domain categories (intent classification), compares that classification against the utility matrix output (gap analysis), and generates audience-appropriate natural language explanations. All in a single inference call using a structured prompt that forces JSON output.

**"How would you improve it?"**
The most important improvement is outcome tracking. Right now we recommend a domain but have no feedback loop on whether it was the right recommendation. Tracking mentee outcomes (job placements, satisfaction at 6 and 12 months) would allow us to run logistic regression on the score vectors and recalibrate the weights statistically rather than relying purely on expert intuition.

---

## Vocabulary Reference

| Term | Definition in this system |
|---|---|
| Content-based filtering | Recommending based on item and user profiles, not peer behaviour |
| Utility matrix | The table of question options × domain scores that drives recommendations |
| Score vector | The array of 8 numbers representing aptitude across all domains |
| Psychometric assessment | A structured questionnaire designed to measure personality and aptitude traits |
| Intent classification | Mapping free text to a predefined category (here: which domain does this goal belong to) |
| Gap analysis | Comparing stated preference with measured aptitude to identify misalignment |
| Cold start | The problem of making recommendations with no prior user history (not an issue here) |
| Hybrid recommender | A system combining two or more recommendation approaches |
