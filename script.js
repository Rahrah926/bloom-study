// ======================================================
// BLOOM STUDY - SCRIPT.JS
// ======================================================

const USERS_KEY = "bloomUsers";
const CURRENT_USER_KEY = "bloomCurrentUser";

// ======================================================
// BASIC STORAGE FUNCTIONS
// ======================================================

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    const email = localStorage.getItem(CURRENT_USER_KEY);

    if (!email) {
        return null;
    }

    const users = getUsers();
    return users.find(user => user.email === email) || null;
}

function setCurrentUser(email) {
    localStorage.setItem(CURRENT_USER_KEY, email);
}

function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function updateCurrentUser(updatedUser) {
    const users = getUsers();

    const index = users.findIndex(user => user.email === updatedUser.email);

    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
    }
}

// ======================================================
// PAGE NAVIGATION
// ======================================================

function showPage(pageId) {
    const user = getCurrentUser();

    // Pages that don't require login
    const publicPages = [
        "homePage",
        "loginPage",
        "signupPage"
    ];

    // Protect private pages
    if (!publicPages.includes(pageId) && !user) {
        pageId = "loginPage";
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    // Update navigation buttons
    document.querySelectorAll(".top-nav button").forEach(button => {
        button.classList.remove("active");

        if (button.dataset.page === pageId) {
            button.classList.add("active");
        }
    });

    // Update user information
    updateUserInterface();

    // Refresh app content
    if (user) {
        renderDashboard();
        renderTasks();
        renderPlanner();
        renderNotes();
        renderProgress();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ======================================================
// USER INTERFACE
// ======================================================

function updateUserInterface() {
    const user = getCurrentUser();

    const authButtons = document.getElementById("authButtons");
    const userArea = document.getElementById("userArea");
    const navUserName = document.getElementById("navUserName");
    const userInitial = document.getElementById("userInitial");

    if (user) {
        if (authButtons) {
            authButtons.style.display = "none";
        }

        if (userArea) {
            userArea.style.display = "flex";
        }

        if (navUserName) {
            navUserName.textContent = user.name;
        }

        if (userInitial) {
            userInitial.textContent = user.name
                .charAt(0)
                .toUpperCase();
        }
    } else {
        if (authButtons) {
            authButtons.style.display = "flex";
        }

        if (userArea) {
            userArea.style.display = "none";
        }
    }
}

// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard() {
    const user = getCurrentUser();

    if (!user) return;

    const dashboardUserName =
        document.getElementById("dashboardUserName");

    const dashboardTasks =
        document.getElementById("dashboardTasks");

    const totalTasks =
        document.getElementById("totalTasks");

    const completedTasks =
        document.getElementById("completedTasks");

    const progressPercent =
        document.getElementById("progressPercent");

    if (dashboardUserName) {
        dashboardUserName.textContent = user.name;
    }

    const tasks = user.tasks || [];

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    if (totalTasks) {
        totalTasks.textContent = total;
    }

    if (completedTasks) {
        completedTasks.textContent = completed;
    }

    if (progressPercent) {
        progressPercent.textContent = `${percentage}%`;
    }

    if (dashboardTasks) {
        dashboardTasks.innerHTML = "";

        if (tasks.length === 0) {
            dashboardTasks.innerHTML = `
                <div class="empty-state">
                    <span>🌷</span>
                    <p>No tasks yet. Add your first task!</p>
                </div>
            `;
            return;
        }

        tasks.slice(0, 5).forEach(task => {
            const item = document.createElement("div");

            item.className =
                `dashboard-task ${task.completed ? "completed" : ""}`;

            item.innerHTML = `
                <div>
                    <strong>${escapeHTML(task.title)}</strong>
                    <small>${escapeHTML(task.subject || "General")}</small>
                </div>

                <span>
                    ${task.completed ? "✓ Done" : "Pending"}
                </span>
            `;

            dashboardTasks.appendChild(item);
        });
    }
}

// ======================================================
// SIGN UP
// ======================================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name =
            document.getElementById("signupName").value.trim();

        const email =
            document.getElementById("signupEmail").value.trim().toLowerCase();

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("signupPasswordConfirm").value;

        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill in all the fields.");
            return;
        }

        if (password.length < 6) {
            alert("Your password should be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Your passwords do not match.");
            return;
        }

        const users = getUsers();

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            alert("An account with this email already exists.");
            return;
        }

        const newUser = {
            name: name,
            email: email,
            password: password,
            tasks: [],
            plans: [],
            notes: []
        };

        users.push(newUser);

        saveUsers(users);

        // Automatically log the new user in
        setCurrentUser(email);

        signupForm.reset();

        alert(`Welcome to Bloom, ${name}! 🌷`);

        showPage("dashboardPage");
    });
}

