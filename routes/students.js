const express = require('express');
const Student = require('../models/Student');
const Feedback = require('../models/Feedback');

const router = express.Router();

// GET /students - Filter students by course, year, section
router.get('/students', async (req, res) => {
  try {
    const { course, year, section } = req.query;
    let filter = {};

    if (course) filter.course = course;
    if (year) filter.year = parseInt(year);
    if (section) filter.section = section;

    const students = await Student.find(filter).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /students/distinct/:field - Get distinct values for dropdowns
router.get('/students/distinct/:field', async (req, res) => {
  try {
    const { field } = req.params;
    
    if (!['course', 'year', 'section'].includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }

    let values;
    if (field === 'year') {
      values = await Student.distinct(field);
      values = values.sort((a, b) => a - b);
    } else {
      values = await Student.distinct(field);
      values = values.sort();
    }

    res.json(values);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /students/options - Get filtered dropdown options based on previous selections
router.get('/students/options', async (req, res) => {
  try {
    const { course, year } = req.query;
    let filter = {};

    if (course) filter.course = course;
    if (year) filter.year = parseInt(year);

    let courses = await Student.distinct('course');
    let years = await Student.find(filter).distinct('year');
    let sections = await Student.find(filter).distinct('section');

    years = years.sort((a, b) => a - b);
    sections = sections.sort();
    courses = courses.sort();

    res.json({ courses, years, sections });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /select-student/:studentId - Get specific student details
router.get('/select-student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /student/:rollNo - Get student details by roll number
router.get('/student/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const student = await Student.findOne({ rollNo });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /feedback - Submit mentor feedback
router.post('/feedback', async (req, res) => {
  try {
    const { mentorEmail, studentName, rollNo, feedbackText, rating } = req.body;

    if (!mentorEmail || !studentName || !rollNo || !feedbackText) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const feedback = new Feedback({
      mentorEmail,
      studentName,
      rollNo,
      feedbackText,
      rating,
    });

    await feedback.save();
    res.json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
