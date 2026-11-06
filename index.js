(() => {
    const $ = (sel, root = document) => root.querySelector(sel);
    const body = $('#main');
    const output = $('#output');
    const form = $('#prompt');
    const input = $('#cmd-input');
    const mode = $('.status .mode');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    $('#year').textContent = new Date().getFullYear();

    /* ---------- themes ---------- */
    const THEMES = ['green', 'amber', 'ice'];
    const setTheme = (name) => {
        document.documentElement.dataset.theme = name;
        try { localStorage.setItem('theme', name); } catch (_) {}
    };
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (_) {}
    if (THEMES.includes(saved)) setTheme(saved);
    const currentTheme = () => document.documentElement.dataset.theme || 'green';
    const cycleTheme = () => setTheme(THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length]);
    $('#theme-btn').addEventListener('click', cycleTheme);

    /* ---------- typed intro ---------- */
    const typed = $('#typed');
    if (!reduceMotion) {
        const full = typed.textContent;
        typed.textContent = '';
        let i = 0;
        const tick = () => {
            typed.textContent = full.slice(0, ++i);
            if (i < full.length) setTimeout(tick, 28 + Math.random() * 40);
        };
        setTimeout(tick, 350);
    }

    /* ---------- commands ---------- */
    const section = (id) => () => {
        const src = document.getElementById(id);
        const frag = document.createDocumentFragment();
        src.querySelectorAll('.out').forEach((n) => frag.appendChild(n.cloneNode(true)));
        return frag;
    };
    const open = (url, label) => () => {
        window.open(url, '_blank', 'noopener');
        return `opening ${label}…`;
    };

    const COMMANDS = {
        help:      { desc: 'list available commands', run: () => helpList() },
        whoami:    { desc: 'who is this?', run: () => 'Aanu Babajide — Quant Analyst, ML & Data engineer, London' },
        about:     { desc: 'a little about me', run: section('about') },
        work:      { desc: 'career so far', run: section('work') },
        projects:  { desc: 'things I build', run: section('projects') },
        stack:     { desc: 'tools I use', run: section('stack') },
        education: { desc: 'education & awards', run: section('education') },
        contact:   { desc: 'where to find me', run: section('contact') },
        github:    { desc: 'open GitHub', run: open('https://github.com/anubabajide', 'github') },
        linkedin:  { desc: 'open LinkedIn', run: open('https://www.linkedin.com/in/aanub', 'linkedin') },
        theme:     { desc: `switch colours [${THEMES.join('|')}]`, run: (arg) => {
            if (!arg) { cycleTheme(); return `theme: ${currentTheme()}`; }
            if (!THEMES.includes(arg)) return err(`theme: unknown theme '${arg}'`);
            setTheme(arg);
            return `theme: ${arg}`;
        } },
        clear:     { desc: 'clear the screen', run: () => { output.replaceChildren(); return null; } },
    };

    // hidden extras
    const EXTRAS = {
        ls: () => 'about.md  career.log  education.log  projects/  stack.toml  contact.sh',
        pwd: () => '/home/user/portfolio',
        date: () => new Date().toString(),
        echo: (...args) => args.join(' '),
        sudo: () => err('user is not in the sudoers file. This incident will be reported.'),
        chess: () => '1. e4 — your move.',
        exit: () => 'there is no escape. try `help`.',
    };

    function err(msg) {
        const p = document.createElement('p');
        p.className = 'err';
        p.textContent = msg;
        return p;
    }

    function helpList() {
        const wrap = document.createElement('div');
        wrap.className = 'out help-list';
        for (const [name, { desc }] of Object.entries(COMMANDS)) {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = name;
            b.addEventListener('click', () => run(name));
            const d = document.createElement('span');
            d.className = 'dim';
            d.textContent = desc;
            wrap.append(b, d);
        }
        const tip = document.createElement('p');
        tip.className = 'dim';
        tip.textContent = 'tip: Tab completes, ↑/↓ browses history.';
        const frag = document.createDocumentFragment();
        frag.append(wrap, tip);
        return frag;
    }

    /* ---------- runner ---------- */
    const history = [];
    let hIndex = 0;

    function echoLine(text) {
        const p = document.createElement('p');
        p.className = 'cmd';
        const ps1 = document.createElement('span');
        ps1.className = 'ps1';
        ps1.textContent = 'user@aanubabajide:~$';
        p.append(ps1, document.createTextNode(' ' + text));
        return p;
    }

    function run(raw) {
        const line = raw.trim();
        const entry = document.createElement('div');
        entry.appendChild(echoLine(line));

        if (line) {
            history.push(line);
            const [name, ...args] = line.split(/\s+/);
            const key = name.toLowerCase();
            let result;
            if (COMMANDS[key]) result = COMMANDS[key].run(...args);
            else if (EXTRAS[key]) result = EXTRAS[key](...args);
            else result = err(`command not found: ${name}. Type 'help'.`);

            if (key === 'clear') { hIndex = history.length; return; }
            if (typeof result === 'string') {
                const p = document.createElement('p');
                p.className = 'out';
                p.textContent = result;
                entry.appendChild(p);
            } else if (result) {
                entry.appendChild(result);
            }
        }
        hIndex = history.length;
        output.appendChild(entry);
        input.scrollIntoView({ block: 'end', behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        run(input.value);
        input.value = '';
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && history.length) {
            e.preventDefault();
            hIndex = Math.max(0, hIndex - 1);
            input.value = history[hIndex];
        } else if (e.key === 'ArrowDown' && history.length) {
            e.preventDefault();
            hIndex = Math.min(history.length, hIndex + 1);
            input.value = history[hIndex] ?? '';
        } else if (e.key === 'Tab') {
            const v = input.value.trim().toLowerCase();
            if (!v || v.includes(' ')) return;
            const matches = Object.keys(COMMANDS).filter((c) => c.startsWith(v));
            if (!matches.length) return;
            e.preventDefault();
            if (matches.length === 1) input.value = matches[0] + ' ';
            else {
                const entry = document.createElement('div');
                const p = document.createElement('p');
                p.className = 'out dim';
                p.textContent = matches.join('  ');
                entry.append(echoLine(input.value), p);
                output.appendChild(entry);
                input.scrollIntoView({ block: 'end' });
            }
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            output.replaceChildren();
        }
    });

    input.addEventListener('focus', () => { mode.textContent = 'INSERT'; });
    input.addEventListener('blur', () => { mode.textContent = 'NORMAL'; });

    // click on empty terminal space focuses the prompt (but never steals text selection or links)
    body.addEventListener('click', (e) => {
        if (e.target.closest('a, button, input') || String(getSelection())) return;
        input.focus({ preventScroll: true });
    });

    // keep focus on the prompt when the user just starts typing
    document.addEventListener('keydown', (e) => {
        if (document.activeElement === input || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key.length === 1 && !/^(INPUT|TEXTAREA|BUTTON|A)$/.test(document.activeElement.tagName)) {
            input.focus({ preventScroll: true });
        }
    });
})();
