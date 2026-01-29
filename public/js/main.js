const API_URL = 'http://localhost:5000/api';
let currentStudents = [];

// Helper to get token
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Signup/Login Logic (Same as before)
const handleSignup = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) { setToken(data.token); window.location.href = 'students.html'; }
        else { document.getElementById('error-msg').innerText = data.msg || 'Signup failed'; }
    } catch (err) { console.error(err); }
};

const handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) { setToken(data.token); window.location.href = 'students.html'; }
        else { document.getElementById('error-msg').innerText = data.msg || 'Login failed'; }
    } catch (err) { console.error(err); }
};

const loadDashboard = async () => {
    console.log('Loading Dashboard...');
    if (!getToken()) {
        console.log('No token found, redirecting...');
        window.location.href = 'login.html';
        return;
    }
    await fetchStudents();
}

// Alias for compatibility
const loadStudentsPage = loadDashboard;

const showSection = (section) => {
    const sections = ['management', 'attendance', 'marks'];
    sections.forEach(s => {
        document.getElementById(`${s}-section`).style.display = s === section ? 'block' : 'none';
        document.getElementById(`nav-${s}`).classList.toggle('active', s === section);
    });
    if (section === 'attendance') renderAttendance();
    if (section === 'marks') renderMarks();
};

const fetchStudents = async () => {
    console.log('Fetching students...');
    const token = getToken();
    try {
        const res = await fetch(`${API_URL}/students`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Fetch Response Status:', res.status);
        if (res.ok) {
            currentStudents = await res.json();
            console.log('Students received:', currentStudents.length);
            renderStudents(currentStudents);
        } else if (res.status === 401) {
            console.log('Unauthorized, logging out...');
            logout();
        }
    } catch (err) { console.error('Fetch Students Error:', err); }
};

const renderStudents = (students) => {
    const list = document.getElementById('students-list');
    list.innerHTML = '';
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.phone || ''}</td>
            <td>${student.registrationNumber}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="openEditModal(${student.id})" class="edit-btn">Edit</button>
                    <button onclick="deleteStudent(${student.id})" class="delete-btn">Delete</button>
                </div>
            </td>
        `;
        list.appendChild(tr);
    });
};

const openAddModal = () => {
    document.getElementById('add-modal').style.display = 'flex';
};
const closeAddModal = () => {
    document.getElementById('add-modal').style.display = 'none';
};

const handleAddStudent = async (e) => {
    e.preventDefault();
    const name = document.getElementById('s-name').value;
    const email = document.getElementById('s-email').value;
    const phone = document.getElementById('s-phone').value;
    const registrationNumber = document.getElementById('s-reg').value;
    try {
        const res = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ name, email, phone, registrationNumber })
        });
        if (res.ok) {
            document.getElementById('add-student-form').reset();
            closeAddModal();
            fetchStudents();
        }
        else { const data = await res.json(); alert(data.msg || 'Error adding student'); }
    } catch (err) { console.error(err); }
};

const deleteStudent = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
        const res = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) fetchStudents();
    } catch (err) { console.error(err); }
};

// Edit Student Logic
const openEditModal = (id) => {
    const student = currentStudents.find(s => s.id === id);
    if (!student) return;
    document.getElementById('edit-id').value = student.id;
    document.getElementById('edit-name').value = student.name;
    document.getElementById('edit-email').value = student.email;
    document.getElementById('edit-phone').value = student.phone || '';
    document.getElementById('edit-reg').value = student.registrationNumber;
    document.getElementById('edit-modal').style.display = 'flex';
};
const closeEditModal = () => document.getElementById('edit-modal').style.display = 'none';

const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    const registrationNumber = document.getElementById('edit-reg').value;
    try {
        const res = await fetch(`${API_URL}/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ name, email, phone, registrationNumber })
        });
        if (res.ok) { closeEditModal(); fetchStudents(); }
    } catch (err) { console.error(err); }
};

// Attendance Logic
const renderAttendance = () => {
    const list = document.getElementById('attendance-list');
    list.innerHTML = '';
    currentStudents.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>${student.registrationNumber}</td>
            <td>
                <select class="att-status" data-id="${student.id}">
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                </select>
            </td>
        `;
        list.appendChild(tr);
    });
};

const saveAttendance = async () => {
    const date = document.getElementById('attendance-date').value;
    if (!date) { alert('Please select a date'); return; }

    const selects = document.querySelectorAll('.att-status');
    const promises = Array.from(selects).map(select => {
        return fetch(`${API_URL}/students/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ studentId: select.dataset.id, status: select.value, date })
        });
    });

    await Promise.all(promises);
    alert('Attendance saved successfully!');
    fetchStudents();
};

// Marks Logic
const renderMarks = () => {
    const list = document.getElementById('marks-list');
    list.innerHTML = '';
    currentStudents.forEach(student => {
        const m = student.Mark || { tamil: 0, english: 0, maths: 0, science: 0, social: 0, total: 0, percentage: 0 };
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>${m.tamil}</td>
            <td>${m.english}</td>
            <td>${m.maths}</td>
            <td>${m.science}</td>
            <td>${m.social}</td>
            <td style="font-weight:bold;">${m.total}</td>
            <td style="font-weight:bold; color: ${m.percentage > 40 ? 'green' : 'red'};">${m.percentage.toFixed(2)}%</td>
            <td><button onclick="openMarksModal(${student.id})" class="edit-btn">Update Marks</button></td>
        `;
        list.appendChild(tr);
    });
};

const openMarksModal = (id) => {
    const student = currentStudents.find(s => s.id === id);
    if (!student) return;
    const m = student.Mark || { tamil: 0, english: 0, maths: 0, science: 0, social: 0 };
    document.getElementById('marks-student-id').value = id;
    document.getElementById('m-tamil').value = m.tamil;
    document.getElementById('m-english').value = m.english;
    document.getElementById('m-maths').value = m.maths;
    document.getElementById('m-science').value = m.science;
    document.getElementById('m-social').value = m.social;
    document.getElementById('marks-modal').style.display = 'flex';
};
const closeMarksModal = () => document.getElementById('marks-modal').style.display = 'none';

const handleUpdateMarks = async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('marks-student-id').value;
    const tamil = document.getElementById('m-tamil').value;
    const english = document.getElementById('m-english').value;
    const maths = document.getElementById('m-maths').value;
    const science = document.getElementById('m-science').value;
    const social = document.getElementById('m-social').value;
    try {
        const res = await fetch(`${API_URL}/students/marks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ studentId, tamil, english, maths, science, social })
        });
        if (res.ok) { closeMarksModal(); fetchStudents(); showSection('marks'); }
    } catch (err) { console.error(err); }
};

const logout = () => { removeToken(); window.location.href = 'login.html'; };
