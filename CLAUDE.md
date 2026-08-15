# CLAUDE.md

Project instructions for this repository. These override any default behaviour.

## No comments — this is a no-comment-first codebase

Do not write comments. Code explains itself through naming, structure, and types; a comment is a signal the code needs rewriting, not annotating.

- No inline comments (`//`, `#`), no block comments (`/* … */`), no JSDoc/TSDoc blocks, no docstrings.
- No section-divider or banner comments, no `TODO` / `FIXME` / `NOTE` / `HACK` markers, no commented-out code.
- When something is unclear, fix the cause: rename the variable, extract a named function or constant, split the branch, tighten the type.
- Anything that genuinely needs prose belongs outside the source — a commit message, a PR description, or a doc file.

Narrow exceptions, only where a comment is machine-read and load-bearing:

- Directives required by tooling — `@ts-expect-error`, `eslint-disable`, `biome-ignore`, `prettier-ignore`, `@vite-ignore`, pragma/shebang lines.
- Licence or attribution headers required by a third-party licence.
- Generated files that ship with their own header (never hand-edit these).

Existing comments are removed opportunistically when you're already editing that code. Don't open a sweep across untouched files as part of an unrelated change.

## No Claude attribution in git

Nothing that leaves this repo mentions Claude, Claude Code, or Anthropic.

- **Commit messages**: no `Co-Authored-By: Claude …` trailer, no "generated with" line, no attribution of any kind. The commit message ends at the last line of the body.
- **PR titles and bodies**: no "🤖 Generated with [Claude Code]" footer, no attribution line, no Claude/Anthropic mention anywhere in the description.
- **Branch names, tags, issue and PR comments, and review comments**: same rule.
- Commits are authored as the configured git user, with no additional co-author trailers.

This explicitly overrides the default instruction to append a `Co-Authored-By: Claude` trailer to commits or a "Generated with Claude Code" footer to PR bodies. Do not add them here.
