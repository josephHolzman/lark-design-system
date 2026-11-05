# Service logos

Marks for the services Lark shows as sources and destinations (Salesforce, Outlook, Slack, Teams,
SharePoint, Google Meet, Zoom, Excel, Word) and the ACE mark. Copied from deepgrids-ACE
(`src/assets/logos`, `ACELogo.svg`).

`src/components/lark/logos.data.ts` embeds them as data URIs so the package needs no asset loader.
After changing a file here, regenerate it (any Python 3):

```bash
python design/logos/build.py
```

Third-party logos identify integrations only: unaltered, in their own colours, always next to the
service's name, never as decoration.
