
let employees = JSON.parse(localStorage.getItem('hrm_v3_data')) || [
    { id: 1, name: "Fariha Tabassum", role: "Software Engineer", dept: "IT", email: "mahi@hrm.com", salary: 90880 },
    { id: 2, name: "Alen", role: "HR Manager", dept: "HR", email: "alen@hrm.com", salary: 75000 }
];

let deptChartInstance = null; 


document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    renderEmployees();
    renderReports();
});


function saveData() {
    localStorage.setItem('hrm_v3_data', JSON.stringify(employees));
    updateDashboard();
    renderEmployees();
    renderReports();
}


function navigate(sectionId, element) {
    
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    
    document.getElementById(sectionId).classList.add('active');
    element.classList.add('active');
}


function updateDashboard() {
    
    const total = employees.length;
    const payroll = employees.reduce((sum, emp) => sum + Number(emp.salary), 0);
    
    document.getElementById('total-staff').innerText = total;
    document.getElementById('total-payroll').innerText = `$${payroll.toLocaleString()}`;
    
    document.getElementById('avg-rating').innerText = "7.5";

    
    const deptCounts = { IT: 0, HR: 0, Sales: 0, Marketing: 0 };
    employees.forEach(emp => { 
        if(deptCounts[emp.dept] !== undefined) deptCounts[emp.dept]++; 
    });

    const ctx = document.getElementById('deptChart').getContext('2d');
    if (deptChartInstance) deptChartInstance.destroy(); // পুরনো চার্ট মুছে ফেলা

    deptChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(deptCounts),
            datasets: [{
                data: Object.values(deptCounts),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'], // রঙের কোড
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } }
        }
    });

    
    const logList = document.getElementById('audit-logs');
    logList.innerHTML = employees.slice(0, 3).map(e => `
        <li>
            <span style="color: #3b82f6;">12:00</span> - System updated record for <strong>${e.name}</strong>
        </li>
    `).join('');
}




function renderEmployees() {
    const grid = document.getElementById('employee-container');
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const filterVal = document.getElementById('deptFilter').value;

    grid.innerHTML = '';

    employees.forEach(emp => {
        
        if (emp.name.toLowerCase().includes(searchVal) && (filterVal === 'All' || emp.dept === filterVal)) {
            
            const initials = emp.name.charAt(0);
            
            grid.innerHTML += `
                <div class="emp-card glass">
                    <div class="emp-header">
                        <div class="emp-avatar">${initials}</div>
                        <span class="dept-tag">${emp.dept}</span>
                    </div>
                    <h3>${emp.name}</h3>
                    <p style="color: #94a3b8; font-size: 13px;">${emp.role}</p>
                    
                    <div class="card-actions">
                        <button class="btn-profile" onclick="viewProfile(${emp.id})">Profile</button>
                        <button class="btn-bonus" onclick="showToast('Bonus Sent to ${emp.name}!')">Bonus</button>
                    </div>
                    
                    <div class="icon-actions">
                        <i class="fas fa-pen"></i>
                        <i class="fas fa-trash delete-icon" onclick="deleteEmployee(${emp.id})"></i>
                    </div>
                </div>
            `;
        }
    });
}


function handleAddEmployee(e) {
    e.preventDefault();

    const email = document.getElementById('empEmail').value;
    
    
    if(employees.some(emp => emp.email === email)) {
        showToast("Error: Email already exists!", "error");
        return;
    }

    const newEmp = {
        id: Date.now(),
        name: document.getElementById('empName').value,
        role: document.getElementById('empRole').value,
        dept: document.getElementById('empDept').value,
        email: email,
        salary: document.getElementById('empSalary').value
    };

    employees.push(newEmp);
    saveData(); 
    closeModal('add-modal');
    showToast("Employee Added Successfully!");
    e.target.reset(); 
}


function deleteEmployee(id) {
    if(confirm("Are you sure you want to remove this employee?")) {
        employees = employees.filter(e => e.id !== id);
        saveData();
        showToast("Employee Removed!");
    }
}




function renderReports() {
    const tbody = document.getElementById('report-table-body');
    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td>${emp.name}</td>
            <td>${emp.dept}</td>
            <td>$${Number(emp.salary).toLocaleString()}</td>
            <td style="color: #10b981; font-weight: bold;">Reviewed</td>
        </tr>
    `).join('');
}


function viewProfile(id) {
    const emp = employees.find(e => e.id === id);
    if(emp) {
        document.getElementById('p-avatar').innerText = emp.name.charAt(0);
        document.getElementById('p-name').innerText = emp.name;
        document.getElementById('p-role').innerText = `${emp.role} • ${emp.dept}`;
        document.getElementById('p-salary').innerText = `$${Number(emp.salary).toLocaleString()}`;
        document.getElementById('p-email').innerText = emp.email;
        openModal('profile-modal');
    }
}



function calculateTax() {
    const salary = document.getElementById('empSalary').value;
    const tax = (salary * 0.15).toFixed(2);
    document.getElementById('tax-display').innerHTML = `<i class="fas fa-calculator"></i> Estimated Tax (15%): $${Number(tax).toLocaleString()}`;
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = type === 'error' ? '#ef4444' : '#10b981';
    toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${msg}`;
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }