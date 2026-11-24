# Agil Aliyev — Portfolio

Plain HTML, CSS and vanilla JS. No build step, no framework, no trackers.
Published with GitHub Pages.

## Open it
Double-click `index.html`, or for the most accurate result run a tiny local server:

    cd portfolio
    python3 -m http.server 8000
    # then open http://localhost:8000

## Structure
    index.html                 homepage (hero, about, experience, skills, work, research, lab, education, contact)
    projects/
      research.html            R-92 research project (marked IN PROGRESS)
      cyberarena.html          T-01 AzInTelecom internship task
      vulnsocial.html          T-02 AzInTelecom internship task
      devsecops.html           T-03 AzInTelecom internship task
    assets/css/style.css       all styling (colour tokens at the top)
    assets/js/main.js          crypto experiments, easter eggs, clock
    assets/cv/                 Agil_Aliyev_CV.pdf
    assets/reports/            VulnSocial report (redacted)
    assets/img/                screenshots go here
    robots.txt                 easter egg -> /vault/
    vault/index.html           hidden flag page
    humans.txt, .well-known/security.txt

## Hidden things (spoilers)
- Hero `msg.enc` line: Caesar-encrypted, click to decrypt (animated rot).
- The green full stop after "ALIYEV": click for small terminal messages.
- Section labels (`0x01 / about`): click to cycle hex -> binary -> decimal + ASCII hex.
- Type anywhere (outside inputs): `whoami`, `sudo`, `nmap`, `ls`, `help`, `exit`.
- Footer year: click to cycle hex / binary / unix time / Base64.
- Footer fingerprint: real SHA-256 of the name, click to expand.
- HTML comment in the source + a DevTools console message with Base64.
- `robots.txt` disallows `/vault/`, which holds a flag.
- About-section network graph: hover/focus nodes.

## TODO
- [ ] Update the CV PDF
- [ ] Research page: results once evaluation is done
