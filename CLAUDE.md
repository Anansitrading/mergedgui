# Project Guidelines

## Deployment Verification

When verifying deployments in the GUI (app.kijko.nl), always use firecrawl with screenshot format:

```json
{
  "url": "https://app.kijko.nl",
  "formats": ["markdown", "screenshot"]
}
```

This provides both text content and visual confirmation. Do not use Playwright as it cannot run as root user.
