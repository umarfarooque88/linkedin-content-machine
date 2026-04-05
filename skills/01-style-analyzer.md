# Style Analyzer

Analyze Umar's writing samples and produce a detailed voice profile in `config/style-profile.json`.

## Instructions

1. Read all writing samples from `Dataset/` directory and subdirectories, including:
   - LinkedIn Profile Summary (`Basic_LinkedInDataExport → Profile.csv`)
   - Profile Summary (`Basic_LinkedInDataExport → Profile Summary.csv`)
   - Any existing LinkedIn posts (search `Dataset/` for .csv or .txt files)
   - Messages (`Basic_LinkedInDataExport → messages.csv`)
   - Any documents, PDFs, or writing found in the folder

2. Analyze for the following dimensions:

   ### A. Tone Scales (1-10)
   - Formal ←——→ Casual
   - Technical ←——→ Accessible
   - Confident ←——→ Humble
   - Direct ←——→ Tangential
   - Academic ←——→ Conversational

   ### B. Sentence Patterns
   - Average sentence length (short/medium/long)
   - Sentence variety (monotonous/varied/creative)
   - Paragraph length (1-2 lines / 3-5 lines / long paragraphs)
   - Use of line breaks between ideas

   ### C. Structural Patterns
   - Hook type (how they start posts/stories)
   - Body structure (how they develop points)
   - Conclusion pattern (how they end — CTA, question, statement)

   ### D. Formatting Habits
   - Emojis: none / occasional / many
   - Lists: uses / avoids
   - Formatting: bold / italics / line breaks
   - Hashtags: how many, style, placement

   ### E. Content Focus
   - Topics they gravitate toward
   - Themes in their storytelling
   - What they emphasize (process vs results vs feelings vs facts)

3. Write findings to `config/style-profile.json` with this structure:

```json
{
  "name": "Umar Farooque",
  "tone_scales": {
    "formality": 4,
    "technical_depth": 5,
    "confidence": 7,
    "directness": 6,
    "conversational": 6
  },
  "sentence_patterns": {
    "avg_length": "mixed - short for impact, longer for explanation",
    "variety": "varied",
    "paragraph_style": "short paragraphs, 1-3 lines each",
    "uses_line_breaks": true
  },
  "structure": {
    "hooks": ["bold statements", "personal story openings", "contrarian takes"],
    "body": "develops point with personal evidence or example",
    "conclusion": "ends with question or open thought, never hard CTA"
  },
  "formatting": {
    "emojis": "minimal, strategic only",
    "lists": "uses for emphasis",
    "quotes": false,
    "hashtags": "3-5 at end, relevant only",
    "uses_line_spacing": true
  },
  "content_themes": ["building in public", "developer journey", "real project experiences", "AI commentary", "self-taught developer", "shipping real products"],
  "unique_angles": [],
  "calibrated_phrases": [],
  "forbidden_phrases": [],
  "calibration_status": "initial",
  "last_updated": "YYYY-MM-DD",
  "raw_samples_analyzed": 0,
  "analysis_notes": "text summary of what was found"
}
```

4. Update `unique_angles` with specific differentiators based on Umar's actual profile data (education, projects, work experience, skills).

5. Update `forbidden_phrases` with generic AI-sounding phrases that should never appear in Umar's posts (examples: "In today's fast-paced", "It's important to note", "As we navigate", "Let's dive in").

6. If very few writing samples are found (1-2 short profiles), set `calibration_status` to `needs_interview` and output 5 style interview questions for Umar to answer.

7. After saving all changes, run the Post Generator once with today's trends to test quality. If the generated post doesn't sound natural, adjust the style profile.

## Output

- Updated `config/style-profile.json` with real analysis
- Console summary: what was analyzed, key findings, calibration status
