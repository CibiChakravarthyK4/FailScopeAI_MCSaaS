---
title: Roles and permissions
slug: roles-and-permissions
summary: What each role in a workspace can see and do.
updated: 2026-10-01
---

## Roles within your workspace

Every member of a workspace has one of these roles:

- **Admin** - full access, including workspace settings and usage
- **Analyst** - can import runs and view diagnoses, but cannot review or export defects
- **Reviewer** - can additionally accept, reject or correct diagnoses and export defects
- **Viewer** - read-only access to runs, diagnoses and defects

Every workspace is fully isolated from every other workspace - your data is never visible to another organization using RootTrace Ivory, regardless of role.

## The Platform Owner role

RootTrace Ivory also has a separate **Platform Owner** role, limited to the product's own team. It sits outside every workspace and can only see account, plan and billing information across workspaces - never your test artifacts, logs, screenshots or diagnoses. See our [Security and Trust](/security) page for more detail.

## Changing a member's role

Workspace Admins can change another member's role from the workspace settings. If you don't see a settings option you expect, you may need an Admin on your workspace to grant it.
