// نظام إدارة عقود الاعتماد الأكاديمي - Main Script

// Global Variables
let allContracts = [];
let filteredContracts = [];
let currentView = 'dashboard';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل التطبيق');
    
    // Load contracts data
    if (typeof contractsData !== 'undefined') {
        allContracts = contractsData;
        filteredContracts = [...allContracts];
        console.log(`تم تحميل ${allContracts.length} عقد`);
        
        // Initialize views
        initializeApp();
    } else {
        console.error('لم يتم العثور على بيانات العقود');
        showError('لم يتم تحميل البيانات بشكل صحيح');
    }
});

// Initialize Application
function initializeApp() {
    setupNavigationHandlers();
    setupFilterHandlers();
    updateDashboardStats();
    renderDashboardView();
    populateFilterOptions();
}

// Navigation Handlers
function setupNavigationHandlers() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const view = this.dataset.view;
            switchView(view);
        });
    });
}

// Switch View
function switchView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
        targetView.classList.add('active');
        currentView = viewName;
        
        // Render view content
        renderView(viewName);
    }
}

// Render View
function renderView(viewName) {
    switch(viewName) {
        case 'dashboard':
            renderDashboardView();
            break;
        case 'timeline':
            renderTimelineView();
            break;
        case 'universities':
            renderUniversitiesView();
            break;
        case 'departments':
            renderDepartmentsView();
            break;
        case 'specializations':
            renderSpecializationsView();
            break;
        case 'contracts':
            renderContractsView();
            break;
    }
}

// Dashboard Statistics
function updateDashboardStats() {
    const stats = calculateTimePeriodStats();
    
    document.getElementById('stat-ended').textContent = stats.ended;
    document.getElementById('stat-h1-2025').textContent = stats.h1_2025;
    document.getElementById('stat-h2-2025').textContent = stats.h2_2025;
    document.getElementById('stat-2026').textContent = stats.year_2026;
}

// Calculate Time Period Statistics
function calculateTimePeriodStats() {
    const now = new Date();
    const endOf2024 = new Date('2024-12-31');
    const endOfH1_2025 = new Date('2025-06-30');
    const endOf2025 = new Date('2025-12-31');
    
    let stats = {
        ended: 0,
        h1_2025: 0,
        h2_2025: 0,
        year_2026: 0
    };
    
    allContracts.forEach(contract => {
        const endDate = new Date(contract.endDate);
        
        if (endDate <= endOf2024) {
            stats.ended++;
        } else if (endDate <= endOfH1_2025) {
            stats.h1_2025++;
        } else if (endDate <= endOf2025) {
            stats.h2_2025++;
        } else {
            stats.year_2026++;
        }
    });
    
    return stats;
}

// Render Dashboard View
function renderDashboardView() {
    renderUniversityChart();
    renderDepartmentChart();
    renderDegreeChart();
}

// University Chart
function renderUniversityChart() {
    const universityCount = {};
    
    allContracts.forEach(contract => {
        const uni = contract.university;
        universityCount[uni] = (universityCount[uni] || 0) + 1;
    });
    
    // Sort by count
    const sorted = Object.entries(universityCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15); // Top 15
    
    renderBarChart('universityChart', sorted, 'عدد العقود');
}

// Department Chart
function renderDepartmentChart() {
    const deptCount = {};
    
    allContracts.forEach(contract => {
        const dept = contract.management;
        deptCount[dept] = (deptCount[dept] || 0) + 1;
    });
    
    const sorted = Object.entries(deptCount).sort((a, b) => b[1] - a[1]);
    
    renderPieChart('departmentChart', sorted);
}

// Degree Chart
function renderDegreeChart() {
    const degreeCount = {};
    
    allContracts.forEach(contract => {
        const degree = contract.degree;
        degreeCount[degree] = (degreeCount[degree] || 0) + 1;
    });
    
    const sorted = Object.entries(degreeCount).sort((a, b) => b[1] - a[1]);
    
    renderBarChart('degreeChart', sorted, 'عدد العقود', true);
}

