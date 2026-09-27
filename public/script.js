const API_URL = 'https://student-backend-hl2x.onrender.com/api/students';

const studentForm = document.getElementById('studentForm');
const studentList = document.getElementById('studentList');
const studentCount = document.getElementById('studentCount');
const refreshBtn = document.getElementById('refreshBtn');

const loader = document.getElementById('loader');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');

// Fetch students on page load
document.addEventListener('DOMContentLoaded', fetchStudents);
refreshBtn.addEventListener('click', fetchStudents);

// Handle Form Submission
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  const newStudent = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    course: document.getElementById('course').value.trim(),
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    });

    if (response.ok) {
      studentForm.reset();
      await fetchStudents();
    } else {
      alert('Failed to add student. Please try again.');
    }
  } catch (error) {
    console.error('Error adding student:', error);
    alert('Network error. Check your connection.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Student';
  }
});

// Fetch students from API
async function fetchStudents() {
  showState('loading');

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('API response failed');

    const result = await response.json();
    const students = Array.isArray(result) ? result : result.data || [];

    renderStudents(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    showState('error');
  }
}

// Render student list items
function renderStudents(students) {
  studentCount.textContent = `${students.length} total`;
  studentList.innerHTML = '';

  if (students.length === 0) {
    showState('empty');
    return;
  }

  showState('data');

  students.forEach((student) => {
    const li = document.createElement('li');
    li.className = 'student-item';
    li.innerHTML = `
      <div class="student-info">
        <h3>${escapeHtml(student.name)}</h3>
        <p>${escapeHtml(student.email)}</p>
      </div>
      <span class="tag">${escapeHtml(student.course || 'General')}</span>
    `;
    studentList.appendChild(li);
  });
}

// Manage UI states (loading, empty, error, data)
function showState(state) {
  loader.classList.add('hidden');
  emptyState.classList.add('hidden');
  errorState.classList.add('hidden');
  studentList.classList.add('hidden');

  if (state === 'loading') loader.classList.remove('hidden');
  if (state === 'empty') emptyState.classList.remove('hidden');
  if (state === 'error') errorState.classList.remove('hidden');
  if (state === 'data') studentList.classList.remove('hidden');
}

// Helper to prevent XSS
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}