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
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMsg = document.getElementById('error-msg');

    // Client-side validations
    if (password.length < 8) {
        errorMsg.innerText = 'Password must be at least 8 characters long';
        errorMsg.style.display = 'block';
        return;
    }

    if (password !== confirmPassword) {
        errorMsg.innerText = 'Passwords do not match';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        }
        else {
            errorMsg.innerText = data.msg || 'Signup failed';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorMsg.innerText = 'Something went wrong. Please try again.';
        errorMsg.style.display = 'block';
    }
};

const handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    if (password.length < 8) {
        errorMsg.innerText = 'Password must be at least 8 characters long';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        const errorMsg = document.getElementById('error-msg');
        if (res.ok) {
            setToken(data.token);
            window.location.href = 'students.html';
        }
        else {
            errorMsg.innerText = data.msg || 'Login failed';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        const errorMsg = document.getElementById('error-msg');
        errorMsg.innerText = 'Something went wrong. Please try again.';
        errorMsg.style.display = 'block';
    }
};

const loadDashboard = async () => {
    console.log('Loading Dashboard...');
    if (!getToken()) {
        console.log('No token found, redirecting...');
        window.location.href = 'login.html';
        return;
    }
    await fetchStudents();
    setDateLimits();
}

const setDateLimits = () => {
    const today = new Date().toISOString().split('T')[0];

    // Set limits for Birthday (2008 - 2022)
    const dobInputs = ['s-dob', 'edit-dob'];
    dobInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.setAttribute('min', '2008-01-01');
            input.setAttribute('max', '2022-12-31');
        }
    });

    // Set limits for Attendance (max today)
    const attInput = document.getElementById('attendance-date');
    if (attInput) attInput.setAttribute('max', today);
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
            <td>${student.registrationNumber}</td>
            <td style="font-weight: 600;">${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.phone || ''}</td>
            <td>${student.dob || ''}</td>
            <td>${student.gender || ''}</td>
            <td><div class="address-cell" title="${student.address || ''}">${student.address || ''}</div></td>
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
    document.getElementById('add-error').style.display = 'none';
    document.getElementById('add-modal').style.display = 'flex';
};
const closeAddModal = () => {
    document.getElementById('add-modal').style.display = 'none';
};

const handleAddStudent = async (e) => {
    e.preventDefault();
    const registrationNumber = document.getElementById('s-reg').value;
    const firstName = document.getElementById('s-firstName').value;
    const lastName = document.getElementById('s-lastName').value;
    const email = document.getElementById('s-email').value;
    const phone = document.getElementById('s-phone').value;
    const dob = document.getElementById('s-dob').value;
    const gender = document.getElementById('s-gender').value;
    const address = document.getElementById('s-address').value;
    const errDiv = document.getElementById('add-error');

    if (registrationNumber && !/^\d+$/.test(registrationNumber)) {
        errDiv.textContent = 'Registration number must contain only numbers';
        errDiv.style.display = 'block';
        return;
    }

    if (phone && (phone.length !== 10 || !/^\d+$/.test(phone))) {
        errDiv.textContent = 'Phone number must be exactly 10 digits and contains only numbers';
        errDiv.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ firstName, lastName, email, phone, registrationNumber, dob, gender, address })
        });
        if (res.ok) {
            document.getElementById('add-student-form').reset();
            closeAddModal();
            fetchStudents();
        }
        else {
            const data = await res.json();
            const errDiv = document.getElementById('add-error');
            errDiv.textContent = data.msg || 'Error adding student';
            errDiv.style.display = 'block';
        }
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
    document.getElementById('edit-error').style.display = 'none';
    document.getElementById('edit-error').textContent = '';

    document.getElementById('edit-id').value = student.id;
    document.getElementById('edit-reg').value = student.registrationNumber;
    document.getElementById('edit-firstName').value = student.firstName;
    document.getElementById('edit-lastName').value = student.lastName;
    document.getElementById('edit-email').value = student.email;
    document.getElementById('edit-phone').value = student.phone || '';
    document.getElementById('edit-dob').value = student.dob || '';
    document.getElementById('edit-gender').value = student.gender || '';
    document.getElementById('edit-address').value = student.address || '';

    document.getElementById('edit-modal').style.display = 'flex';
};
const closeEditModal = () => {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-error').style.display = 'none';
    document.getElementById('edit-error').textContent = '';
};

const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const registrationNumber = document.getElementById('edit-reg').value;
    const firstName = document.getElementById('edit-firstName').value;
    const lastName = document.getElementById('edit-lastName').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    const dob = document.getElementById('edit-dob').value;
    const gender = document.getElementById('edit-gender').value;
    const address = document.getElementById('edit-address').value;
    const errDiv = document.getElementById('edit-error');

    if (registrationNumber && !/^\d+$/.test(registrationNumber)) {
        errDiv.textContent = 'Registration number must contain only numbers';
        errDiv.style.display = 'block';
        return;
    }

    if (phone && (phone.length !== 10 || !/^\d+$/.test(phone))) {
        errDiv.textContent = 'Phone number must be exactly 10 digits and contains only numbers';
        errDiv.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ firstName, lastName, email, phone, registrationNumber, dob, gender, address })
        });
        if (res.ok) {
            closeEditModal();
            fetchStudents();
        } else {
            const data = await res.json();
            const errDiv = document.getElementById('edit-error');
            errDiv.textContent = data.msg || 'Error updating student';
            errDiv.style.display = 'block';
        }
    } catch (err) { console.error(err); }
};

// Attendance Logic
const renderAttendance = () => {
    const list = document.getElementById('attendance-list');
    list.innerHTML = '';
    currentStudents.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.firstName} ${student.lastName}</td>
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

    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
        alert('Future attendance cannot be marked.');
        return;
    }

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

        // Check if any subject is 35 or less
        const subjects = [m.tamil, m.english, m.maths, m.science, m.social];
        const isFail = subjects.some(mark => mark <= 35);
        const result = isFail ? '<span style="color: red; font-weight: bold;">FAIL</span>' : '<span style="color: green; font-weight: bold;">PASS</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.firstName} ${student.lastName}</td>
            <td style="color: ${m.tamil <= 35 ? 'red' : 'inherit'}">${m.tamil}</td>
            <td style="color: ${m.english <= 35 ? 'red' : 'inherit'}">${m.english}</td>
            <td style="color: ${m.maths <= 35 ? 'red' : 'inherit'}">${m.maths}</td>
            <td style="color: ${m.science <= 35 ? 'red' : 'inherit'}">${m.science}</td>
            <td style="color: ${m.social <= 35 ? 'red' : 'inherit'}">${m.social}</td>
            <td style="font-weight:bold;">${m.total}</td>
            <td style="font-weight:bold; color: ${m.percentage > 35 && !isFail ? 'green' : 'red'};">${m.percentage.toFixed(2)}%</td>
            <td>${result}</td>
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
        if (res.ok) {
            closeMarksModal();
            await fetchStudents();
            showSection('marks');
        }
    } catch (err) { console.error(err); }
};

const logout = () => { removeToken(); window.location.href = 'login.html'; };