// Render Bar Chart
function renderBarChart(containerId, data, label, horizontal = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const maxValue = Math.max(...data.map(d => d[1]));
    
    data.forEach(([name, value]) => {
        const percentage = (value / maxValue) * 100;
        
        const barWrapper = document.createElement('div');
        barWrapper.style.cssText = 'margin-bottom: 16px;';
        
        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px;';
        labelDiv.innerHTML = `
            <span style="font-weight: 500; color: var(--text-primary);">${name}</span>
            <span style="font-weight: 600; color: var(--primary-color);">${value}</span>
        `;
        
        const barBg = document.createElement('div');
        barBg.style.cssText = 'background: var(--bg-light); border-radius: 8px; height: 32px; position: relative; overflow: hidden;';
        
        const barFill = document.createElement('div');
        barFill.style.cssText = `
            background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%);
            height: 100%;
            width: ${percentage}%;
            border-radius: 8px;
            transition: width 0.6s ease;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0 12px;
            color: white;
            font-weight: 600;
            font-size: 13px;
        `;
        
        barBg.appendChild(barFill);
        barWrapper.appendChild(labelDiv);
        barWrapper.appendChild(barBg);
        container.appendChild(barWrapper);
    });
}

// Render Pie Chart (simplified version)
function renderPieChart(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const total = data.reduce((sum, [, value]) => sum + value, 0);
    const colors = [
        '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A',
        '#81C784', '#A5D6A7', '#C8E6C9', '#0D47A1', '#1565C0'
    ];
    
    data.forEach(([name, value], index) => {
        const percentage = ((value / total) * 100).toFixed(1);
        
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px;
            margin-bottom: 8px;
            background: var(--bg-light);
            border-radius: 8px;
            border-right: 4px solid ${colors[index % colors.length]};
        `;
        
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 16px; height: 16px; border-radius: 50%; background: ${colors[index % colors.length]};"></div>
                <span style="font-weight: 500; font-size: 14px;">${name}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-weight: 600; color: var(--primary-color); font-size: 16px;">${value}</span>
                <span style="color: var(--text-secondary); font-size: 13px;">(${percentage}%)</span>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Render Timeline View
function renderTimelineView() {
    const container = document.getElementById('timelineContent');
    container.innerHTML = '';
    
    // Group by end date
    const grouped = {};
    filteredContracts.forEach(contract => {
        const date = contract.endDate;
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(contract);
    });
    
    // Sort by date
    const sorted = Object.keys(grouped).sort();
    
    sorted.forEach(date => {
        const contracts = grouped[date];
        const dateObj = new Date(date);
        const formatted = formatDate(date);
        
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-date">${formatted}</div>
            <div class="timeline-title">${contracts.length} عقد ينتهي</div>
            <div class="timeline-details">
                ${contracts.map(c => `• ${c.program} - ${c.university}`).join('<br>')}
            </div>
        `;
        container.appendChild(item);
    });
}

// Render Universities View
function renderUniversitiesView() {
    const container = document.getElementById('universitiesList');
    container.innerHTML = '';
    
    // Group by university
    const grouped = {};
    allContracts.forEach(contract => {
        const uni = contract.university;
        if (!grouped[uni]) grouped[uni] = [];
        grouped[uni].push(contract);
    });
    
    // Sort by count
    const sorted = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
    
    sorted.forEach(([university, contracts]) => {
        const card = createUniversityCard(university, contracts);
        container.appendChild(card);
    });
}

