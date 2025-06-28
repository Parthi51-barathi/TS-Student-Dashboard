// Student Management System
class StudentManager {
    constructor() {
        this.students = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.init();
    }

    init() {
        this.loadStudents();
        this.bindEvents();
        this.renderStudents();
        this.updateStats();
    }

    bindEvents() {
        // Add Student Button
        document.getElementById('addStudentBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Close Modal Events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal Overlay Click
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // Form Submit
        document.getElementById('studentForm').addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });

        // Search Input
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterStudents();
        });

        // Department Filter
        document.getElementById('departmentFilter').addEventListener('change', () => {
            this.filterStudents();
        });

        // Delete Modal Events
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('deleteModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeDeleteModal();
            }
        });

        // Keyboard Events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDeleteModal();
            }
        });
    }

    loadStudents() {
        try {
            const stored = localStorage.getItem('students');
            this.students = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = [];
        }
    }

    saveStudents() {
        try {
            localStorage.setItem('students', JSON.stringify(this.students));
        } catch (error) {
            console.error('Error saving students:', error);
        }
    }

    openModal(student = null) {
        const modal = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('studentForm');
        
        if (student) {
            title.textContent = 'Edit Student';
            this.currentEditId = student.id;
            this.populateForm(student);
        } else {
            title.textContent = 'Add Student';
            this.currentEditId = null;
            form.reset();
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            document.getElementById('regNo').focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('modalOverlay');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('studentForm').reset();
        this.currentEditId = null;
    }

    populateForm(student) {
        document.getElementById('regNo').value = student.regNo;
        document.getElementById('studentName').value = student.name;
        document.getElementById('department').value = student.department;
        document.getElementById('year').value = student.year;
        document.getElementById('marks').value = student.marks;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            regNo: document.getElementById('regNo').value.trim(),
            name: document.getElementById('studentName').value.trim(),
            department: document.getElementById('department').value,
            year: document.getElementById('year').value,
            marks: parseInt(document.getElementById('marks').value)
        };

        if (!this.validateForm(formData)) {
            return;
        }

        if (this.currentEditId) {
            this.updateStudent(formData);
        } else {
            this.addStudent(formData);
        }

        this.closeModal();
        this.renderStudents();
        this.updateStats();
        this.showNotification(this.currentEditId ? 'Student updated successfully!' : 'Student added successfully!');
    }

    validateForm(data) {
        if (!data.regNo || !data.name || !data.department || !data.year || isNaN(data.marks)) {
            this.showNotification('Please fill all fields correctly!', 'error');
            return false;
        }

        const existingStudent = this.students.find(s => 
            s.regNo.toLowerCase() === data.regNo.toLowerCase() && 
            s.id !== this.currentEditId
        );
        
        if (existingStudent) {
            this.showNotification('Registration number already exists!', 'error');
            return false;
        }

        if (data.marks < 0 || data.marks > 100) {
            this.showNotification('Marks must be between 0 and 100!', 'error');
            return false;
        }

        return true;
    }

    addStudent(data) {
        const student = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date().toISOString()
        };
        
        this.students.push(student);
        this.saveStudents();
    }

    updateStudent(data) {
        const index = this.students.findIndex(s => s.id === this.currentEditId);
        if (index !== -1) {
            this.students[index] = {
                ...this.students[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            this.saveStudents();
        }
    }

    editStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (student) {
            this.openModal(student);
        }
    }

    openDeleteModal(id) {
        this.currentDeleteId = id;
        document.getElementById('deleteModalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeDeleteModal() {
        document.getElementById('deleteModalOverlay').classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentDeleteId = null;
    }

    confirmDelete() {
        if (this.currentDeleteId) {
            this.deleteStudent(this.currentDeleteId);
            this.closeDeleteModal();
        }
    }

    deleteStudent(id) {
        const index = this.students.findIndex(s => s.id === id);
        if (index !== -1) {
            this.students.splice(index, 1);
            this.saveStudents();
            this.renderStudents();
            this.updateStats();
            this.showNotification('Student deleted successfully!');
        }
    }

    filterStudents() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const departmentFilter = document.getElementById('departmentFilter').value;
        
        let filteredStudents = this.students;

        if (searchTerm) {
            filteredStudents = filteredStudents.filter(student =>
                student.name.toLowerCase().includes(searchTerm) ||
                student.regNo.toLowerCase().includes(searchTerm)
            );
        }

        if (departmentFilter) {
            filteredStudents = filteredStudents.filter(student =>
                student.department === departmentFilter
            );
        }

        this.renderStudents(filteredStudents);
    }

    renderStudents(studentsToRender = this.students) {
        const tbody = document.getElementById('studentsTableBody');
        const emptyState = document.getElementById('emptyState');
        const table = document.getElementById('studentsTable');

        tbody.innerHTML = '';

        if (studentsToRender.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        emptyState.style.display = 'none';

        studentsToRender.forEach((student, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', student.id);
            row.style.animationDelay = `${index * 0.1}s`;
            
            row.innerHTML = `
                <td><strong>${student.regNo}</strong></td>
                <td>${student.name}</td>
                <td>
                    <span class="department-badge">${student.department}</span>
                </td>
                <td>${student.year}</td>
                <td>
                    <span class="marks-badge ${this.getMarksClass(student.marks)}">
                        ${student.marks}%
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn btn-edit" onclick="studentManager.editStudent('${student.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-delete" onclick="studentManager.openDeleteModal('${student.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </td>
            `;

            // Add click animation
            row.addEventListener('click', function(e) {
                if (!e.target.closest('button')) {
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                }
            });

            tbody.appendChild(row);
        });
    }

    getMarksClass(marks) {
        if (marks >= 90) return 'excellent';
        if (marks >= 80) return 'good';
        if (marks >= 70) return 'average';
        if (marks >= 60) return 'below-average';
        return 'poor';
    }

    updateStats() {
        document.getElementById('totalStudents').textContent = this.students.length;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: '300px'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
let studentManager;
document.addEventListener('DOMContentLoaded', () => {
    studentManager = new StudentManager();
});