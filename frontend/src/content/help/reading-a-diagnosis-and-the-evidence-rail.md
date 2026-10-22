---
title: Reading a diagnosis and the Evidence Rail
slug: reading-a-diagnosis-and-the-evidence-rail
summary: How to read a suggested root cause, its confidence, and the citations behind it.
updated: 2026-10-01
---

## Opening a diagnosis

From a run, select a failed test case to open its case file. The **Diagnosis** tab shows the suggested category (for example Application Bug, Script Issue, Environment) and a confidence meter.

## The Confidence Meter

Confidence is shown as a segmented bar - filled blocks mean higher confidence. It is never a guess expressed as a vague feeling; it reflects how directly the evidence supports the suggested category. A low score, or a category of **Unknown**, means the evidence was too thin to call confidently - that's an intentional abstention, not a failure.

## The Evidence Rail

Every diagnosis cites the specific evidence behind it - a stack trace line, a log excerpt - in the Evidence Rail on the right. Selecting a citation jumps to and highlights the matching line in the evidence viewer, so you can verify the reasoning yourself rather than taking the suggestion on faith.

## What the model does and doesn't see

Before any evidence is sent for diagnosis, credentials, tokens and connection strings are redacted. See our [Security and Trust](/security) page for details on what our language model provider sees.

## This is a suggestion, not a verdict

A diagnosis is a starting point for a human reviewer, not an automatic conclusion. The next step is always a reviewer action - see **Reviewing and exporting a defect to Jira**.