// Create University Card
function createUniversityCard(university, contracts) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const degrees = {};
    contracts.forEach(c => {
        degrees[c.degree] = (degrees[c.degree] || 0) + 1;
    });
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${university}</div>
            <div class="card-badge">${contracts.length}</div>
        </div>
        <div class="card-body">
            <div class="card-info">
                ${Object.entries(degrees).map(([degree, count]) => `
                    <div class="info-row">
                        <span class="info-label">${degree}</span>
                        <span class="info-value">${count}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showUniversityDetails(university, contracts));
    
    return card;
}

// Render Departments View
function renderDepartmentsView() {
    const container = document.getElementById('departmentsList');
    container.innerHTML = '';
    
    // Group by department
    const grouped = {};
    allContracts.forEach(contract => {
        const dept = contract.management;
        if (!grouped[dept]) grouped[dept] = [];
        grouped[dept].push(contract);
    });
    
    Object.entries(grouped).forEach(([department, contracts]) => {
        const card = createDepartmentCard(department, contracts);
        container.appendChild(card);
    });
}

// Create Department Card
function createDepartmentCard(department, contracts) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const universities = {};
    contracts.forEach(c => {
        universities[c.university] = (universities[c.university] || 0) + 1;
    });
    
    const topUnis = Object.entries(universities).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${department}</div>
            <div class="card-badge">${contracts.length}</div>
        </div>
        <div class="card-body">
            <div class="card-info">
                <div class="info-row">
                    <span class="info-label">أعلى الجامعات</span>
                    <span class="info-value">${topUnis.length}</span>
                </div>
                ${topUnis.map(([uni, count]) => `
                    <div class="info-row">
                        <span class="info-label" style="font-size: 13px;">- ${uni}</span>
                        <span class="info-value">${count}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showDepartmentDetails(department, contracts));
    
    return card;
}

// Render Specializations View
function renderSpecializationsView() {
    const container = document.getElementById('specializationsList');
    container.innerHTML = '';
    
    // Group by program
    const grouped = {};
    allContracts.forEach(contract => {
        const prog = contract.program;
        if (!grouped[prog]) grouped[prog] = [];
        grouped[prog].push(contract);
    });
    
    // Sort by count
    const sorted = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
    
    sorted.forEach(([program, contracts]) => {
        const card = createSpecializationCard(program, contracts);
        container.appendChild(card);
    });
}

// Create Specialization Card
function createSpecializationCard(program, contracts) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const universities = [...new Set(contracts.map(c => c.university))];
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${program}</div>
            <div class="card-badge">${contracts.length}</div>
        </div>
        <div class="card-body">
            <div class="card-info">
                <div class="info-row">
                    <span class="info-label">عدد الجامعات</span>
                    <span class="info-value">${universities.length}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">الدرجة العلمية</span>
                    <span class="info-value">${contracts[0].degree}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">الإدارة المختصة</span>
                    <span class="info-value" style="font-size: 12px;">${contracts[0].management}</span>
                </div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showSpecializationDetails(program, contracts));
    
    return card;
}

