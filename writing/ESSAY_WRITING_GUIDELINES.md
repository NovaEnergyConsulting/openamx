# ESSAY_WRITING_GUIDELINES.md

# References

File: `./anatomy-of-a-great-essay.pdf`
Web Article: [The Codification of Engineering Knowledge](https://engineers.tools/articles/the-codification-of-engineering-knowledge/)

# Purpose

This document defines the recommended writing approach for creating technical articles, thought leadership pieces, engineering blog posts, product announcements, and educational content.

The goal is not simply to explain information.

The goal is to:

1. Capture attention.
2. Create curiosity.
3. Establish relevance.
4. Change the reader's understanding.
5. Deliver a solution.
6. Create a satisfying conclusion.

This framework is heavily influenced by:

- The "Anatomy of a Great Essay" model.
- Writer Science's problem-centered approach to expert writing.
- Classical persuasive writing patterns.
- Effective engineering and technical communication.

---

# Core Principle

## Readers Do Not Read For Information

Readers read because they have a problem.

Most technical articles fail because they begin with:

```text
Tool
↓
Features
↓
Benefits
```

Most successful articles begin with:

```text
Current Belief
↓
Problem
↓
Cost
↓
New Insight
↓
Solution
↓
Implication
```

Always write for the reader's problem first.

Never write about the technology first.

---

# The Master Structure

Every article should approximately follow this structure.

```text
Common Ground
↓
Status Quo
↓
Concession
↓
Problem
↓
Cost
↓
Point
↓
Solution
↓
Evidence
↓
Implications
↓
Conclusion
```

---

# 1. Common Ground

## Purpose

Begin with something the reader already believes.

The reader should immediately think:

> "Yes, that's true."

This creates alignment.

---

## Examples

### Engineering

> Engineers rely on software to perform increasingly complex calculations.

### Software Development

> Modern developers trust compilers and type systems to catch many mistakes before software reaches production.

### Asset Management

> Every asset owner wants better decisions, lower risk, and improved asset performance.

---

## Rules

✅ Familiar

✅ Non-controversial

✅ Reader-focused

❌ Product-focused

❌ Self-promotional

❌ Technical deep dive

---

# 2. Status Quo

## Purpose

Describe the prevailing belief or practice.

This is the assumption that the article will challenge.

---

## Examples

### TypeScript

> Most developers assume that if code compiles and passes tests, the important mistakes have already been found.

### Asset Management

> Many organizations still determine spare holdings primarily from historical purchasing patterns.

### Reliability Engineering

> Maintenance programs are often built around fixed intervals rather than measured asset condition.

---

## Rules

Do not attack the current view.

Present it fairly.

The reader may currently hold this belief.

---

# 3. Concession

## Purpose

Acknowledge why the status quo exists.

Show that intelligent people believe it for good reasons.

This builds credibility.

---

## Example

> This assumption is understandable. Modern type systems eliminate entire classes of programming errors, and automated tests catch many others before deployment.

---

## Template

```text
This belief exists because...
There are good reasons for...
Historically this approach has...
```

---

# 4. Introduce the Problem

## Purpose

Create instability.

Show that something important has changed.

Use:

- contradiction
- surprising evidence
- unexpected observation
- story
- case study
- failure

---

## Template

```text
But...
However...
Yet...
The problem is...
```

---

## Example

> Yet one of the most expensive software failures in history was ultimately caused by a unit conversion error.

---

# 5. Establish Cost

## Purpose

Show why the reader should care.

Without cost, there is no motivation.

---

## Cost Categories

### Financial

> The failure cost millions of dollars.

### Operational

> The plant experienced significant downtime.

### Safety

> Incorrect calculations may create unsafe conditions.

### Productivity

> Engineers lose hours reconciling inconsistent information.

### Strategic

> Poor decisions compound over the life of an asset.

---

## Template

```text
As a result...
The consequence is...
This creates...
This means...
```

---

# 6. State the Point

## Purpose

Present the central thesis.

The point must directly solve the problem.

---

## Formula

```text
Problem
+
Insight
=
Point
```

---

## Example

Problem:

> Software treats physical quantities as numbers.

Point:

> Physical quantities should be represented as typed quantities rather than plain numeric values.

---

## Rules

The point should:

✅ be concise

✅ be debatable

✅ create new understanding

✅ directly address the problem

---

# 7. Present the Solution

## Purpose

Introduce:

- product
- method
- framework
- process
- technique

Only after the problem is fully understood.

---

## Wrong

```text
Here's our product.
```

---

## Correct

```text
Now that the reader understands the problem,
introduce the solution.
```

---

## Example

> ts-units addresses this limitation by introducing dimensional analysis into the TypeScript type system.

---

# 8. Organize Each Section Using Index → Discussion

Every major section should follow:

```text
Index
↓
Discussion
```

---

## Index

The index is the roadmap.

It tells readers:

- what this section is about
- why it matters
- where it's going

---

## Example

> Unit conversion logic is one of the most common sources of silent engineering defects.

---

## Discussion

Now fulfill the promise.

Explain.

Provide examples.

Provide evidence.

Expand.

---

## Example

Explain:

- duplicated conversion factors
- magic numbers
- maintenance issues
- inconsistent implementations

---

# Section Pattern

```text
Section Heading

Index

Discussion

Evidence

Mini-conclusion
```

---

# 9. Use Stories Strategically

Stories provide:

- emotional relevance
- memorability
- credibility

Stories should support the argument.

They should not merely entertain.

---

# Story Placement

Best locations:

## Opening

Create the problem.

Example:

Mars Climate Orbiter.

---

## Midpoint

Demonstrate consequences.

Example:

A real-world production failure.

---

## Conclusion

Return to the original story.

Close the loop.

---

# Story Pattern

```text
Situation
↓
Expectation
↓
Failure
↓
Root Cause
↓
Lesson
```

---

## Mars Climate Orbiter Example

Situation:

> NASA launched a spacecraft to study Mars.

Expectation:

> The spacecraft would enter orbit around Mars.

Failure:

> Communication was lost during orbital insertion.

Root Cause:

> A mismatch between metric and imperial units.

Lesson:

> Physical quantities need explicit representation and validation.

---

# 10. Build Curiosity Through Contrasts

Readers pay attention when expectations break.

Use contrast frequently.

---

## Examples

### Before / After

```text
Before:
Runtime bug

After:
Compile-time error
```

### Assumption / Reality

```text
Most developers assume...

What actually happens...
```

### Problem / Solution

```text
Manual conversion

Automatic conversion
```

---

# 11. Use Fractal Structure

The overall article and every section should share the same pattern.

---

# Article

```text
Point
├── Section 1
├── Section 2
├── Section 3
└── Conclusion
```

---

# Section

```text
Section Point
├── Evidence
├── Example
├── Explanation
└── Mini Conclusion
```

---

# Paragraph

```text
Topic Sentence
↓
Explanation
↓
Example
↓
Implication
```

---

# 12. Paragraph Patterns

Use one of these four patterns.

---

## Pattern 1: Constant Theme

```text
Reliability improves...
Reliability reduces...
Reliability supports...
```

---

## Pattern 2: Linking Theme

```text
Failure causes degradation.
Degradation generates heat.
Heat accelerates failure.
```

---

## Pattern 3: Category Theme

```text
Asset management consists of:

- Planning
- Maintenance
- Renewal
```

Expand each.

---

## Pattern 4: Preview Theme

```text
Performance depends on:

- People
- Process
- Technology
```

Expand each.

---

# 13. Keep Promises

The heading creates a promise.

The section opening creates a promise.

The paragraph opening creates a promise.

Always fulfill it.

---

## Bad

Heading:

> Why Unit Conversions Matter

Discussion:

> TypeScript package installation

---

## Good

Heading:

> Why Unit Conversions Matter

Discussion:

> Conversion errors and consequences

---

# 14. Technical Content Template

For technical products and libraries.

---

## 1. Problem

What problem exists?

---

## 2. Cost

Why does it matter?

---

## 3. Existing Approaches

How is it currently solved?

---

## 4. Limitations

Why are existing approaches insufficient?

---

## 5. New Approach

Introduce the solution.

---

## 6. Examples

Provide code.

Provide demonstrations.

Provide outcomes.

---

## 7. Broader Implications

How does this change the way people work?

---

## 8. Conclusion

Return to the 