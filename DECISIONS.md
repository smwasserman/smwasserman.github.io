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

What is live now is that same site, with the same look and behavior, minus the dead code. One thing I **dropped** was the background music. The homepage had an `<audio>` element and a `playAnnoyingSound()` function, but the only call to it was commented out, so it never played. I also removed a second, commented-out YouTube embed, five CSS selectors that no page uses, and duplicate `.button` rules that were overriding each other. The site looks and acts exactly as before, and the code no longer suggests features that don't exist.

---

## 2. A fork in the road

Name one real choice where you could have gone two ways.
Plain HTML or a framework. One page or several. Your own CSS or someone's template.
What goes on the front page and what does not.

Say which you picked, what the alternative was, and what you gave up by not taking it.

"There was no alternative" is not an answer. Find the fork.

The reference copy kept the site in a `src/` folder, next to its project docs. I could have kept that layout or moved the site files to the repo root.

I moved them to the root. GitHub Pages only serves from `/` or `/docs`, so keeping `src/` would have meant either a redirect page or renaming the folder. Both add a layer that can break, and the site would end up at a URL with a folder in it.

What I gave up is separation. My site's HTML, CSS and JS now sit in the same folder as the course files (`README.md`, `RESOURCES.md`, this log). With `src/`, the site and the paperwork around it would be clearly apart.

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

I ran three checks.

1. **The cleanup didn't change anything visible.** I loaded all five pages of both the reference copy and the new copy in a headless browser and compared the computed style of every element. The only difference was the server port inside the absolute URL of `/non-existent.svg`, which is expected. *What would have made it fail:* the merged `.button` rule. The original had two `.button` blocks, and the second one's `margin: 0.5rem` overrode the first one's `margin-top: 1rem`. If I had kept the wrong value while merging, the check would have flagged it.
2. **The site still works end to end.** A script went through the whole flow: homepage, Quick Actions, login as `name`/`12345` with the CAPTCHA, search, add Norbit, wait out the 30-second cart timer, get past the fake checkout errors and the upsell modal, fill in the checkout survey, and reach "Order placed successfully!" It reported no JavaScript errors. *What would have made it fail:* deleting something that only looked unused, such as a function called from an `onclick` attribute in the HTML rather than from the JS files. I ran this against my local server, not the live site.
3. **The live site is really the new site.** `curl -i https://smwasserman.github.io` returned `HTTP/2 200` from `server: GitHub.com`, and the body matched my local `index.html` byte for byte. `login.html`, `browse.html`, `cart.html`, `checkout.html`, `css/styles.css` and `js/cart.js` also returned 200. *What would have made it fail:* the site still sitting in `src/` (a 404), or a stale deploy (the body would not match).

Evidence is in [`verification/`](verification/): the screenshot with the URL bar showing, `fetch.txt`, and the check notes.

---

## 5. What is still wrong

One thing on your own site that is not right, not finished, or that you do not
fully understand.

What would you do next, and how would you find out?

**The site depends on other websites for almost all of its images.** The GIFs, product photos and posters are hotlinked from Giphy, Tenor, Pinterest, Wikipedia, Amazon and others. If any of those URLs moves, that image breaks, and I won't know unless I happen to look. A small script that requests every `<img src>` and reports anything that isn't a 200 would catch this. Downloading the images into the repo would stop it happening.

**I also don't fully understand how the "click the Login button exactly 7 times" CAPTCHA can be passed.** A click listener adds to the count, but the submit handler resets the count to 0 unless it is exactly 7. My guess is that the challenge is only passable because the browser blocks submission while the username and password fields are empty: the first six clicks count without submitting, then you fill in the fields and type 7 in the answer box before the seventh click. I haven't tested that. I would find out by forcing that CAPTCHA and trying it in the browser.

Separately, `/non-existent.svg` is a deliberate 404 used as a broken list icon, and it shows up as a red error in the console. That is intended, but it is also exactly the root-relative path mistake the course README warns about.
