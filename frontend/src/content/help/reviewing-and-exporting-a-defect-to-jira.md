---
title: Reviewing and exporting a defect to Jira
slug: reviewing-and-exporting-a-defect-to-jira
summary: How to accept, reject or correct a diagnosis, and export a confirmed defect.
updated: 2026-10-01
---

## Reviewing a diagnosis

Once a diagnosis is ready, a Reviewer can take one of three actions from the case file's Diagnosis tab:

- **Accept** - the suggested category is correct
- **Reject** - the suggestion isn't useful; no defect is created from it
- **Correct** - choose the right category yourself, optionally with a short reason

Every reviewer action is recorded, so there's always a record of who confirmed or corrected a diagnosis and when.

## Exporting a defect

After a diagnosis is accepted or corrected, select **Create defect export** from the case file. This opens a draft containing the evidence-linked summary, ready for a reviewer to finalize before it's sent to Jira.

## Why exports are idempotent

Exporting the same confirmed defect twice will not create a duplicate issue in Jira - the export is designed to be safely retried if, for example, a network error interrupts the first attempt.

## Who can review

Reviewing diagnoses and exporting defects both require the Reviewer role or above - see **Roles and permissions** for the full list.
