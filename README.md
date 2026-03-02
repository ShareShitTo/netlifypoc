# netlifypoc

This repository is a focused round-trip proof of concept for deploying ShareShit to Netlify.

The goal is to validate the full path:

local changes -> Git commit -> GitHub push -> Netlify deploy

It exists to prove that workflow end-to-end, not to represent the full production project.

## Longer Pitch

http://ShareShit.to is a self-hosted sharing tool for text, images, and files that you can deploy on Netlify, Cloudflare, Vercel, a VPS, or wherever you prefer.

Create a share in a simple blocks UI with markdown, images, and files, optionally add a password, and send a link.

The key difference is that encryption happens in the browser. Your server stores only ciphertext, so even the instance owner cannot read password-protected content without the secret.

You get SaaS-level convenience without handing your data to a SaaS company.

## Tradeoffs

This is Self Owned-SaaS, so you deploy and maintain your own instance (with low-touch free options available).

Each hosting platform has limits. Free tiers can pause, throttle, or cap storage and bandwidth.

In return, you get control, privacy, and portability with your domain, your data, and your rules.
