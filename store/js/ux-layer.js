// The layer on top of the store: animation switch, motion warning, and explain mode.
// Loaded in <head> so the animation setting applies before the page first paints.

(() => {
    // Each page's intentional UX violations: which elements, which rule, and how it's broken.
    const UX_NOTES = {
        'index.html': [
            { sel: '.quick-actions-grid', law: "Hick's law", note: '34 buttons in one grid, and only 4 of them do anything.' },
            { sel: '.quick-actions-grid a', law: 'Primacy effect', note: "There's no navigation bar (it's in the HTML, but hidden). Browse, Cart, Home and Login are buried at positions 6, 12, 20 and 27 of the Quick Actions grid, far down the page." },
            { sel: '#bannerCarousel', law: 'Dark pattern', note: 'Fake urgency and discounts: "90% OFF" with fine print saying it won\'t be applied, and "ONLY 3 LEFT". Slides change every 2 seconds, too fast to read.' },
            { sel: '.live-stats', law: 'Dark pattern', note: 'Fake social proof. The viewer and visitor counts are random numbers, regenerated every few seconds.' },
            { sel: '.trust-badges-section', law: 'Gestalt principles', note: "Trust badges that admit they're fake, each with its own border and colors, so they don't read as a group." },
            { sel: 'marquee', law: "Jakob's law", note: "Scrolling marquee text is a 1990s pattern visitors don't expect today, and three of them move in different directions." },
            { sel: '.gif-container', law: 'Accessibility', note: 'Animated GIFs with useless alt text like "monkey" and "stu", or none at all. A screen reader user learns nothing.' },
            { sel: 'header h1', law: 'Color and typography', note: 'Three novelty fonts (Kablammo, Henny Penny, Comic Sans) and a title that cycles through the rainbow. Body text is salmon on pale yellow, far below readable contrast.' },
            { sel: '#cookieConsent', law: 'Dark pattern', note: 'The cookie banner makes "Accept All" big and green. "Cookie Settings" just closes the banner.' },
            { sel: '#newsletterModal .newsletter-content', law: 'Bad interaction', note: '"Maybe later" brings the newsletter pop-up back after 15 seconds, forever.' },
            { sel: '#dealModal .deal-content', law: 'Dark pattern', note: 'A countdown that restarts at 5:00 when it runs out, and a close button that shames you: "Close (You\'ll regret this)".' },
            { sel: '#chatbotWidget', law: 'Bad interaction', note: 'Closing the chatbot makes it come back sooner each time, down to one second.' }
        ],
        'login.html': [
            { sel: 'nav', law: 'Layout patterns', note: 'The navigation bar is flipped upside down with its links in reverse order. Every store page puts navigation somewhere different.' },
            { sel: '#username', law: "Jakob's law", note: 'The placeholders are swapped: the username box says "Enter password here" and the password box says "Enter username here".' },
            { sel: '#buttonContainer', law: "Hick's law", note: '17 buttons, and only one of them, "Log in" (sixth), submits the form. It looks just like the fakes.' },
            { sel: '#loginButton', law: "Fitts's law", note: 'The real button jumps away when your pointer reaches it, 7 times in a row.' },
            { sel: '#field1, #field2', law: 'Bad interaction', note: 'Your first login always fails, even with the right password. After each failure the fields are cleared and may swap order, and the password field randomly shows what you typed.' },
            { sel: '#captchaChallenge', law: 'Bad interaction', note: 'After the first attempt, a CAPTCHA appears with trick questions like "What is 9 + 10? (Hint: It\'s not 19)".' },
            { sel: '.fake-links-section', law: 'Bad interaction', note: "Forgot password, create account and the other recovery links do nothing, so there's no way out if you get stuck." },
            { sel: '.social-login-section, .alternative-login-section', law: "Hick's law", note: 'Seven social logins and eight "alternative" methods. None of them work.' },
            { sel: '.fake-security-section', law: 'Dark pattern', note: 'Security badges marked "(Trust Us)" and "(Made Up)": fake trust signals right where you\'re asked for a password.' }
        ],
        'browse.html': [
            { sel: 'nav', law: 'Layout patterns', note: 'The navigation is a sideways strip pinned to the left edge, with vertical text that wobbles constantly.' },
            { sel: '.search-bar', law: "Jakob's law", note: 'Search sits on the right, and any search except "norbit" hides every product and asks "Did you mean: Norbit?"' },
            { sel: '.product', law: 'Bad graphic design', note: 'Product cards are tilted, filled with a yellow-pink-blue gradient, and grow 20% on hover, covering their neighbors.' },
            { sel: '.product .stock', law: 'Color and typography', note: 'Stock counts are struck through, so every product looks unavailable. Some say "???" or "3D".' },
            { sel: 'img[alt="haha blind people"], .product-img:not([alt])', law: 'Accessibility', note: 'Alt text is insulting or missing: one poster\'s alt text is "haha blind people", and the air fryer images have none.' },
            { sel: '.product[data-name^="Stuart Little"]:not([data-name^="Stuart Little 2"])', law: "Hick's law", note: 'Six versions of Stuart Little (two DVDs, VHS, Betamax, Blu-ray, LaserDisc), each with the same long description, scattered so you can\'t compare them.' },
            { sel: '.product-grid', law: 'Responsiveness', note: "Cards can't shrink below 350 pixels and nothing adapts to small screens, so on a phone the grid runs off the edge." }
        ],
        'cart.html': [
            { sel: 'nav li', law: 'Layout patterns', note: 'The four navigation links are scattered to different parts of the screen, each a different color and angle.' },
            { sel: '#cartItems', law: 'Dark pattern', note: "Items you didn't choose are added for you: a warranty for each product, gift wrapping, a mystery box and priority shipping. Prices go up 5-15% every 10 seconds." },
            { sel: '#cartItems button', law: "Jakob's law", note: 'Each item has two "Remove Item" buttons. The red one removes it (after two "are you sure?" prompts for add-ons). The green one adds another.' },
            { sel: '#fakeError, #countdownDisplay', law: 'Dark pattern', note: 'A $100 minimum order, then a 30-second "mandatory waiting period" before checkout is allowed.' },
            { sel: '.checkout-button-grid', law: "Hick's law", note: 'Six checkout buttons and a link. Only "Proceed to Checkout (Real)" works, and it\'s the smallest.' },
            { sel: '#realCheckoutBtn', law: 'Bad interaction', note: 'Even the real button fails twice with fake errors, then shows a last-chance upsell before letting you through.' },
            { sel: '.btn-clear-cart', law: "Fitts's law", note: 'One of the biggest, easiest buttons to hit is "EMPTY CART (Don\'t Click!)", the one you least want.' },
            { sel: '#recommendationsModal .recommendations-content', law: 'Dark pattern', note: '3 seconds after the cart loads, a shaking pop-up pushes $300-$1,000 add-ons.' },
            { sel: '.coupon-section', law: 'Bad interaction', note: 'Every coupon code is rejected. The fine print admits it.' }
        ],
        'checkout.html': [
            { sel: 'nav', law: "Fitts's law", note: 'The navigation shrinks to 8-point light gray text in the top-right corner: tiny targets that are hard to even see.' },
            { sel: '#insuranceOptions', law: 'Dark pattern', note: 'Insurance for every item is pre-checked, adding 15% of each price unless you notice and untick it.' },
            { sel: '#tip', law: 'Dark pattern', note: "A 20% tip is added for you, and the field is read-only, so you can't change it." },
            { sel: '#zipCode', law: "Hick's law", note: 'Zip code is a dropdown of 99,451 numbers in random order instead of a text box.' },
            { sel: '#requiredSurvey', law: 'Bad interaction', note: 'A mandatory survey stands between you and your order, and its progress bar never goes past 95%.' },
            { sel: '#purchaseReason', law: 'Bad interaction', note: "A required 500-character essay on why you're buying." },
            { sel: '#hearAboutUs', law: "Hick's law", note: '101 options for "How did you hear about us?", from Google Search to "Burn Pattern on Toast".' },
            { sel: '.radio-group, #experienceRating', law: 'Dark pattern', note: 'Both answers to "Would you recommend us?" are yes, and the rating slider starts at 10.' },
            { sel: '.checkbox-group', law: 'Bad interaction', note: '"Select ALL that apply" includes contradictions like "I am a robot" and "I am not a robot".' },
            { sel: '#norbitModal .norbit-content, #areYouSureModal .are-you-sure-content', law: 'Dark pattern', note: 'A Norbit upsell pops up on arrival, and saying no leads to an "Are you sure?" screen whose only way out is a button labeled "I hate fun".' }
        ]
    };

    const MOTION_KEY = 'uxl-motion';

    function readMotion() {
        try {
            return localStorage.getItem(MOTION_KEY);
        } catch (e) {
            return null;
        }
    }

    function saveMotion(value) {
        try {
            localStorage.setItem(MOTION_KEY, value);
        } catch (e) {
            // Storage blocked (e.g. private browsing): the choice lasts for this page only
        }
    }

    // Until the visitor chooses, animations stay off
    let motionOn = readMotion() === 'on';
    document.documentElement.classList.add(motionOn ? 'motion-on' : 'motion-off');

    function setMotion(on) {
        motionOn = on;
        saveMotion(on ? 'on' : 'off');
        const root = document.documentElement;
        root.classList.toggle('motion-on', on);
        root.classList.toggle('motion-off', !on);

        // Rewind so paused animations freeze on their first frame
        // (otherwise blinking text can freeze while invisible)
        if (!on) {
            document.getAnimations().forEach(animation => {
                animation.currentTime = 0;
            });
        }
        document.querySelectorAll('marquee').forEach(marquee => {
            if (on) {
                marquee.start();
            } else {
                marquee.stop();
            }
        });

        const button = document.getElementById('uxlMotion');
        if (button) {
            button.textContent = on ? 'Animations: on' : 'Animations: off';
        }
    }

    function showMotionGate() {
        const root = document.documentElement;
        const gate = document.createElement('div');
        gate.className = 'uxl-gate';
        gate.setAttribute('role', 'dialog');
        gate.setAttribute('aria-modal', 'true');
        gate.setAttribute('aria-labelledby', 'uxlGateTitle');
        gate.innerHTML = `
            <div class="uxl-gate-box">
                <h2 id="uxlGateTitle">This store flashes and moves</h2>
                <p>Silly Samuel's Silly Store is designed to be unpleasant. Text blinks once a second, headings spin, pop-ups shake, and animated GIFs play all over the page.</p>
                <p>If you're sensitive to flashing or motion, turn animations off. You can change this any time with the Animations button in the bottom-left corner.</p>
                <div class="uxl-gate-actions">
                    <button type="button" data-motion="off">Turn animations off</button>
                    <button type="button" data-motion="on">Keep animations on</button>
                </div>
            </div>
        `;

        const buttons = gate.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                setMotion(button.dataset.motion === 'on');
                gate.remove();
                root.classList.remove('uxl-gate-open');
            });
        });

        // Keep keyboard focus inside the dialog
        gate.addEventListener('keydown', e => {
            if (e.key !== 'Tab') return;
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });

        root.classList.add('uxl-gate-open');
        document.body.appendChild(gate);
        buttons[0].focus();
    }

    // Explain mode
    let explainOn = false;
    let marks = [];

    function targetsFor(note) {
        return Array.from(document.querySelectorAll(note.sel)).filter(el => !el.closest('.uxl-bar, .uxl-notes'));
    }

    function firstVisible(elements) {
        return elements.find(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        });
    }

    // Pages re-render and move things constantly, so markers follow their elements every frame
    function trackMarks(notes, statuses) {
        if (!explainOn) return;
        notes.forEach((note, i) => {
            const targets = targetsFor(note);
            targets.forEach(el => el.classList.add('uxl-target'));

            const el = firstVisible(targets);
            const mark = marks[i];
            if (!el) {
                mark.hidden = true;
                statuses[i].textContent = 'Not showing right now';
                return;
            }
            const rect = el.getBoundingClientRect();
            const onScreen = rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
            mark.hidden = !onScreen;
            mark.style.left = Math.min(Math.max(rect.left, 4), innerWidth - 34) + 'px';
            mark.style.top = Math.min(Math.max(rect.top, 4), innerHeight - 30) + 'px';
            statuses[i].textContent = '';
        });
        requestAnimationFrame(() => trackMarks(notes, statuses));
    }

    function setExplain(on, notes) {
        explainOn = on;
        document.getElementById('uxlExplain').setAttribute('aria-pressed', String(on));
        document.getElementById('uxlNotes').hidden = !on;
        document.getElementById('uxlMarks').hidden = !on;
        if (on) {
            const statuses = Array.from(document.querySelectorAll('#uxlNotes .uxl-status'));
            trackMarks(notes, statuses);
        } else {
            document.querySelectorAll('.uxl-target').forEach(el => el.classList.remove('uxl-target'));
        }
    }

    function buildControls() {
        const page = location.pathname.split('/').pop() || 'index.html';
        const notes = UX_NOTES[page] || [];

        const bar = document.createElement('div');
        bar.className = 'uxl-bar';
        bar.setAttribute('role', 'region');
        bar.setAttribute('aria-label', 'Site controls');
        bar.innerHTML = `
            <a href="../">Go home</a>
            <button type="button" id="uxlExplain" aria-pressed="false" aria-controls="uxlNotes">Explain the bad UX</button>
            <button type="button" id="uxlMotion">${motionOn ? 'Animations: on' : 'Animations: off'}</button>
            <button type="button" id="uxlHide" aria-expanded="true">Hide</button>
        `;

        const panel = document.createElement('div');
        panel.className = 'uxl-notes';
        panel.id = 'uxlNotes';
        panel.hidden = true;
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', 'Bad UX on this page');
        panel.innerHTML = `
            <div class="uxl-notes-head">
                <span>${notes.length} problems on this page</span>
                <button type="button" id="uxlNotesClose">Close</button>
            </div>
            <ol>
                ${notes.map((note, i) => `
                    <li>
                        <button type="button" class="uxl-note" data-index="${i}">
                            <span class="uxl-mark" aria-hidden="true">${i + 1}</span>
                            <span>
                                <strong>${note.law}</strong>
                                ${note.note}
                                <span class="uxl-status"></span>
                            </span>
                        </button>
                    </li>`).join('')}
            </ol>
        `;

        const markLayer = document.createElement('div');
        markLayer.className = 'uxl-marks';
        markLayer.id = 'uxlMarks';
        markLayer.hidden = true;
        markLayer.setAttribute('aria-hidden', 'true');
        marks = notes.map((note, i) => {
            const mark = document.createElement('span');
            mark.className = 'uxl-mark';
            mark.textContent = i + 1;
            markLayer.appendChild(mark);
            return mark;
        });

        document.body.append(markLayer, panel, bar);

        document.getElementById('uxlExplain').addEventListener('click', () => setExplain(!explainOn, notes));
        document.getElementById('uxlNotesClose').addEventListener('click', () => {
            setExplain(false, notes);
            document.getElementById('uxlExplain').focus();
        });
        document.getElementById('uxlMotion').addEventListener('click', () => setMotion(!motionOn));
        document.getElementById('uxlHide').addEventListener('click', e => {
            const min = bar.classList.toggle('uxl-min');
            if (min) setExplain(false, notes);
            e.currentTarget.textContent = min ? 'Controls' : 'Hide';
            e.currentTarget.setAttribute('aria-expanded', String(!min));
        });

        // Clicking a note scrolls its element into view
        panel.querySelectorAll('.uxl-note').forEach(button => {
            button.addEventListener('click', () => {
                const el = firstVisible(targetsFor(notes[button.dataset.index]));
                if (el) {
                    el.scrollIntoView({ behavior: motionOn ? 'smooth' : 'auto', block: 'center' });
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        buildControls();
        if (!motionOn) {
            document.querySelectorAll('marquee').forEach(marquee => marquee.stop());
        }
        if (readMotion() === null) {
            showMotionGate();
        }
    });
})();
