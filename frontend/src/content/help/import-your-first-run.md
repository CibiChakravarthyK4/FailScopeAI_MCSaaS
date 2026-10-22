---
title: Import your first run
slug: import-your-first-run
summary: How to upload a JUnit XML report, logs and screenshots to start an investigation.
updated: 2026-10-01
---

## Before you start

You'll need a JUnit XML report from your test run. Most test runners (pytest, JUnit, Jest with a JUnit reporter, and others) can produce one.

## Step 1: Open Import run

From the Dashboard or the Runs page, select **Import run**. This opens a three-step wizard.

## Step 2: Upload your files

Drag and drop your JUnit XML file into the first drop zone. It must be a `.xml` file under 25 MB. You'll see a quick preview showing how many tests and failures were found as soon as it's recognized.

Logs and screenshots are optional, but attaching them gives the diagnosis more evidence to work with. Each attachment can be up to 10 MB.

## Step 3: Fill in the details

Give the run a name (it's prefilled from your file name), and optionally a build number, branch and environment. A unique run ID is assigned automatically when you import - you don't need to invent one.

## Step 4: Confirm and import

Review the summary, then select **Start analysis**. You'll see a progress screen while the run is parsed and evidence is prepared - you can safely leave this page and come back later.

## What happens next

Once the run finishes processing, open it to see each failed test case, its evidence, and - once you run a diagnosis - a suggested root cause for your review.