// ======================================================
// LOGIN
// ======================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim().toLowerCase();

        const password =
            document.getElementById("loginPassword").value;

        const users = getUsers();

        const user = users.find(
            account =>
                account.email === email &&
                account.password === password
        );

        if (!user) {
            alert("Incorrect email or password.");
            return;
        }

        setCurrentUser(user.email);

        loginForm.reset();

        alert(`Welcome back, ${user.name}! 💜`);

        showPage("dashboardPage");
    });
}

// ======================================================
// LOGOUT
// ======================================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        clearCurrentUser();

        alert("You have been logged out. See you soon! 🌷");

        showPage("homePage");
    });
}

// ======================================================
// PASSWORD EYE TOGGLE
// ======================================================

document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", function () {
        const targetId = this.dataset.target;

        const input = document.getElementById(targetId);

        if (!input) return;

        if (input.type === "password") {
            input.type = "text";
            this.textContent = "🙈";
        } else {
            input.type = "password";
            this.textContent = "👁";
        }
    });
});

// ======================================================
// NAVIGATION BUTTONS
// ======================================================

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", function () {
        const pageId = this.dataset.page;

        if (pageId) {
            showPage(pageId);
        }
    });
});

// ======================================================
// HOME BUTTONS
// ======================================================

const heroSignupButton =
    document.getElementById("heroSignupButton");

if (heroSignupButton) {
    heroSignupButton.addEventListener("click", function () {
        showPage("signupPage");
    });
}

const heroLoginButton =
    document.getElementById("heroLoginButton");

if (heroLoginButton) {
    heroLoginButton.addEventListener("click", function () {
        showPage("loginPage");
    });
}

const bottomSignupButton =
    document.getElementById("bottomSignupButton");

if (bottomSignupButton) {
    bottomSignupButton.addEventListener("click", function () {
        showPage("signupPage");
    });
}

const bottomLoginButton =
    document.getElementById("bottomLoginButton");

if (bottomLoginButton) {
    bottomLoginButton.addEventListener("click", function () {
        showPage("loginPage");
    });
}

// ======================================================
// SWITCH BETWEEN LOGIN AND SIGN UP
// ======================================================

const switchToSignup =
    document.getElementById("switchToSignup");

if (switchToSignup) {
    switchToSignup.addEventListener("click", function () {
        showPage("signupPage");
    });
}

const switchToLogin =
    document.getElementById("switchToLogin");

if (switchToLogin) {
    switchToLogin.addEventListener("click", function () {
        showPage("loginPage");
    });
}

// ======================================================
// LOGO → HOME
// ======================================================

const logo = document.querySelector(".logo");

if (logo) {
    logo.addEventListener("click", function () {
        showPage("homePage");
    });
}

// ======================================================
// TASKS
// ======================================================

const taskForm =
    document.getElementById("taskForm");

if (taskForm) {
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const user = getCurrentUser();

        if (!user) {
            showPage("loginPage");
            return;
        }

        const taskInput =
            document.getElementById("taskInput");

        const subjectInput =
            document.getElementById("subjectInput");

        const title = taskInput.value.trim();

        const subject =
            subjectInput.value.trim();

        if (!title) {
            alert("Please enter a task.");
            return;
        }

        if (!user.tasks) {
            user.tasks = [];
        }

        user.tasks.push({
            id: Date.now(),
            title: title,
            subject: subject || "General",
            completed: false
        });

        updateCurrentUser(user);

        taskForm.reset();

        renderTasks();
        renderDashboard();
        renderProgress();
    });
}

