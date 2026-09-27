// Force deployment update
const API_URL = '/api/students';

const studentForm = document.getElementById('studentForm');
const studentList = document.getElementById('studentList');
const studentCount = document.getElementById('studentCount');
const refreshBtn = document.getElementById('refreshBtn');

const loader = document.getElementById('loader');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');

document.addEventListener('DOMContentLoaded', fetchStudents);
refreshBtn.addEventListener('click', fetchStudents);

studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  const newStudent = {
    studentId: document.getElementById('studentId').value.trim(),
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    department: document.getElementById('department').value.trim(),
    semester: Number(document.getElementById('semester').value),
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    });

    const data = await response.json();

    if (response.ok) {
      studentForm.reset();
      await fetchStudents();
    } else {
      alert(`Error: ${data.error || 'Failed to add student.'}`);
    }
  } catch (error) {
    console.error('Error adding student:', error);
    alert('Network error. Check your connection.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Student';
  }
});

async function fetchStudents() {
  showState('loading');

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('API response failed');

    const students = await response.json();
    renderStudents(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    showState('error');
  }
}

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
        <h3>${escapeHtml(student.name)} <small style="color:#94a3b8; font-weight:normal;">(#${escapeHtml(student.studentId)})</small></h3>
        <p>${escapeHtml(student.email)} • Sem ${student.semester}</p>
      </div>
      <span class="tag">${escapeHtml(student.department)}</span>
    `;
    studentList.appendChild(li);
  });
}

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

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}