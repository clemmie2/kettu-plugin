# ServerGuard

ServerGuard is a Kettu/Vendetta-style Discord Android plugin for
locally auditing member information that is already available
to the Discord client.

## Features

- Scan the current server
- Configure words and phrases
- Check usernames
- Check display names
- Check server nicknames
- Show matching users
- Show the matched field
- Show the matched phrase
- Local-only scanning

## Important

ServerGuard does not:

- bypass Discord permissions
- access hidden channels
- retrieve hidden messages
- read inaccessible profile information
- automatically ban users
- automatically kick users
- automatically mute users

## Build

```bash
npm install
npm run build