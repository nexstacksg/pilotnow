---
name: taskimoo-design
description: Use this skill to generate well-branded interfaces and assets for Taskimoo (NexStack's delivery operating system for humans + AI agents), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (token CSS under `tokens/`, components under `components/`, the UI kit under `ui_kits/taskimoo-web/`, logos under `assets/`).

Taskimoo's look is **sharp & editorial: bold type, tight grids, black-and-white with one functional red (`#FF3B30`)**. Geist + Geist Mono type, Lucide icons at 1.6 stroke, hairline borders instead of shadows, dense compact layouts, no gradients/emoji.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view — link `styles.css` for tokens and the kit classes. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