function renderTasks() {
    const user = getCurrentUser();

    const taskList =
        document.getElementById("taskList");

    if (!taskList || !user) return;

    const tasks = user.tasks || [];

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <span>📝</span>
                <p>You have no tasks yet.</p>
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const taskElement =
            document.createElement("div");

        taskElement.className =
            `task-item ${task.completed ? "completed" : ""}`;

        taskElement.innerHTML = `
            <button
                class="task-check"
                data-id="${task.id}"
                title="Complete task"
            >
                ${task.completed ? "✓" : ""}
            </button>

            <div class="task-content">
                <h4>${escapeHTML(task.title)}</h4>
                <span>${escapeHTML(task.subject || "General")}</span>
            </div>

            <button
                class="task-delete"
                data-delete-id="${task.id}"
                title="Delete task"
            >
                🗑
            </button>
        `;

        taskList.appendChild(taskElement);
    });

    // Complete task
    document.querySelectorAll(".task-check").forEach(button => {
        button.addEventListener("click", function () {
            toggleTask(Number(this.dataset.id));
        });
    });

    // Delete task
    document.querySelectorAll(".task-delete").forEach(button => {
        button.addEventListener("click", function () {
            deleteTask(Number(this.dataset.deleteId));
        });
    });
}

function toggleTask(taskId) {
    const user = getCurrentUser();

    if (!user) return;

    const task = user.tasks.find(
        item => item.id === taskId
    );

    if (task) {
        task.completed = !task.completed;
    }

    updateCurrentUser(user);

    renderTasks();
    renderDashboard();
    renderProgress();
}

function deleteTask(taskId) {
    const user = getCurrentUser();

    if (!user) return;

    user.tasks = user.tasks.filter(
        task => task.id !== taskId
    );

    updateCurrentUser(user);

    renderTasks();
    renderDashboard();
    renderProgress();
}

// ======================================================
// WEEKLY PLANNER
// ======================================================

const showPlanForm =
    document.getElementById("showPlanForm");

const planFormContainer =
    document.getElementById("planForm");

if (showPlanForm) {
    showPlanForm.addEventListener("click", function () {
        if (planFormContainer) {
            planFormContainer.style.display = "block";
        }
    });
}

const cancelPlan =
    document.getElementById("cancelPlan");

if (cancelPlan) {
    cancelPlan.addEventListener("click", function () {
        if (planFormContainer) {
            planFormContainer.style.display = "none";
        }
    });
}

const plannerForm =
    document.getElementById("plannerForm");

if (plannerForm) {
    plannerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const user = getCurrentUser();

        if (!user) {
            showPage("loginPage");
            return;
        }

        const title =
            document.getElementById("planTitle").value.trim();

        const subject =
            document.getElementById("planSubject").value.trim();

        const day =
            document.getElementById("planDay").value;

        const time =
            document.getElementById("planTime").value;

        const description =
            document.getElementById("planDescription").value.trim();

        if (!title || !day || !time) {
            alert("Please enter the title, day and time.");
            return;
        }

        if (!user.plans) {
            user.plans = [];
        }

        user.plans.push({
            id: Date.now(),
            title: title,
            subject: subject || "General",
            day: day,
            time: time,
            description: description,
            completed: false
        });

        updateCurrentUser(user);

        plannerForm.reset();

        if (planFormContainer) {
            planFormContainer.style.display = "none";
        }

        renderPlanner();
    });
}

