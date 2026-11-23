# My Day Planner

A small planner for blocking out your day, one block at a time. You drag on a calendar to pick a time, name it, pick a category, and it saves on your device.

I built it to plan my own study and work days, so the categories are the ones I use. You can change them in `index.html`.

## What it does

- Plan any day. Use the arrows to move between days, or press Today to jump back.
- Drag down an empty column to make a block. The times fill in the form, and you add a name.
- Move a block by dragging it, or resize it by dragging its bottom edge.
- Edit a block's name, time, or category from the form.
- Mark blocks as done, or delete them. A deleted block can be restored with Undo for 10 seconds.
- Blocks can't overlap. If a new time clashes with another block, you get a message and the block stays where it was.
- A red line shows the current time on today's calendar.
- "Up next" shows what you're doing now and what starts next, with a countdown.
- A progress bar shows how many blocks you've finished that day.
- Category totals and a day total show where your time goes.
- Copy yesterday's plan into the day you're viewing. Blocks that clash get skipped.
- Mark all done, or clear finished blocks, for the day you're viewing.
- Reminders: turn them on once, and you get a notification 5 minutes before each block starts.

## Running it

You need a modern browser. Chrome or Edge works best.

1. Put all the files in one folder.
2. Open the folder in VS Code and use the Live Server extension, then choose "Open with Live Server."
3. Or just double-click `index.html`. Some features, like reminders and the offline install, need Live Server or a real web address.

## Files

- `index.html` is the page layout and the category list.
- `style.css` holds the look: colors, spacing, and the calendar grid.
- `app.js` has all the behavior: saving, the calendar, drag, reminders, and the live view.

## Where your data lives

Blocks are saved in your browser's local storage. That means:

- Data stays on the device and in the browser where you made it.
- Your phone and your computer don't share blocks.
- Clearing your browser data will delete your blocks.

## Known limits

- Reminders only work while the app or its tab is open. They don't fire when everything is fully closed.
- Reminders may not show on Android Chrome yet. The notification code still uses the basic browser call instead of the service worker.
- Blocks shorter than about 45 minutes are too small for the buttons to fit well.
- There's no backup or export yet, so clearing browser data means losing blocks.
- Times are shown in 24-hour format, and the calendar runs from 06:00 to midnight.

## Ideas for later

- Export and import a backup file.
- Send reminders through the service worker so they work on Android.
- Add a weekly view with each day's total.
- Click to edit a block's name directly, without the form.
- Repeat a block on weekdays.

## Thanks.
