# Avatar Upload Guide

All export files live in `public/brand/avatar-exports/`. After any brand update, regenerate with:

```bash
npm run generate-favicons
```

---

## Platform uploads

### GitHub
File: `avatar-github.png` (460×460)
1. Go to [github.com/settings/profile](https://github.com/settings/profile)
2. Click your current avatar
3. Upload `avatar-github.png`
4. Save

### LinkedIn
File: `avatar-linkedin.png` (400×400)
1. Go to your profile → Edit
2. Click the profile photo circle
3. Upload `avatar-linkedin.png`
4. Save

### Twitter / X
File: `avatar-twitter.png` (400×400)
1. Profile → Edit profile
2. Click the avatar
3. Upload `avatar-twitter.png`
4. Apply

### Slack (any workspace)
File: `avatar-slack.png` (512×512)
1. Click your name → Profile → Edit
2. Upload photo → `avatar-slack.png`
3. Save

### Other platforms (Discord, Notion, Figma, etc.)
Use `avatar-square-512.png` or `avatar-square-1024.png`.

### Light-mode contexts
`avatar-inverted-512.png` — dark needle on amber background. Use wherever a light backdrop requires contrast.

---

## File reference

| File | Size | Use |
|------|------|-----|
| `avatar-github.png` | 460×460 | GitHub profile |
| `avatar-linkedin.png` | 400×400 | LinkedIn profile |
| `avatar-twitter.png` | 400×400 | Twitter / X |
| `avatar-slack.png` | 512×512 | Slack workspace |
| `avatar-square-512.png` | 512×512 | Generic square |
| `avatar-square-1024.png` | 1024×1024 | High-res square |
| `avatar-inverted-512.png` | 512×512 | Light-mode / foil stamp |

All avatars: amber needle on `#0E0A06` dark background, 18% padding.
