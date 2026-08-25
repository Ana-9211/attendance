# Attendance Planner

This project started as a practical problem: how do you calculate how many classes you actually need to attend to meet a target percentage?

I built both a browser version and a Python version because the same logic was useful in different contexts. It turned into a small project about modeling real semester constraints instead of just doing a simple percentage calculation.

## What I was trying to learn

- how to model a semester with working days and exceptions
- how to account for holidays, exam periods, and no-class days
- how small rules about weekly structure change the final numbers
- how to turn a practical problem into a tool that is understandable and usable

## What the project does

It helps estimate attendance requirements based on:

- semester dates
- working days
- subject schedules
- target attendance percentages
- extra or cancelled classes

## Why this project mattered

The useful part was not the UI itself. It was the logic behind the planning.

A simple formula is easy to write. The hard part is making the model match the real structure of the semester, so that the numbers feel meaningful instead of theoretical.

## What I changed while building it

I learned that the first version of the logic was too naive for real schedules. It treated the semester as a clean system when actual academic calendars are messy.

That led to changes like:

- handling exceptions and skipped dates explicitly
- making subject-wise logic more clear
- separating total attendance goals from per-subject requirements
- handling class adjustments more carefully

## What I would improve next

- better validation for edge cases
- clearer saved-state behavior in the browser version
- more test coverage for date logic and class count calculations
- export support for easier reporting

## How to run

### Web app

```bash
python -m http.server 8000
```

Then open the app in a browser.

### Python CLI

```bash
python attendance.py
```

## Current takeaway

This is one of those practical projects that teaches you a lot about real-world modeling. It is small, but the process of turning a messy scheduling problem into a usable calculation tool was useful learning.
