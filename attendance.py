from datetime import datetime, timedelta

# -------------------------------
# STEP 1: Get semester dates
# -------------------------------

start_date_str = input("Enter semester start date (YYYY-MM-DD): ")
end_date_str = input("Enter semester end date (YYYY-MM-DD): ")

start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

# Generate all dates
all_dates = []
current_date = start_date

while current_date <= end_date:
    all_dates.append(current_date)
    current_date += timedelta(days=1)

print(f"\nTotal days in semester: {len(all_dates)}")


# -----------------------------------
# STEP 2: Weekend handling
# -----------------------------------

weekend_classes = input("\nDo you have weekend classes? (yes/no): ").lower()

allowed_weekdays = {0, 1, 2, 3, 4}  # Monday–Friday

if weekend_classes == "yes":
    saturday = input("Do you have Saturday classes? (yes/no): ").lower()
    sunday = input("Do you have Sunday classes? (yes/no): ").lower()

    if saturday == "yes":
        allowed_weekdays.add(5)
    if sunday == "yes":
        allowed_weekdays.add(6)

working_dates = []
for date in all_dates:
    if date.weekday() in allowed_weekdays:
        working_dates.append(date)

print(f"Days after weekend filtering: {len(working_dates)}")


# -----------------------------------
# STEP 3: Exam periods (DATE RANGES)
# -----------------------------------

exam_periods = int(input("\nHow many exam periods do you have? "))

exam_dates = set()

for i in range(exam_periods):
    print(f"\nExam Period {i + 1}")
    exam_start = input("  From (YYYY-MM-DD): ")
    exam_end = input("  To   (YYYY-MM-DD): ")

    start = datetime.strptime(exam_start, "%Y-%m-%d").date()
    end = datetime.strptime(exam_end, "%Y-%m-%d").date()

    current = start
    while current <= end:
        exam_dates.add(current)
        current += timedelta(days=1)

# Remove exam dates
after_exams = []
for date in working_dates:
    if date not in exam_dates:
        after_exams.append(date)

print(f"Days after removing exam periods: {len(after_exams)}")


# -----------------------------------
# STEP 4: Isolated holidays (single dates)
# -----------------------------------

holiday_input = input(
    "\nEnter isolated holiday dates (YYYY-MM-DD), separated by commas (or press Enter if none): "
)

holidays = set()

if holiday_input.strip() != "":
    for h in holiday_input.split(","):
        holidays.add(datetime.strptime(h.strip(), "%Y-%m-%d").date())

final_dates = []
for date in after_exams:
    if date not in holidays:
        final_dates.append(date)

print(f"Days after removing holidays: {len(final_dates)}")


# -----------------------------------
# STEP 5: Count weekdays
# -----------------------------------

weekday_count = {
    "Monday": 0,
    "Tuesday": 0,
    "Wednesday": 0,
    "Thursday": 0,
    "Friday": 0,
    "Saturday": 0,
    "Sunday": 0
}

for date in final_dates:
    weekday_count[date.strftime("%A")] += 1

print("\nNumber of each working day:")
for day, count in weekday_count.items():
    if count > 0:
        print(f"{day}: {count}")
# -----------------------------------
# STEP 6: Subjects
# -----------------------------------

num_subjects = int(input("\nHow many subjects do you have? "))

subjects = []

for i in range(num_subjects):
    name = input(f"Enter name of subject {i + 1}: ")
    subjects.append(name)

print("\nSubjects registered:")
for sub in subjects:
    print("-", sub)
# -----------------------------------
# STEP 7: Weekly timetable
# -----------------------------------

weekly_schedule = {
    "Monday": [],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": [],
    "Sunday": []
}

print("\nEnter timetable for each working day")

for day in weekly_schedule:
    if weekday_count[day] == 0:
        continue  # skip non-working days

    num_classes = int(input(f"\nHow many classes on {day}? "))

    for i in range(num_classes):
        while True:
            subject = input(f"  Class {i + 1} subject: ")
            if subject in subjects:
                weekly_schedule[day].append(subject)
                break
            else:
                print("  ❌ Subject not found. Enter from the subject list.")
# -----------------------------------
# STEP 8: Total class calculation
# -----------------------------------

total_classes = 0
subject_wise_count = {sub: 0 for sub in subjects}

for date in final_dates:
    day = date.strftime("%A")
    classes_today = weekly_schedule[day]
    total_classes += len(classes_today)

    for sub in classes_today:
        subject_wise_count[sub] += 1

print("\n📊 CLASS SUMMARY")
print(f"Total classes in semester: {total_classes}")

print("\nSubject-wise class count:")
for sub, count in subject_wise_count.items():
    print(f"{sub}: {count}")
import math

# -----------------------------------
# STEP 9: Attendance target
# -----------------------------------

import math

desired_attendance = float(
    input("\nWhat attendance percentage do you want to maintain (per subject)? ")
)

extra_choice = input(
    "Do you want to account for extra classes taken by teachers? (yes/no): "
).lower()

extra_classes_total = 0

if extra_choice == "yes":
    extra_classes_total = int(
        input("Enter estimated TOTAL extra classes (across all subjects): ")
    )

# -----------------------------------
# STEP 10: Distribute extra classes
# -----------------------------------

total_original_classes = sum(subject_wise_count.values())

subject_effective_total = {}

for subject, count in subject_wise_count.items():
    proportion = count / total_original_classes
    extra_for_subject = round(proportion * extra_classes_total)
    subject_effective_total[subject] = count + extra_for_subject

# -----------------------------------
# STEP 11: Subject-wise attendance targets
# -----------------------------------

def required_classes(percent, total):
    return math.ceil((percent / 100) * total)

low_target = max(desired_attendance - 2, 0)
high_target = min(desired_attendance + 2, 100)

print("\n📊 SUBJECT-WISE ATTENDANCE REQUIREMENTS")

for subject, total_classes in subject_effective_total.items():
    req_low = required_classes(low_target, total_classes)
    req_exact = required_classes(desired_attendance, total_classes)
    req_high = required_classes(high_target, total_classes)

    print(f"\n📘 {subject}")
    print(f"Total classes (incl. extras): {total_classes}")
    print(f"➖ {low_target:.1f}%  → Attend at least {req_low} classes")
    print(f"✅ {desired_attendance:.1f}% → Attend at least {req_exact} classes")
    print(f"➕ {high_target:.1f}% → Attend at least {req_high} classes")
