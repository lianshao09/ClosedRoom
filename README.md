# Closed room

A private, peer-to-peer chat that runs as a static website. No backend, no accounts, no database, no stored messages.

Two or more people type the same room phrase and their browsers connect directly to each other over WebRTC.

Live site: https://closedroom.site

I built this site for my own personal use.
If you find it useful, feel free to use it too.

## How it works

1. You enter a nickname and a room phrase.
2. Your browser hashes the lowercased phrase (SHA-256, first 32 hex characters) to get the room ID. The phrase never leaves your browser.
3. [Trystero](https://github.com/dmotz/trystero) uses public Nostr relays for signaling, encrypted with the phrase as password.
4. A direct, encrypted WebRTC connection opens and messages go browser to browser.
5. Photos and files (up to 50 MB) travel over the same direct connection. Files over 10 MB wait until the other person accepts. Only real PNG, JPEG, GIF and WebP images are shown inline; everything else is download-only.
6. Close the tab and everything is gone.

More detail, including who can see what, is in `how-it-works.html`.

## Run it

It is two static files. Upload `index.html` and `how-it-works.html` to any static host (shared hosting, GitHub Pages, Cloudflare Pages, Netlify). HTTPS is required, WebRTC does not work without it.

To try it locally:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in two browser windows. `localhost` counts as a secure context.

## Limits

- The phrase is the only lock. Anyone who guesses it can join. Use a long, random phrase.
- Each person can see the other's IP address.
- No TURN server, so some strict networks can block connections.
- Full mesh: best for 2 to about 6 people.
- Both people must be online at the same time.
- Files are kept in memory only. Very large files can crash a phone, and an interrupted transfer starts over.

## License

MIT. Take it, change it, host your own copy. See `LICENSE`.
