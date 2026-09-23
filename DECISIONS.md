# Decision log

Your methods section. About one page total.

Answer these as you go, not the night before it is due.
Specifics beat polish - a short honest answer is worth more than a long vague one.

Delete these instructions when you are done, or leave them. It does not matter.

---

## 1. What did you set out to build, and what changed?

What you wanted at the start, and what is actually live now.
Name one thing you dropped or added along the way, and why.

I set out to put up a site I had already built: Silly Samuel's Silly Store, a deliberately terrible store for AI air fryers and DVDs. It breaks UX rules on purpose, including Fitts', Hick's and Jakob's laws, dark patterns, and inconsistent navigation from page to page. The plan was to rebuild it from my reference copy as a clean base and expand it later.

First I rebuilt the store exactly, minus its dead code. One thing I **dropped** was the background music. The store had an `<audio>` element and a `playAnnoyingSound()` function, but the only call to it was commented out, so it never played. I also removed a commented-out YouTube embed, five CSS selectors that no page uses, and duplicate `.button` rules that were overriding each other.

Then I expanded it. What's live now is a personal homepage at the root, with the store moved to `/store/`. The homepage looks like a late-90s computer desktop: every section is a window you can drag, close and reopen from desktop icons or a taskbar. I went for that because I like the style of old-school websites from the late 90s and 2000s, and PostHog's site shows it can still feel fresh. I **added**:

- **An "Explain the bad UX" switch on every store page.** It outlines each deliberate problem and lists what rule it breaks. Without it, a visitor can't tell a broken-on-purpose site from a broken one.
- **A warning before the store loads**, because it blinks, spins and shakes. Animations stay off until the visitor chooses, and they can be switched on or off from any page.
- **A playable game of 2048** in one of the homepage windows, plus a window of random facts and one of real numbers about the site (99,451 zip codes, 17 login buttons, and so on).
- **A custom 404 page** that sends old links like `/cart.html` to their new place in `/store/`.

---

## 2. A fork in the road

Name one real choice where you could have gone two ways.
Plain HTML or a framework. One page or several. Your own CSS or someone's template.
What goes on the front page and what does not.

Say which you picked, what the alternative was, and what you gave up by not taking it.

"There was no alternative" is not an answer. Find the fork.

The fork was what goes on the front page. My first version put the store itself at `smwasserman.github.io`: visitors landed straight in the chaos. The alternative was a homepage about me, with the store one click away at `/store/`.

I chose the homepage. The course README frames this as a URL you'd put on a resume. Someone clicking that link cold would land on flashing pop-ups and a fake cookie banner, with no hint it was on purpose. The homepage explains the joke and warns about flashing content before anyone enters. It's playful too (a retro desktop with a game in it), but it's playful in a way you can use, which is the opposite of the store.

What I gave up is the first impression. The store works best as an ambush, and now it's introduced first, so the surprise is gone. I also broke every existing link to a store page: `/cart.html` stopped existing once the store moved. The 404 page softens that by pointing old links to their new address, but anyone who bookmarked a store page now hits an error page first.

---

## 3. Where you overruled the agent

One time Claude suggested, wrote, or claimed something and you did not take it.

What did it do? How did you notice? What did you do instead?

If it genuinely never happened, say so plainly, and then say what you would have had to
check in order to notice. Being honest here costs you far less than a story you cannot
defend when you record your video.

*Your answer here. (Question 3 is yours to write, in your own words.)*

---

## 4. How you know it works

What check did you run, and what did it tell you?

Then the real question: **what would have made this check fail?**
A check that could not have failed is not a check.

Link to your `verification/` folder.

I ran six checks. Checks 1, 2, 4 and 5 ran in a headless browser against my local server, not the live site.

1. **The cleanup didn't change anything visible.** I compared the computed style of every element on all five store pages, old copy versus cleaned copy. The only difference was the server port inside the URL of `/non-existent.svg`, which is expected. *What would have made it fail:* merging the two `.button` rules wrong. The second rule's `margin: 0.5rem` overrode the first one's `margin-top: 1rem`, so keeping the wrong value would have shown up as a difference.
2. **The store still works end to end.** A script logged in as `name`/`12345`, got through the CAPTCHA, searched, added Norbit, waited out the 30-second cart timer, got past the fake checkout errors and upsell, filled in the survey, and reached "Order placed successfully!" It passed with no JavaScript errors, both before the move and again at `/store/` with animations off. *What would have made it fail:* deleting something that only looked unused, like a function called from an `onclick` attribute, or the new control bar covering a button the store needs.
3. **The live site matches my files.** After the last push, `curl -i https://smwasserman.github.io` returned `HTTP/2 200` from `server: GitHub.com`, and the body matched my local `index.html` byte for byte. `/store/`, `js/2048.js`, `js/home.js` and `style.css` returned 200, and the old `/cart.html` returned the 404 page. *What would have made it fail:* a stale deploy (the body wouldn't match), or a file left out of the commit (a 404).
4. **Turning animations off actually stops them.** On a first visit, the warning appeared with zero running animations behind it. After choosing "off", every animation was paused, the shaking pop-up sat exactly at the center of the screen, and blinking text was visible. *What would have made it fail:* removing animations instead of pausing them. The pop-ups get their centering from their shake animation, so they would have jumped off-center. Or pausing blinking text in its invisible half, which is why the layer rewinds each animation to its first frame.
5. **Every explain note points at something real.** With explain mode on, every note on all five pages found its element. The only ones listed as "not showing" were pop-ups that hadn't opened yet. *What would have made it fail:* a mistyped selector, which would leave an always-present element marked "not showing".
6. **2048 follows the real rules.** `node js/2048.test.js` checks sliding in all four directions, scoring, game over, and where new tiles land. *What would have made it fail:* the classic 2048 bug where a tile merges twice in one move. `[2, 2, 4, 0]` sliding left must give `[4, 4, 0, 0]`, not `[8, 0, 0, 0]`, and the test checks exactly that.

Evidence for check 3 is in [`verification/`](verification/): the screenshot with the URL bar showing, `fetch.txt`, and the check notes.

---

## 5. What is still wrong

One thing on your own site that is not right, not finished, or that you do not
fully understand.

What would you do next, and how would you find out?

**The store depends on other websites for almost all of its images.** The GIFs, product photos and posters are hotlinked from Giphy, Tenor, Pinterest, Wikipedia, Amazon and others. If any of those URLs moves, that image breaks, and I won't know unless I happen to look. A small script that requests every `<img src>` and reports anything that isn't a 200 would catch this. Downloading the images into the repo would stop it happening.

**I also don't fully understand how the "click the Login button exactly 7 times" CAPTCHA can be passed.** A click listener adds to the count, but the submit handler resets the count to 0 unless it is exactly 7. My guess is that the challenge is only passable because the browser blocks submission while the username and password fields are empty: the first six clicks count without submitting, then you fill in the fields and type 7 in the answer box before the seventh click. I haven't tested that. I would find out by forcing that CAPTCHA and trying it in the browser.

Separately, `/non-existent.svg` is a deliberate 404 used as a broken list icon, and it shows up as a red error in the console. That is intended, but it is also exactly the root-relative path mistake the course README warns about.
