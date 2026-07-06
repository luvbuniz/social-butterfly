# Snippets for stackadoo.com

Two copy-paste upgrades for the game site itself. These matter more than any
amount of posting — they turn every player into a promoter.

| File | What it does | Where it goes |
|---|---|---|
| `og-tags.html` | Makes stackadoo.com links show a game image + tagline when pasted anywhere (Discord, iMessage, X, Reddit…) instead of a bare link | Inside `<head>` of every page |
| `share-score.html` | A "Share my score" button for the game-over screen — opens the phone's share sheet (or copies the brag text on desktop) | Game-over screen, wired to your score variable |

Both are plain HTML/JS, no libraries. Each file has TODO comments for the two
or three things to fill in (image URL, your score variable).

After adding the OG tags, paste stackadoo.com into a Discord message to see the
card. If it shows the old bare link, append `?v=2` once — most previews cache.