function renderPlanner() {
    const user = getCurrentUser();

    const weeklyPlanner =
        document.getElementById("weeklyPlanner");

    if (!weeklyPlanner || !user) return;

    const plans = user.plans || [];

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    weeklyPlanner.innerHTML = "";

    days.forEach(day => {
        const dayPlans = plans.filter(
            plan => plan.day === day
        );

        const column =
            document.createElement("div");

        column.className = "planner-day";

        column.innerHTML = `
            <div class="planner-day-header">
                <h3>${day}</h3>
            </div>

            <div class="planner-items">
                ${
                    dayPlans.length === 0
                        ? `<p class="planner-empty">Nothing planned</p>`
                        : ""
                }
            </div>
        `;

        const itemsContainer =
            column.querySelector(".planner-items");

        dayPlans.forEach(plan => {
            const item =
                document.createElement("div");

            item.className =
                `planner-item ${plan.completed ? "completed" : ""}`;

            item.innerHTML = `
                <button
                    class="plan-check"
                    data-plan-id="${plan.id}"
                >
                    ${plan.completed ? "✓" : "○"}
                </button>

                <div class="plan-info">
                    <strong>${escapeHTML(plan.title)}</strong>

                    <span>
                        ${escapeHTML(plan.time)}
                        ·
                        ${escapeHTML(plan.subject)}
                    </span>

                    ${
                        plan.description
                            ? `<small>${escapeHTML(plan.description)}</small>`
                            : ""
                    }
                </div>

                <button
                    class="plan-delete"
                    data-delete-plan="${plan.id}"
                >
                    🗑
                </button>
            `;

            itemsContainer.appendChild(item);
        });

        weeklyPlanner.appendChild(column);
    });

    // Complete planner item
    document.querySelectorAll(".plan-check").forEach(button => {
        button.addEventListener("click", function () {
            togglePlan(Number(this.dataset.planId));
        });
    });

    // Delete planner item
    document.querySelectorAll(".plan-delete").forEach(button => {
        button.addEventListener("click", function () {
            deletePlan(Number(this.dataset.deletePlan));
        });
    });
}

function togglePlan(planId) {
    const user = getCurrentUser();

    if (!user) return;

    const plan = user.plans.find(
        item => item.id === planId
    );

    if (plan) {
        plan.completed = !plan.completed;
    }

    updateCurrentUser(user);

    renderPlanner();
}

function deletePlan(planId) {
    const user = getCurrentUser();

    if (!user) return;

    user.plans = user.plans.filter(
        plan => plan.id !== planId
    );

    updateCurrentUser(user);

    renderPlanner();
}

// ======================================================
// NOTES
// ======================================================

const noteForm =
    document.getElementById("noteForm");

if (noteForm) {
    noteForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const user = getCurrentUser();

        if (!user) {
            showPage("loginPage");
            return;
        }

        const title =
            document.getElementById("noteTitle").value.trim();

        const content =
            document.getElementById("noteContent").value.trim();

        if (!title || !content) {
            alert("Please enter a title and your note.");
            return;
        }

        if (!user.notes) {
            user.notes = [];
        }

        user.notes.push({
            id: Date.now(),
            title: title,
            content: content,
            date: new Date().toLocaleDateString()
        });

        updateCurrentUser(user);

        noteForm.reset();

        renderNotes();
    });
}

function renderNotes() {
    const user = getCurrentUser();

    const notesList =
        document.getElementById("notesList");

    if (!notesList || !user) return;

    const notes = user.notes || [];

    notesList.innerHTML = "";

    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <span>💜</span>
                <p>No notes yet. Start writing!</p>
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        const noteElement =
            document.createElement("div");

        noteElement.className = "note-card";

        noteElement.innerHTML = `
            <div class="note-header">
                <h3>${escapeHTML(note.title)}</h3>

                <button
                    class="note-delete"
                    data-note-id="${note.id}"
                >
                    🗑
                </button>
            </div>

            <p>${escapeHTML(note.content)}</p>

            <small>${escapeHTML(note.date)}</small>
        `;

        notesList.appendChild(noteElement);
    });

    document.querySelectorAll(".note-delete").forEach(button => {
        button.addEventListener("click", function () {
            deleteNote(Number(this.dataset.noteId));
        });
    });
}

function deleteNote(noteId) {
    const user = getCurrentUser();

    if (!user) return;

    user.notes = user.notes.filter(
        note => note.id !== noteId
    );

    updateCurrentUser(user);

    renderNotes();
}

// ======================================================
// PROGRESS
// ======================================================

