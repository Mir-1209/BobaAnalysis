# ⛏️ StudyCraft: mine your A+

A Minecraft-style study world built for ADHD brains. Right now it holds the **complete Calculus 1 course** (Vanderbilt MATH 1200, Single-Variable Calculus I). Accounts save your progress. There's a daily tracker, Google Calendar reminders, and a walkable 3D **End City** where you study with a timer floating in the sky.

## What's inside (the 30-second tour)

| Place | What it does |
|---|---|
| 🏠 **Base Camp** (`/home`) | Your one obvious next lesson, the Focus Furnace timer, 3 daily quests, Redstone Review, exam countdowns, mood/energy check-in and brain-dump note, streak blocks, due-soon list |
| 🗺️ **Calc 1 map** (`/calc`) | 17 units ("biomes") → 52 lessons, grouped by Exam 1, Exam 2 and the final |
| 📖 **Lessons** | TL;DR first, then "Explain like I'm 5", big idea, formula cards, step-by-step recipes, worked examples you reveal **one step at a time**, "creeper alert" common mistakes, embedded interactive tools, quick checks, then practice. **One-block-at-a-time** mode by default, plus a scroll mode and a focus mode |
| ⚔️ **Practice** | 339 hand-written questions with hints and full solutions, 28 **infinite generators** (Mob Grinder), **spaced repetition** (Redstone Review), by-unit drills and weak spots |
| 🐉 **Boss fights** | Timed mock exams with hearts and a boss health bar. Exam 1, Exam 2 (modeled on the Sept 2025 and Feb 2026 Test 2 papers), the Final, and a 12-minute speedrun |
| 🌌 **End City** (`/study`) | First-person walk around the End ship (you can't fall off). Click the bookshelf to open the Study Book: page 1 sets the timer, page 2 is your dashboard. The countdown floats in the violet sky |
| 🧪 **Tools** | Grapher, Limit Lab, Secant→Tangent, Derivative Lab (auto sign charts), Transformations, Exponential & Log, Rational Builder, Piecewise Fixer, Riemann Boxes, Box Optimizer, Unit Circle |
| 📜 **Cheat sheet** | The exam survival sheet (question → recipe map, every formula, last-minute tactics). Printable |
| 📅 **Tracker** | Activity heatmap, stats, exams, assignments, daily log, **Google Calendar** reminders and a private live calendar feed |
| ⚙️ **Settings** | 8 themes (Overworld, Nether, End, Deep Dark, Ocean, Cherry Grove, Snowy, Low-Stim), pixel/readable/hyperlegible fonts, sound and animation toggles, daily goals, advancements, account |

Answers are checked by **meaning, not looks**: `2(x+1)` and `2x+2` both count. It understands fractions, `DNE`, `inf`, intervals like `(-inf, 0) U (3, inf)`, `sqrt()`, `ln`, `e^x`, `|x|` and more, and shows a live preview of what you typed as real math.

### ADHD design choices (on purpose)
- **One obvious next action** on every screen ("Your next move ▶").
- **Tiny chunks**: lessons are 8–15 minutes, shown one block at a time.
- **Rewards for effort**: wrong answers still earn XP. Stopping a focus timer early still banks the minutes.
- **Dopamine without punishment**: XP bar, levels, streaks, advancements, combo counter, sound effects. No lives lost outside boss fights.
- **Escape hatches**: "I'm stuck, teach me" on every question, progressive hints, step-by-step solutions.
- **Overload controls**: Low-Stim theme, readable fonts, turn off motion and sound, focus mode hides everything else.
- **Externalized memory**: brain-dump box, daily checklist, spaced review brings back what you missed.

## Deploy it to Vercel (step by step, like you're 5)

You need: a GitHub account (this repo), a free Vercel account. About 10 minutes.

1. **Go to [vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
2. **Import** the `BobaAnalysis` repository. Vercel sees it's a Vite app. Leave every setting as it is and click **Deploy**. (The first deploy works even without a database: guest mode saves progress in the browser.)
3. **Add a database** so accounts work: in your new Vercel project open **Storage → Create Database → Neon (Postgres) → Connect**. This adds `DATABASE_URL` for you.
4. **Add one secret**: **Settings → Environment Variables →** name `SESSION_SECRET`, value = any long random text (at least 32 characters; on a Mac/Linux terminal `openssl rand -base64 48` makes one).
5. **Redeploy**: Deployments → ⋯ on the latest → **Redeploy**. The build creates the database tables automatically.
6. **Check it**: open `https://YOUR-APP.vercel.app/api/healthz`. You want `"status":"ok"`. If something's missing, it tells you exactly what.

Optional: add your own domain in Vercel, then set `APP_URL=https://yourdomain.com` (calendar links use it).

## Google Calendar reminders (works today)

Tracker → **Google Calendar reminders**:
- **Daily reminder:** one click opens Google Calendar with a repeating study block at your chosen time. Save it, and your phone pings you every day with your normal Google Calendar notifications.
- **Live feed (signed-in):** a private link Google subscribes to. It contains your daily study block, every exam (with 1-week and 1-day warnings) and every assignment due date, and it keeps itself up to date. "Subscribe in Google Calendar" does it in one tap. "New private link" revokes the old one.

Coming next: two-way Google Calendar sync and **Brightspace** assignment import. The assignment model already has a `kind` and the tracker has a slot for imported items.

## Run it on your computer

Needs Node 22 and Postgres.

```bash
npm install
cp .env.example .env        # set DATABASE_URL
npm run db:migrate          # create the tables
npm run dev                 # API on :8787, site on http://localhost:5173
```

Checks: `npm run typecheck`, `npm test`, `npm run build`.

## How it's built

```
src/                    React 19 + Vite website
  content/calc1/        THE COURSE: units/*.ts (lessons + questions), generators.ts (infinite practice),
                        extras.ts (bosses, quests, mastery, advancements), cheatsheet.ts
  lib/math/             expression parser + answer checker (numeric equivalence, intervals, lists)
  tools/                the interactive math tools (canvas graphing engine in Graph.tsx)
  study/                the 3D End City (three.js) + ship deck collision map
  pages/, components/   screens and UI kit (Minecraft GUI panels, hotbar, toasts)
shared/rules.ts         game rules used by BOTH browser and server: XP, levels, streaks, spaced repetition
server/                 Express 5 API: auth, progress, tracker, calendar feed
api/index.ts            the Vercel serverless function (wraps the Express app)
drizzle/                SQL migrations (applied on every deploy)
public/models/          the End City 3D model
```

**Accounts and progress**
- Email + password with scrypt hashing. Sessions are stored hashed in Postgres, sent as `__Host-` httpOnly cookies, and last 60 days (sliding).
- CSRF: SameSite=Lax + a required custom header + an Origin check. Rate limits live in Postgres, so they hold across serverless instances.
- **Guest mode first:** you can study instantly. Progress lives in the browser and **moves into your account** automatically when you sign up.
- The browser applies each answer, lesson and focus session instantly, queues it, and syncs in batches. Offline? It keeps the queue and retries. The server re-applies the same `shared/rules.ts` logic inside a transaction, so XP can't be lost or double-counted.
- Tables: `users`, `sessions`, `lesson_progress`, `question_stats` (spaced-repetition boxes), `day_logs` (the daily tracker), `assignments`, `rate_limits`. Export and delete-account are in Settings.

**Trustworthy content.** `src/content/calc1/content.test.ts` renders every formula with KaTeX, checks that every answer key accepts itself, and re-derives answers numerically wherever a question carries `verify` data: derivatives by finite differences, limits by approaching from both sides, integrals by Simpson's rule. It also runs 40 random seeds of every generator. A typo in an answer key fails the build.

**Adding a course (ECS next).** Make `src/content/<course>/` with the same `Unit → Lesson → Block/Question` shape (`src/content/types.ts`), add a card in `pages/Courses.tsx`, and the lesson player, practice, bosses and tracker all work with it.

## Credits
- End City 3D model: ["END CITY MINECRAFT"](https://sketchfab.com/3d-models/end-city-minecraft-251ac9f3cb1649fcb1ea0319adcc38da) by DURVESH123, licensed CC BY 4.0.
- Course content is based on the MATH 1200 lecture slides (Weeks 1–4) and the Exam 2 study guide.
- StudyCraft is a fan-made study tool. It is not affiliated with Mojang, Microsoft or Vanderbilt University.
