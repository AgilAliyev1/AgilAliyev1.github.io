/* ==========================================================================
   Agil Aliyev — Portfolio
   Everything here runs client-side. Nothing is sent anywhere.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- SHA-256 (WebCrypto, with a pure-JS fallback for file:// or old browsers) */
  function sha256Fallback(str) {
    const bytes = new TextEncoder().encode(str);
    const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const l = bytes.length, bitLen = l * 8;
    const n = (((l + 9 + 63) >> 6) << 6);
    const m = new Uint8Array(n); m.set(bytes); m[l] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(n - 8, Math.floor(bitLen / 2 ** 32)); dv.setUint32(n - 4, bitLen >>> 0);
    const w = new Uint32Array(64), r = (x, k) => (x >>> k) | (x << (32 - k));
    for (let o = 0; o < n; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = r(w[i-15],7) ^ r(w[i-15],18) ^ (w[i-15] >>> 3);
        const s1 = r(w[i-2],17) ^ r(w[i-2],19) ^ (w[i-2] >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0;
      }
      let [a,b,c,d,e,f,g,h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (r(e,6) ^ r(e,11) ^ r(e,25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
        const t2 = ((r(a,2) ^ r(a,13) ^ r(a,22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0]=(H[0]+a)>>>0; H[1]=(H[1]+b)>>>0; H[2]=(H[2]+c)>>>0; H[3]=(H[3]+d)>>>0;
      H[4]=(H[4]+e)>>>0; H[5]=(H[5]+f)>>>0; H[6]=(H[6]+g)>>>0; H[7]=(H[7]+h)>>>0;
    }
    return H.map(x => x.toString(16).padStart(8, "0")).join("");
  }
  async function sha256(str) {
    try {
      if (window.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
      }
    } catch (_) { /* fall through */ }
    return sha256Fallback(str);
  }

  /* ---------- Unicode-safe Base64 */
  const b64enc = s => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
  const b64dec = s => new TextDecoder().decode(Uint8Array.from(atob(s.trim()), c => c.charCodeAt(0)));

  /* ---------- Caesar */
  const caesar = (s, k) => s.replace(/[a-z]/gi, ch => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + k) % 26 + 26) % 26 + base);
  });

  /* ---------- Whisper (small toast) */
  const whisper = $(".whisper");
  let wt;
  function say(html, ms = 5200) {
    if (!whisper) return;
    whisper.innerHTML = html;
    whisper.classList.add("show");
    clearTimeout(wt);
    wt = setTimeout(() => whisper.classList.remove("show"), ms);
  }

  /* ---------- Clock (Baku time) + session uptime */
  const clock = $("[data-clock]");
  const uptime = $("[data-uptime]");
  const t0 = Date.now();
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  function tick() {
    if (clock) clock.textContent = fmt.format(new Date());
    if (uptime) {
      const s = Math.floor((Date.now() - t0) / 1000);
      uptime.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    }
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Rotating hex nonce */
  const nonce = $("[data-nonce]");
  if (nonce) {
    const roll = () => {
      const a = new Uint8Array(4); crypto.getRandomValues(a);
      nonce.textContent = "0x" + Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
    };
    roll(); if (!reduced) setInterval(roll, 2600);
  }

  /* ---------- Encrypted line in the hero (Caesar, shift 3) */
  const cl = $("[data-cipherline]");
  if (cl) {
    const btn = $("button", cl), state = $(".state", cl);
    const plain = cl.dataset.plain;
    const shift = Number(cl.dataset.shift || 3);
    const cipher = caesar(plain, shift);
    let open = false, busy = false;
    btn.textContent = cipher;
    btn.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      const target = open ? shift : 0;
      let k = open ? 0 : shift;
      const step = () => {
        btn.textContent = caesar(plain, k);
        state.textContent = `rot(-${shift}) · k=${k}`;
        if (k === target) {
          open = !open; busy = false;
          state.textContent = open ? "decrypted · caesar, k=3" : "enc · 0x03";
          btn.setAttribute("aria-label", open ? "Decrypted message. Click to encrypt again." : "Encrypted message. Click to decrypt.");
          return;
        }
        k += open ? 1 : -1;
        setTimeout(step, reduced ? 0 : 220);
      };
      step();
    });
  }

  /* ---------- Hex section labels: hex → binary → decimal → hex */
  $$(".hexlabel[data-n]").forEach(el => {
    const n = Number(el.dataset.n), name = el.dataset.name || "";
    const forms = [
      `0x${n.toString(16).padStart(2, "0")} / ${name}`,
      `<span class="alt">0b${n.toString(2).padStart(8, "0")}</span> / ${name}`,
      `<span class="alt">${String(n).padStart(3, "0")}</span> / ${name.split("").map(c => c.charCodeAt(0).toString(16)).join(" ")}`
    ];
    let i = 0;
    el.innerHTML = forms[0];
    el.addEventListener("click", () => { i = (i + 1) % forms.length; el.innerHTML = forms[i]; });
  });

  /* ---------- The full stop after the name */
  const stop = $(".name .stop");
  if (stop) {
    let n = 0;
    const lines = [
      `<span class="p">$</span> stat .\n  a full stop is also a hint: nothing here is only decoration.`,
      `<span class="p">$</span> echo $CURIOSITY\n  unbounded`,
      `<span class="p">$</span> cat /etc/motd\n  Read the docs. Then read the source. Then read the traffic.`
    ];
    stop.addEventListener("click", () => say(lines[n++ % lines.length]));
    stop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stop.click(); } });
  }

  /* ---------- Network diagram */
  $$("[data-net]").forEach(net => {
    const out = $(".readout", net);
    const def = out ? out.textContent : "";
    $$("g.node", net).forEach(g => {
      const lines = $$(`line[data-to="${g.dataset.id}"]`, net);
      const on = () => { g.classList.add("on"); lines.forEach(l => l.classList.add("on")); if (out) out.textContent = g.dataset.info; };
      const off = () => { g.classList.remove("on"); lines.forEach(l => l.classList.remove("on")); if (out) out.textContent = def; };
      g.addEventListener("mouseenter", on); g.addEventListener("mouseleave", off);
      g.addEventListener("focus", on); g.addEventListener("blur", off);
    });
  });

  /* ---------- Lab: Base64 */
  const b64 = $("[data-b64]");
  if (b64) {
    const shown = $(".b64", b64), tog = $("[data-b64-toggle]", b64);
    const original = shown.textContent.trim();
    let decoded = false;
    tog.addEventListener("click", () => {
      decoded = !decoded;
      shown.textContent = decoded ? b64dec(original) : original;
      shown.classList.toggle("decoded", decoded);
      tog.textContent = decoded ? "Encode again" : "Decode";
    });
    const inp = $("[data-b64-in]", b64), res = $("[data-b64-out]", b64);
    const run = mode => {
      const v = inp.value;
      if (!v) { res.textContent = "—"; return; }
      try { res.textContent = mode === "enc" ? b64enc(v) : b64dec(v); }
      catch (_) { res.textContent = "error: not valid Base64"; }
    };
    $("[data-b64-enc]", b64).addEventListener("click", () => run("enc"));
    $("[data-b64-dec]", b64).addEventListener("click", () => run("dec"));
  }

  /* ---------- Lab: Caesar */
  const cz = $("[data-caesar]");
  if (cz) {
    const inp = $("textarea", cz), rng = $("input[type=range]", cz), k = $("[data-k]", cz), out = $("[data-caesar-out]", cz), brute = $("[data-brute]", cz);
    const run = () => { k.textContent = String(rng.value).padStart(2, "0"); out.textContent = caesar(inp.value, Number(rng.value)) || "—"; };
    inp.addEventListener("input", run); rng.addEventListener("input", run);
    brute.addEventListener("click", () => {
      const src = out.textContent === "—" ? inp.value : out.textContent;
      out.innerHTML = "";
      for (let i = 1; i < 26; i++) {
        const row = document.createElement("div");
        row.textContent = `k=${String(i).padStart(2, "0")}  ${caesar(src, -i)}`;
        out.appendChild(row);
      }
      out.classList.add("small");
    });
    inp.addEventListener("input", () => out.classList.remove("small"));
    rng.addEventListener("input", () => out.classList.remove("small"));
    run();
  }

  /* ---------- Lab: SHA-256 */
  const hs = $("[data-hash]");
  if (hs) {
    const inp = $("textarea", hs), out = $("[data-hash-out]", hs), bits = $("[data-hash-bits]", hs);
    let prev = null;
    const run = async () => {
      const h = await sha256(inp.value);
      out.textContent = h;
      if (prev && bits) {
        let diff = 0;
        for (let i = 0; i < 64; i++) {
          let x = parseInt(h[i], 16) ^ parseInt(prev[i], 16);
          while (x) { diff += x & 1; x >>= 1; }
        }
        bits.textContent = `${diff}/256 bits changed since last input`;
      }
      prev = h;
    };
    inp.addEventListener("input", run);
    $("[data-hash-go]", hs).addEventListener("click", run);
    run();
  }

  /* ---------- Footer: the year that won't sit still */
  const yr = $("button.year");
  if (yr) {
    const y = new Date().getFullYear();
    const forms = [String(y), "0x" + y.toString(16).toUpperCase(), "0b" + y.toString(2), String(Math.floor(Date.now() / 1000)) + " (unix)", b64enc(String(y)), "still learning"];
    let i = 0;
    yr.textContent = forms[0];
    yr.addEventListener("click", () => { i = (i + 1) % forms.length; yr.textContent = forms[i]; });
  }

  /* ---------- Footer fingerprint: sha256 of the name */
  const fp = $("[data-fingerprint]");
  if (fp) {
    const pre = fp.dataset.fingerprint;
    sha256(pre).then(h => {
      const short = h.slice(0, 8) + "…" + h.slice(-8);
      fp.textContent = "sha256 " + short;
      fp.title = h;
      let full = false;
      fp.addEventListener("click", () => {
        full = !full;
        fp.textContent = full ? `sha256("${pre}") = ${h}` : "sha256 " + short;
      });
      fp.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fp.click(); } });
    });
  }

  /* ---------- Keyboard: type a command anywhere (not inside a field) */
  const cmds = {
    whoami: () => `<span class="p">$</span> whoami\nagil\n<span class="p">$</span> id\nuid=1000(agil) gid=1000(students) groups=ada,ctf,research`,
    sudo: () => `<span class="p">$</span> sudo -l\nagil is not in the sudoers file. This incident will be reported.\n(Kidding. But that's how it should be configured.)`,
    nmap: () => `<span class="p">$</span> nmap -sV agil\nPORT     STATE  SERVICE\n22/tcp   open   curiosity\n443/tcp  open   learning\n8080/tcp closed ego`,
    ls: () => `<span class="p">$</span> ls -a\n.  ..  .hidden  index.html  robots.txt  projects/`,
    help: () => `<span class="p">$</span> help\nthere is no manual. try the usual suspects.`,
    exit: () => `<span class="p">$</span> exit\nlogout. (You can close the tab, but the curiosity stays.)`
  };
  let buf = "";
  document.addEventListener("keydown", e => {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-12);
    for (const c in cmds) if (buf.endsWith(c)) { say(cmds[c]()); buf = ""; break; }
  });

  /* ---------- Reveal on scroll */
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  } else {
    $$(".reveal").forEach(el => el.classList.add("in"));
  }

  /* ---------- Active nav item */
  const links = $$(".nav a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    const io2 = new IntersectionObserver(es => es.forEach(en => {
      const a = map.get(en.target.id);
      if (a && en.isIntersecting) { links.forEach(l => l.removeAttribute("aria-current")); a.setAttribute("aria-current", "true"); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io2.observe(s); });
  }

  /* ---------- For the people who open DevTools first */
  console.log(
    "%cagil aliyev%c\n\nYou opened the console. Good instinct.\nThere is more than one thing hidden here. robots.txt is a fine place to start.\n\n" +
    "U29tZXRpbWVzIHRoZSBiZXN0IGZpbmRpbmcgaXMgdGhlIG9uZSBub2JvZHkgbG9va2VkIGZvci4=",
    "font: 600 18px 'Inter Tight', sans-serif; color:#1e4a37", "font: 12px monospace; color:#555"
  );
})();