function renderProgress() {
    const user = getCurrentUser();

    if (!user) return;

    const tasks = user.tasks || [];

    const total =
        tasks.length;

    const completed =
        tasks.filter(task => task.completed).length;

    const remaining =
        total - completed;

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    const progressPercentLarge =
        document.getElementById("progressPercentLarge");

    const progressBar =
        document.getElementById("progressBar");

    const progressMessage =
        document.getElementById("progressMessage");

    const progressTotalTasks =
        document.getElementById("progressTotalTasks");

    const progressCompletedTasks =
        document.getElementById("progressCompletedTasks");

    const progressRemainingTasks =
        document.getElementById("progressRemainingTasks");

    if (progressPercentLarge) {
        progressPercentLarge.textContent =
            `${percentage}%`;
    }

    if (progressBar) {
        progressBar.style.width =
            `${percentage}%`;
    }

    if (progressTotalTasks) {
        progressTotalTasks.textContent =
            total;
    }

    if (progressCompletedTasks) {
        progressCompletedTasks.textContent =
            completed;
    }

    if (progressRemainingTasks) {
        progressRemainingTasks.textContent =
            remaining;
    }

    if (progressMessage) {
        if (total === 0) {
            progressMessage.textContent =
                "Start adding tasks and watch your progress grow 🌱";
        } else if (percentage === 100) {
            progressMessage.textContent =
                "Amazing! You completed everything! 🎉";
        } else if (percentage >= 75) {
            progressMessage.textContent =
                "You're doing so well! Keep going 💜";
        } else if (percentage >= 50) {
            progressMessage.textContent =
                "You're halfway there. Keep pushing 🌷";
        } else if (percentage > 0) {
            progressMessage.textContent =
                "Every completed task counts. You've got this! ✨";
        } else {
            progressMessage.textContent =
                "Let's get started. One task at a time 🌸";
        }
    }
}

// ======================================================
// FLEXIBLE POMODORO / FOCUS TIMER
// ======================================================

let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

const timerDisplay =
    document.getElementById("timerDisplay");

const customMinutes =
    document.getElementById("customMinutes");

const startTimer =
    document.getElementById("startTimer");

const resetTimer =
    document.getElementById("resetTimer");

function updateTimerDisplay() {
    if (!timerDisplay) return;

    const minutes =
        Math.floor(timerSeconds / 60);

    const seconds =
        timerSeconds % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startFocusTimer() {
    if (timerRunning) {
        pauseTimer();
        return;
    }

    // If timer has no time left, use custom minutes
    if (timerSeconds <= 0) {
        let minutes =
            Number(customMinutes?.value);

        if (!minutes || minutes < 1) {
            minutes = 25;
        }

        if (minutes > 600) {
            minutes = 600;
        }

        timerSeconds = Math.round(minutes * 60);
    }

    timerRunning = true;

    if (startTimer) {
        startTimer.textContent = "Pause";
    }

    timerInterval = setInterval(() => {
        timerSeconds--;

        updateTimerDisplay();

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);

            timerInterval = null;
            timerRunning = false;

            if (startTimer) {
                startTimer.textContent = "Start";
            }

            alert("Focus session complete! 🌷 Take a little break.");
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);

    timerInterval = null;
    timerRunning = false;

    if (startTimer) {
        startTimer.textContent = "Resume";
    }
}

function resetFocusTimer() {
    clearInterval(timerInterval);

    timerInterval = null;
    timerRunning = false;

    let minutes =
        Number(customMinutes?.value);

    if (!minutes || minutes < 1) {
        minutes = 25;
    }

    if (minutes > 600) {
        minutes = 600;
    }

    timerSeconds =
        Math.round(minutes * 60);

    updateTimerDisplay();

    if (startTimer) {
        startTimer.textContent = "Start";
    }
}

if (startTimer) {
    startTimer.addEventListener("click", startFocusTimer);
}

if (resetTimer) {
    resetTimer.addEventListener("click", resetFocusTimer);
}

if (customMinutes) {
    customMinutes.addEventListener("change", function () {
        if (!timerRunning) {
            resetFocusTimer();
        }
    });
}

// ======================================================
// HTML SECURITY HELPER
// ======================================================

function escapeHTML(value) {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ======================================================
// INITIALIZE BLOOM
// ======================================================

document.addEventListener("DOMContentLoaded", function () {
    updateUserInterface();

    const user = getCurrentUser();

    if (user) {
        renderDashboard();
        renderTasks();
        renderPlanner();
        renderNotes();
        renderProgress();

        showPage("dashboardPage");
    } else {
        showPage("homePage");
    }

    // Default timer
    if (customMinutes) {
        if (!customMinutes.value) {
            customMinutes.value = 25;
        }
    }

    resetFocusTimer();
});