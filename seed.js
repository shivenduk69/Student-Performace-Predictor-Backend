const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const Mentor = require('./models/Mentor');

dotenv.config();

const seedData = [
  // B.Tech CSE Section A - 5 students with performance data
  { 
    "name": "Aarav Sharma", 
    "rollNo": "CSE001", 
    "course": "B.Tech CSE", 
    "year": 1, 
    "section": "A",
    "performance": {
      "computerNetworks": {
        "subject": "Computer Networks",
        "attendance": [
          {"date": "2024-01-15", "status": "Present"},
          {"date": "2024-01-22", "status": "Present"},
          {"date": "2024-01-29", "status": "Absent"},
          {"date": "2024-02-05", "status": "Present"},
          {"date": "2024-02-12", "status": "Present"}
        ],
        "assignments": [
          {"unit": "Unit 1", "marks": 22},
          {"unit": "Unit 2", "marks": 20},
          {"unit": "Unit 3", "marks": "Not Attempted"},
          {"unit": "Unit 4", "marks": 18},
          {"unit": "Unit 5", "marks": 24}
        ],
        "midsem": 35,
        "endsem": 78
      }
    }
  },
  { 
    "name": "Mishaan Pandey", 
    "rollNo": "CSE002", 
    "course": "B.Tech CSE", 
    "year": 1, 
    "section": "A",
    "performance": {
      "computerNetworks": {
        "subject": "Computer Networks",
        "attendance": [
          {"date": "2024-01-15", "status": "Present"},
          {"date": "2024-01-22", "status": "Present"},
          {"date": "2024-01-29", "status": "Present"},
          {"date": "2024-02-05", "status": "Present"},
          {"date": "2024-02-12", "status": "Absent"}
        ],
        "assignments": [
          {"unit": "Unit 1", "marks": 25},
          {"unit": "Unit 2", "marks": 23},
          {"unit": "Unit 3", "marks": 20},
          {"unit": "Unit 4", "marks": 22},
          {"unit": "Unit 5", "marks": 25}
        ],
        "midsem": 42,
        "endsem": 85
      }
    }
  },
  { 
    "name": "Deepak Kumar", 
    "rollNo": "CSE003", 
    "course": "B.Tech CSE", 
    "year": 1, 
    "section": "A",
    "performance": {
      "computerNetworks": {
        "subject": "Computer Networks",
        "attendance": [
          {"date": "2024-01-15", "status": "Present"},
          {"date": "2024-01-22", "status": "Absent"},
          {"date": "2024-01-29", "status": "Present"},
          {"date": "2024-02-05", "status": "Present"},
          {"date": "2024-02-12", "status": "Present"}
        ],
        "assignments": [
          {"unit": "Unit 1", "marks": 18},
          {"unit": "Unit 2", "marks": 15},
          {"unit": "Unit 3", "marks": 20},
          {"unit": "Unit 4", "marks": "Not Attempted"},
          {"unit": "Unit 5", "marks": 16}
        ],
        "midsem": 28,
        "endsem": 65
      }
    }
  },
  { 
    "name": "Neha Singh", 
    "rollNo": "CSE004", 
    "course": "B.Tech CSE", 
    "year": 1, 
    "section": "A",
    "performance": {
      "computerNetworks": {
        "subject": "Computer Networks",
        "attendance": [
          {"date": "2024-01-15", "status": "Present"},
          {"date": "2024-01-22", "status": "Present"},
          {"date": "2024-01-29", "status": "Present"},
          {"date": "2024-02-05", "status": "Absent"},
          {"date": "2024-02-12", "status": "Present"}
        ],
        "assignments": [
          {"unit": "Unit 1", "marks": 23},
          {"unit": "Unit 2", "marks": 21},
          {"unit": "Unit 3", "marks": 19},
          {"unit": "Unit 4", "marks": 20},
          {"unit": "Unit 5", "marks": 22}
        ],
        "midsem": 38,
        "endsem": 82
      }
    }
  },
  { 
    "name": "Rahul Verma", 
    "rollNo": "CSE005", 
    "course": "B.Tech CSE", 
    "year": 1, 
    "section": "A",
    "performance": {
      "computerNetworks": {
        "subject": "Computer Networks",
        "attendance": [
          {"date": "2024-01-15", "status": "Absent"},
          {"date": "2024-01-22", "status": "Present"},
          {"date": "2024-01-29", "status": "Present"},
          {"date": "2024-02-05", "status": "Present"},
          {"date": "2024-02-12", "status": "Present"}
        ],
        "assignments": [
          {"unit": "Unit 1", "marks": 20},
          {"unit": "Unit 2", "marks": "Not Attempted"},
          {"unit": "Unit 3", "marks": 18},
          {"unit": "Unit 4", "marks": 19},
          {"unit": "Unit 5", "marks": 21}
        ],
        "midsem": 32,
        "endsem": 72
      }
    }
  },
  
  // Other courses
  { "name": "Sanya Malhotra", "rollNo": "CSE045", "course": "B.Tech CSE", "year": 2, "section": "A" },
  { "name": "Priya Sharma", "rollNo": "CSE102", "course": "B.Tech CSE", "year": 4, "section": "B" },
  { "name": "Ishani Verma", "rollNo": "BCA012", "course": "BCA", "year": 2, "section": "B" },
  { "name": "Karan Johar", "rollNo": "BCA099", "course": "BCA", "year": 1, "section": "D" },
  { "name": "Aditya Rao", "rollNo": "FOR105", "course": "Forensic Science", "year": 3, "section": "C" },
  { "name": "Meera Iyer", "rollNo": "BBA220", "course": "BBA", "year": 4, "section": "D" },
  { "name": "Vikram Singh", "rollNo": "POL311", "course": "B.A Pol Science", "year": 1, "section": "B" },
  { "name": "Ananya Gupta", "rollNo": "AGR404", "course": "BSc Agriculture", "year": 2, "section": "A" },
  { "name": "Rohan Das", "rollNo": "PHR509", "course": "Bachelor of Pharmacy", "year": 3, "section": "C" },
  { "name": "Arjun Nair", "rollNo": "CSE006", "course": "B.Tech CSE", "year": 2, "section": "B" },
  { "name": "Divya Patel", "rollNo": "BCA050", "course": "BCA", "year": 3, "section": "A" },
  { "name": "Sameer Khan", "rollNo": "BBA150", "course": "BBA", "year": 2, "section": "C" }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edtech', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Clear existing students and mentors
    await Student.deleteMany({});
    await Mentor.deleteMany({});
    console.log('Cleared existing student and mentor records');

    // Seed mentors
    const mentors = [
      { email: 'mentor@example.com', password: 'password123' },
      { email: '2401301162@geetauniversity.edu.in', password: '1234' }
    ];

    for (const mentorData of mentors) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(mentorData.password, salt);

      const mentor = new Mentor({
        email: mentorData.email,
        password: hashedPassword,
      });

      await mentor.save();
      console.log(`✅ Successfully seeded mentor: ${mentorData.email} (password: ${mentorData.password})`);
    }

    // Insert seed data
    const result = await Student.insertMany(seedData);
    console.log(`✅ Successfully seeded ${result.length} students into the database`);

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();
