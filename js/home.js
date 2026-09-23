// The homepage desktop: windows you can open, close, focus and drag,
// plus the taskbar, Start menu, clock, visit counter and random facts.

(() => {
    const FACTS = [
        'The first website, info.cern.ch, went online in 1991. CERN restored it in 2013, and you can still visit it.',
        "The website for the 1996 movie Space Jam stayed online, almost unchanged, for more than two decades.",
        'The <blink> tag came from Netscape. Internet Explorer had <marquee> instead. The Silly Store uses marquees on purpose.',
        'GeoCities hosted millions of personal homepages before Yahoo shut it down in the US in 2009.',
        'The "web-safe" color palette had 216 colors, chosen to look the same on screens that could only show 256.',
        'Comic Sans was designed by Vincent Connare at Microsoft in 1994.',
        'Web badges like the ones in links.htm are 88 by 31 pixels. That was the standard size.',
        'The story that "404 Not Found" is named after a room at CERN is a myth.',
        '2048 was made by Gabriele Cirulli in a single weekend in 2014, when he was 19.',
        'Philips introduced the Airfryer in 2010.',
        'Norbit was nominated for the Academy Award for Best Makeup.',
        'Eddie Murphy plays three characters in Norbit: Norbit, Rasputia and Mr. Wong.',
        'M. Night Shyamalan co-wrote the screenplay for Stuart Little (1999).',
        'Hugh Laurie, later Dr. House, plays Mr. Little in Stuart Little.',
        'Snowbell, the cat who keeps trying to eat Stuart Little, is voiced by Nathan Lane.',
        'Sony stopped making Betamax cassettes in 2016, 41 years after the format launched.',
        'A LaserDisc is 30 centimeters across, the same size as a vinyl LP.',
        'Blu-ray is named after the blue-violet laser it uses to read discs.',
        'DVDs went on sale in Japan in 1996 and in the US in 1997.',
        'The Konami code (up, up, down, down, left, right, left, right, B, A) first appeared in Gradius on the NES in 1986.'
    ];

    const windows = Array.from(document.querySelectorAll('.window'));
    const tasks = document.querySelector('.tasks');
    const wide = matchMedia('(min-width: 900px)');
    let topZ = 1;

    // Taskbar: one button per window
    const taskButtons = new Map();
    windows.forEach(win => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.open = win.id;
        button.textContent = win.querySelector('.title').textContent;
        tasks.appendChild(button);
        taskButtons.set(win, button);
    });

    function updateTasks() {
        windows.forEach(win => {
            const button = taskButtons.get(win);
            button.setAttribute('aria-pressed', String(win.classList.contains('is-active') && !win.hidden));
            button.classList.toggle('is-closed', win.hidden);
        });
    }

    function focusWindow(win) {
        win.style.zIndex = ++topZ;
        windows.forEach(w => w.classList.toggle('is-active', w === win));
        updateTasks();
    }

    function openWindow(id) {
        const win = document.getElementById(id);
        win.hidden = false;
        focusWindow(win);
        const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
        win.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
        win.focus({ preventScroll: true });
    }

    function closeWindow(win) {
        win.hidden = true;
        win.classList.remove('is-active');
        updateTasks();
        taskButtons.get(win).focus();
    }

    document.addEventListener('click', e => {
        const opener = e.target.closest('[data-open]');
        if (opener) {
            openWindow(opener.dataset.open);
            closeStartMenu();
        }
    });

    windows.forEach(win => {
        win.addEventListener('pointerdown', () => focusWindow(win));
        win.addEventListener('focusin', () => {
            if (!win.classList.contains('is-active')) focusWindow(win);
        });
        win.querySelector('.close').addEventListener('click', () => closeWindow(win));

        // Drag by the title bar (wide screens only)
        const bar = win.querySelector('.titlebar');
        bar.addEventListener('pointerdown', e => {
            if (!wide.matches || e.button !== 0 || e.target.closest('button')) return;
            e.preventDefault();
            const startX = e.clientX - (Number(win.dataset.dx) || 0);
            const startY = e.clientY - (Number(win.dataset.dy) || 0);
            bar.setPointerCapture(e.pointerId);
            win.classList.add('is-dragging');

            const onMove = ev => {
                win.dataset.dx = ev.clientX - startX;
                win.dataset.dy = ev.clientY - startY;
                win.style.translate = `${win.dataset.dx}px ${win.dataset.dy}px`;
            };
            const onEnd = () => {
                bar.removeEventListener('pointermove', onMove);
                bar.removeEventListener('pointerup', onEnd);
                bar.removeEventListener('pointercancel', onEnd);
                win.classList.remove('is-dragging');
            };
            bar.addEventListener('pointermove', onMove);
            bar.addEventListener('pointerup', onEnd);
            bar.addEventListener('pointercancel', onEnd);
        });
    });

    // Narrow screens stack the windows, so dragged offsets are dropped
    wide.addEventListener('change', () => {
        if (wide.matches) return;
        windows.forEach(win => {
            win.style.translate = '';
            delete win.dataset.dx;
            delete win.dataset.dy;
        });
    });

    // Start menu
    const start = document.querySelector('.start');
    const menu = document.getElementById('startMenu');

    function closeStartMenu() {
        menu.hidden = true;
        start.setAttribute('aria-expanded', 'false');
    }

    start.addEventListener('click', e => {
        e.stopPropagation();
        const open = menu.hidden;
        menu.hidden = !open;
        start.setAttribute('aria-expanded', String(open));
        if (open) menu.querySelector('a, button').focus();
    });
    document.addEventListener('click', e => {
        if (!menu.hidden && !menu.contains(e.target)) closeStartMenu();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !menu.hidden) {
            closeStartMenu();
            start.focus();
        }
    });

    // Clock
    const clock = document.getElementById('clock');
    function tick() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        clock.dateTime = now.toISOString();
    }
    tick();
    setInterval(tick, 15000);

    // Visit counter (this browser only)
    let visits = 1;
    try {
        visits = (Number(localStorage.getItem('homeVisits')) || 0) + 1;
        localStorage.setItem('homeVisits', visits);
    } catch (e) {
        // Storage blocked: count this visit only
    }
    document.getElementById('visits').textContent = String(visits).padStart(6, '0');

    // Random facts, shuffled so none repeats until all have been shown
    const order = FACTS.map((fact, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    let factIndex = 0;
    function showFact() {
        document.getElementById('fact').textContent = FACTS[order[factIndex]];
        document.getElementById('factCount').textContent = `Fact ${factIndex + 1} of ${FACTS.length}`;
    }
    document.getElementById('nextFact').addEventListener('click', () => {
        factIndex = (factIndex + 1) % FACTS.length;
        showFact();
    });
    showFact();

    focusWindow(windows[0]);
})();
