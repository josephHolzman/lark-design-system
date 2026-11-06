# Service logos

Marks for the services Lark shows as sources and destinations (Salesforce, Outlook, Slack, Teams,
SharePoint, Google Meet, Zoom, Excel, Word, Snowflake) and the ACE mark. Most are copied from
deepgrids-ACE (`src/assets/logos`, `ACELogo.svg`); `snowflake.svg` comes from the Deepgrids
workspace (`apps/enterprise-workspace/public/assets/snowflake.svg`).

Two marks are Lark's own, not any company's: `mcp.svg` (a plug, for any MCP server) and
`email.svg` (an envelope, for generic email). Both are 24×24, solid paper-ramp fills (paper-10
tile, paper-70 glyph), no `currentColor`, so they read the same in light and dusk.

`src/components/lark/logos.data.ts` embeds them as data URIs so the package needs no asset loader.
After changing a file here, add its name to `NAMES` in `build.py` if it's new, then regenerate
(any Python 3):

```bash
python design/logos/build.py
```

`serviceKey()` maps names to these keys ("snowflake"; "mcp" or "model context protocol";
"email", "e-mail", "mail" or "mailbox"; only "outlook" gets Outlook's mark). Apps with a mark Lark
doesn't ship pass `ServiceLogo src` (https:, `data:image/` or a relative path).

**Nominative use.** Third-party logos identify integrations only: unaltered, in their own colours,
always next to the service's name, never as decoration. Follow each brand's guidelines; the same
applies to marks an app passes through `src`.
