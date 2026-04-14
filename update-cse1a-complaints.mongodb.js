const updates = [
  {
    rollNo: "CSE001",
    complaints: [
      {
        date: "2024-03-02",
        complaint: "Repeated classroom disruption and late submission of lab file.",
        actionTaken: "Email written to HOD and parent informed.",
        status: "Resolved",
      },
    ],
  },
  {
    rollNo: "CSE002",
    complaints: [],
  },
  {
    rollNo: "CSE003",
    complaints: [
      {
        date: "2024-03-08",
        complaint: "Missed two internal assessment submissions.",
        actionTaken: "Fine imposed and written warning issued.",
        status: "In Progress",
      },
    ],
  },
  {
    rollNo: "CSE004",
    complaints: [
      {
        date: "2024-03-11",
        complaint: "Unauthorized absence during tutorial hours.",
        actionTaken: "Counselling session scheduled with class mentor.",
        status: "Open",
      },
    ],
  },
  {
    rollNo: "CSE005",
    complaints: [
      {
        date: "2024-03-15",
        complaint: "Low attendance despite prior warning.",
        actionTaken: "Email written to HOD and attendance undertaking submitted.",
        status: "In Progress",
      },
      {
        date: "2024-03-18",
        complaint: "Did not attempt Assignment II.",
        actionTaken: "Fine imposed and re-attempt assignment deadline assigned.",
        status: "Resolved",
      },
    ],
  },
];

let modified = 0;
updates.forEach((item) => {
  const result = db.students.updateOne(
    { rollNo: item.rollNo, course: "B.Tech CSE", year: 1, section: "A" },
    { $set: { complaints: item.complaints } }
  );
  modified += result.modifiedCount;
});

printjson({ updatedStudents: modified });