// Render Contracts View
function renderContractsView() {
    const container = document.getElementById('contractsList');
    container.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'contracts-table';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>الجامعة</th>
                <th>البرنامج</th>
                <th>الدرجة</th>
                <th>الإدارة المختصة</th>
                <th>بداية العقد</th>
                <th>نهاية العقد</th>
                <th>نسبة الإنجاز</th>
                <th>الحالة</th>
            </tr>
        </thead>
        <tbody id="contractsTableBody"></tbody>
    `;
    
    container.appendChild(table);
    
    updateContractsTable();
}

// Update Contracts Table
function updateContractsTable() {
    const tbody = document.getElementById('contractsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredContracts.forEach(contract => {
        const row = document.createElement('tr');
        
        const statusClass = getStatusClass(contract.endDate);
        
        row.innerHTML = `
            <td>${contract.university}</td>
            <td>${contract.program}</td>
            <td><span class="degree-badge">${contract.degree}</span></td>
            <td style="font-size: 13px;">${contract.management}</td>
            <td>${formatDate(contract.startDate)}</td>
            <td>${formatDate(contract.endDate)}</td>
            <td>${contract.progress || '-'}</td>
            <td><span class="status-badge ${statusClass}">${getStatusText(contract.endDate)}</span></td>
        `;
        
        row.addEventListener('click', () => showContractDetails(contract));
        tbody.appendChild(row);
    });
}

// Get Status Class
function getStatusClass(endDate) {
    const date = new Date(endDate);
    const now = new Date();
    const diff = (date - now) / (1000 * 60 * 60 * 24); // days
    
    if (diff < 0) return 'status-danger';
    if (diff < 180) return 'status-warning';
    return 'status-active';
}

// Get Status Text
function getStatusText(endDate) {
    const date = new Date(endDate);
    const now = new Date();
    const diff = Math.floor((date - now) / (1000 * 60 * 60 * 24)); // days
    
    if (diff < 0) return 'منتهي';
    if (diff < 30) return `${diff} يوم متبقي`;
    if (diff < 180) return `${Math.floor(diff/30)} شهر متبقي`;
    return 'نشط';
}

// Format Date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('ar-SA', options);
}

// Show Contract Details Modal
function showContractDetails(contract) {
    const modal = document.getElementById('contractModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `${contract.program} - ${contract.university}`;
    
    modalBody.innerHTML = `
        <div class="detail-section">
            <h3>معلومات أساسية</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">الجامعة</div>
                    <div class="detail-value">${contract.university}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">البرنامج</div>
                    <div class="detail-value">${contract.program}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">الدرجة العلمية</div>
                    <div class="detail-value">${contract.degree}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">الحالة</div>
                    <div class="detail-value">${contract.status}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>تفاصيل العقد</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">تاريخ البدء</div>
                    <div class="detail-value">${formatDate(contract.startDate)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ الانتهاء</div>
                    <div class="detail-value">${formatDate(contract.endDate)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">نسبة الإنجاز</div>
                    <div class="detail-value">${contract.progress || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">الإدارة المختصة</div>
                    <div class="detail-value" style="font-size: 13px;">${contract.management}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>حالة الوثائق</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">استلام الوثائق</div>
                    <div class="detail-value">${contract.docReceived || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ الاستلام</div>
                    <div class="detail-value">${formatDate(contract.docDate)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">الوثائق المحدثة</div>
                    <div class="detail-value">${contract.updatedDocReceived || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ التحديث</div>
                    <div class="detail-value">${formatDate(contract.updatedDocDate)}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>زيارة المراجعة</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">حالة الجدولة</div>
                    <div class="detail-value">${contract.visitScheduled || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ الزيارة</div>
                    <div class="detail-value">${formatDate(contract.visitDate)}</div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('contractModal').classList.remove('active');
}

// Close modal on background click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('contractModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Show University Details
function showUniversityDetails(university, contracts) {
    console.log('University details:', university, contracts);
    // يمكن إضافة نافذة منبثقة أو عرض تفصيلي هنا
}

// Show Department Details
function showDepartmentDetails(department, contracts) {
    console.log('Department details:', department, contracts);
    // يمكن إضافة نافذة منبثقة أو عرض تفصيلي هنا
}

// Show Specialization Details
function showSpecializationDetails(program, contracts) {
    console.log('Specialization details:', program, contracts);
    // يمكن إضافة نافذة منبثقة أو عرض تفصيلي هنا
}

// Setup Filter Handlers
function setupFilterHandlers() {
    // University search
    const uniSearch = document.getElementById('universitySearch');
    if (uniSearch) {
        uniSearch.addEventListener('input', (e) => {
            filterUniversities(e.target.value);
        });
    }
    
    // Contract search
    const contractSearch = document.getElementById('contractSearch');
    if (contractSearch) {
        contractSearch.addEventListener('input', (e) => {
            applyContractFilters();
        });
    }
    
    // Contract filters
    ['contractUniversityFilter', 'contractDepartmentFilter', 'contractDegreeFilter'].forEach(id => {
        const filter = document.getElementById(id);
        if (filter) {
            filter.addEventListener('change', () => {
                applyContractFilters();
            });
        }
    });
    
    // Timeline filter
    const timelineFilter = document.getElementById('timelineFilter');
    if (timelineFilter) {
        timelineFilter.addEventListener('change', (e) => {
            filterTimeline(e.target.value);
        });
    }
    
    // Specialization filter
    const specFilter = document.getElementById('specializationFilter');
    if (specFilter) {
        specFilter.addEventListener('change', (e) => {
            filterSpecializations(e.target.value);
        });
    }
}

// Populate Filter Options
function populateFilterOptions() {
    // Universities
    const universities = [...new Set(allContracts.map(c => c.university))].sort();
    const uniFilter = document.getElementById('contractUniversityFilter');
    if (uniFilter) {
        universities.forEach(uni => {
            const option = document.createElement('option');
            option.value = uni;
            option.textContent = uni;
            uniFilter.appendChild(option);
        });
    }
    
    // Departments
    const departments = [...new Set(allContracts.map(c => c.management))].sort();
    const deptFilter = document.getElementById('contractDepartmentFilter');
    if (deptFilter) {
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            deptFilter.appendChild(option);
        });
    }
}

// Apply Contract Filters
function applyContractFilters() {
    const searchTerm = document.getElementById('contractSearch')?.value.toLowerCase() || '';
    const uniFilter = document.getElementById('contractUniversityFilter')?.value || 'all';
    const deptFilter = document.getElementById('contractDepartmentFilter')?.value || 'all';
    const degreeFilter = document.getElementById('contractDegreeFilter')?.value || 'all';
    
    filteredContracts = allContracts.filter(contract => {
        const matchesSearch = contract.program.toLowerCase().includes(searchTerm) ||
                            contract.university.toLowerCase().includes(searchTerm);
        const matchesUni = uniFilter === 'all' || contract.university === uniFilter;
        const matchesDept = deptFilter === 'all' || contract.management === deptFilter;
        const matchesDegree = degreeFilter === 'all' || contract.degree === degreeFilter;
        
        return matchesSearch && matchesUni && matchesDept && matchesDegree;
    });
    
    updateContractsTable();
}

// Filter Universities
function filterUniversities(searchTerm) {
    const cards = document.querySelectorAll('#universitiesList .card');
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent;
        if (title.toLowerCase().includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter Timeline
function filterTimeline(filter) {
    if (filter === 'all') {
        filteredContracts = [...allContracts];
    } else {
        const endOf2024 = new Date('2024-12-31');
        const endOfH1_2025 = new Date('2025-06-30');
        const endOf2025 = new Date('2025-12-31');
        
        filteredContracts = allContracts.filter(contract => {
            const endDate = new Date(contract.endDate);
            
            switch(filter) {
                case 'ended':
                    return endDate <= endOf2024;
                case 'h1-2025':
                    return endDate > endOf2024 && endDate <= endOfH1_2025;
                case 'h2-2025':
                    return endDate > endOfH1_2025 && endDate <= endOf2025;
                case '2026':
                    return endDate > endOf2025;
                default:
                    return true;
            }
        });
    }
    
    renderTimelineView();
}

// Filter Specializations
function filterSpecializations(category) {
    const cards = document.querySelectorAll('#specializationsList .card');
    
    if (category === 'all') {
        cards.forEach(card => card.style.display = 'block');
        return;
    }
    
    const categoryMap = {
        'engineering': 'إدارة برامج العلوم الهندسية وعلوم الحاسب',
        'health': 'إدارة برامج العلوم الصحية',
        'humanities': 'إدارة برامج العلوم الإنسانية والتربوية',
        'islamic': 'إدارة برامج العلوم الإسلامية والعربية',
        'science': 'إدارة برامج التخصصات العلمية'
    };
    
    cards.forEach(card => {
        const deptText = card.querySelector('.info-value:last-child').textContent;
        if (deptText === categoryMap[category]) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Show Error
function showError(message) {
    const container = document.querySelector('.main-content .container');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>حدث خطأ</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Export functions for global access
window.closeModal = closeModal;
window.switchView = switchView;

console.log('تم تحميل جميع الوظائف بنجاح');