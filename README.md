# Attendance Calculator

A semester attendance planning tool with two implementations:

- Web app: interactive setup and attendance target calculator
- Python CLI: step-by-step attendance planner from terminal input

## What this project does

This project helps you estimate how many classes you need to attend based on:

- Semester start and end dates
- Working days (Mon-Sun configurable)
- Inapplicable dates (holidays, exam periods, no-class dates)
- Subject list and weekly timetable
- Required and desired attendance percentages
- Optional class count adjustments (extra/cancelled classes)

## Implementations

### 1) Web app

Files:

- index.html
- style.css
- script.js

Key flow:

1. Lock semester dates and select active weekdays.
2. Mark inapplicable dates on calendar.
3. Add subjects.
4. Build timetable by assigning subjects to each day.
5. Set required and desired attendance percentages.
6. Apply per-subject or total class adjustments.
7. Generate attendance report.

Output:

- Subject-wise class totals
- Required class count
- Desired class count
- Optional total-level summary

### 2) Python CLI

File:

- attendance.py

Key flow:

1. Enter semester range.
2. Choose weekend class policy.
3. Enter exam periods and isolated holidays.
4. Add subjects and weekly schedule.
5. Enter attendance target.
6. Optionally account for extra classes.
7. Get per-subject attendance requirements.

## How to run

### Web app

Open index.html in a browser.

Optional local server (recommended):

```powershell
python -m http.server 8000
```

Then open http://localhost:8000.

### Python CLI

```powershell
python attendance.py
```

## Notes

- The web app is fully client-side and does not require a backend.
- Data persistence is local browser storage (when enabled in script).
- This repo is focused on planning and target estimation, not attendance tracking from institutional APIs.

## Suggested next improvements

- Fix and harden saved-state loading in script.js.
- Add export (CSV/PDF) for reports.
- Add unit tests for date filtering and count logic.
- Add sample input datasets for quick demos.
