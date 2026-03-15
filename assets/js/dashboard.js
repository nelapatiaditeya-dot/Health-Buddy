// Dashboard.js - Display HealthBuddy localStorage data
document.addEventListener('DOMContentLoaded', function() {

    // Clear dashboard data on application restart (new session)
    window.addEventListener("load", () => {
        if (!sessionStorage.getItem("appStarted")) {
            sessionStorage.removeItem("symptoms");
            sessionStorage.removeItem("medicines");
            sessionStorage.setItem("appStarted", "true");
        }
    });

    // --- Dynamic Chatbot Health Insights ---
    const healthTips = [
        "Drink at least 8 glasses of water daily",
        "Maintain proper sleep schedule",
        "Exercise for at least 30 minutes",
        "Take breaks from screens to avoid eye strain",
        "Maintain good posture to prevent back pain",
        "Eat fruits and vegetables regularly",
        "Practice deep breathing to reduce stress",
        "Stay hydrated during hot weather",
        "Limit caffeine intake",
        "Wash hands frequently to prevent infections"
    ];

    function rotateHealthTips() {
        const tipEl = document.getElementById('daily-health-tip');
        if (tipEl) {
            const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
            tipEl.style.opacity = 0;
            setTimeout(() => {
                tipEl.textContent = randomTip;
                tipEl.style.opacity = 1;
                tipEl.style.transition = "opacity 0.5s ease";
            }, 300);
        }
    }

    // Initial call & recurring rotation
    rotateHealthTips();
    window.tipInterval = setInterval(rotateHealthTips, 10000);

    let symptomChartInstance = null;
    let weeklyChartInstance = null;
    let sleepChartInstance = null;

    function loadSuggestedMedicines() {
        let meds = JSON.parse(localStorage.getItem("healthBuddyMedicines")) || [];
        const container = document.getElementById("medicine-timeline") || document.getElementById("suggestedMedicines");
        
        if(container) {
            if(meds.length === 0){
                container.innerHTML = '<p style="color: var(--text-muted);">No medicines suggested recently.</p>';
                return;
            }
            container.innerHTML = meds.slice(-5).map(m => {
                let medTitle = m.name.charAt(0).toUpperCase() + m.name.slice(1);
                return `<div class="medicine-item">${medTitle}</div>`;
            }).join("");
        }
    }

    function updateDashboard() {
        const symptoms = JSON.parse(sessionStorage.getItem('symptoms')) || [];

        // --- Health Score Calculation ---
        let score = 100;
        const now = new Date();
        const recentSymptoms = symptoms.filter(s => {
            const sDate = new Date(s.timestamp);
            const diffDays = Math.abs(now - sDate) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        });
        
        score -= recentSymptoms.length * 5;
        if (score < 0) score = 0;
        
        const scoreProgress = document.getElementById('health-score-progress');
        const scoreValue = document.getElementById('health-score-value');
        const statusText = document.getElementById('health-status-text');
        
        if(scoreProgress && scoreValue) {
            scoreProgress.style.background = `conic-gradient(#06b6d4 ${score * 3.6}deg, #1e293b 0deg)`;
            scoreValue.textContent = `${score}%`;
            
            if(score >= 90) statusText.textContent = "Excellent";
            else if(score >= 70) statusText.textContent = "Good";
            else if(score >= 50) statusText.textContent = "Fair";
            else statusText.textContent = "Needs Attention";
        }

        // Chatbot Insights Update
        const tipEl = document.getElementById('daily-health-tip');
        if (tipEl && symptoms.length > 0) {
            const recentSymptom = symptoms[symptoms.length - 1].symptom.toLowerCase();
            let tipText = null;
            if (recentSymptom.includes("fever")) {
                tipText = "Drink plenty of fluids and monitor temperature.";
            } else if (recentSymptom.includes("cold") || recentSymptom.includes("cough") || recentSymptom.includes("sneeze")) {
                tipText = "Steam inhalation and rest may help recovery.";
            } else if (recentSymptom.includes("headache") || recentSymptom.includes("migraine")) {
                tipText = "Rest in a quiet, dark room and stay hydrated.";
            } else if (recentSymptom.includes("body pain") || recentSymptom.includes("weakness") || recentSymptom.includes("ache")) {
                tipText = "Gentle stretching and a warm bath can provide relief.";
            }
            
            if (tipText) {
                if (window.tipInterval) {
                    clearInterval(window.tipInterval);
                    window.tipInterval = null;
                }
                tipEl.textContent = "Insight: " + tipText;
                tipEl.style.opacity = 1;
            }
        }

        // Menstrual Insights Update
        const hasPeriodIssues = symptoms.some(s => ['period cramps', 'late periods', 'irregular periods', 'heavy bleeding', 'pcos'].includes(s.symptom));
        const menstrualInsight = document.getElementById('menstrual-insight');
        if (menstrualInsight) {
            if (hasPeriodIssues) {
                menstrualInsight.textContent = "You've recently logged menstrual symptoms. Ensure you are getting proper rest, hydration, and consider tracking your cycle dates strictly.";
            } else {
                menstrualInsight.textContent = "Tracking regular cycles helps in maintaining reproductive health. Ask Health Buddy if you have concerns.";
            }
        }

        // Helper Function to Format Output String Time
        function formatTimeDisplay(dateStr, dateObj, timeStr) {
            if (dateObj.toDateString() === now.toDateString()) {
                return `Today ${timeStr}`;
            }
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            if (dateObj.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
            }
            return `${dateStr} ${timeStr}`;
        }

        // --- Populate Symptoms Timeline ---
        const symptomContainer = document.getElementById('symptom-timeline');
        if (symptomContainer) {
            if (symptoms.length === 0) {
                symptomContainer.innerHTML = '<p style="color: var(--text-muted);">No recent symptoms recorded.</p>';
            } else {
                symptomContainer.innerHTML = '';
                const sortedSymptoms = [...symptoms].reverse().slice(0, 5);
                sortedSymptoms.forEach(item => {
                    const date = new Date(item.timestamp);
                    const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    const displayDate = formatTimeDisplay(date.toLocaleDateString(), date, timeStr);
                    
                    let title = item.symptom.charAt(0).toUpperCase() + item.symptom.slice(1);
                    if(displayDate.includes('Today')) title += ' detected';

                    const timelineItem = document.createElement('div');
                    timelineItem.className = 'timeline-item';
                    timelineItem.innerHTML = `
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h4>${title}</h4>
                            <span class="timeline-time">- ${displayDate}</span>
                        </div>
                    `;
                    symptomContainer.appendChild(timelineItem);
                });
            }
        }

        // --- Populate Medicines Timeline ---
        loadSuggestedMedicines();

        // --- Chart.js Integration ---
        const symptomCounts = {};
        symptoms.forEach(s => {
            symptomCounts[s.symptom] = (symptomCounts[s.symptom] || 0) + 1;
        });
        
        const ctxSymptom = document.getElementById('symptomChart');
        if(ctxSymptom) {
            const newLabels = Object.keys(symptomCounts).length ? Object.keys(symptomCounts) : ['No Data'];
            const newData = Object.values(symptomCounts).length ? Object.values(symptomCounts) : [1];

            if (symptomChartInstance) {
                symptomChartInstance.data.labels = newLabels;
                symptomChartInstance.data.datasets[0].data = newData;
                symptomChartInstance.update();
            } else {
                symptomChartInstance = new Chart(ctxSymptom, {
                    type: 'doughnut',
                    data: {
                        labels: newLabels,
                        datasets: [{
                            data: newData,
                            backgroundColor: ['#6366f1', '#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#334155'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'right', labels: { color: '#e2e8f0' } } }
                    }
                });
            }
        }

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = [];
        const weekCounts = [0, 0, 0, 0, 0, 0, 0];

        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            last7Days.push(days[d.getDay()]);
        }

        recentSymptoms.forEach(s => {
            const sDate = new Date(s.timestamp);
            const index = last7Days.indexOf(days[sDate.getDay()]);
            if(index !== -1) weekCounts[index]++;
        });

        const ctxWeekly = document.getElementById('weeklyChart');
        if(ctxWeekly) {
            if (weeklyChartInstance) {
                weeklyChartInstance.data.datasets[0].data = weekCounts;
                weeklyChartInstance.update();
            } else {
                weeklyChartInstance = new Chart(ctxWeekly, {
                    type: 'bar',
                    data: {
                        labels: last7Days,
                        datasets: [{
                            label: 'Symptoms Logged',
                            data: weekCounts,
                            backgroundColor: '#6366f1',
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8', stepSize: 1 } },
                            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                        },
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }

        const ctxSleep = document.getElementById('sleepChart');
        if(ctxSleep) {
            if (sleepChartInstance) sleepChartInstance.destroy();
            sleepChartInstance = new Chart(ctxSleep, {
                type: 'line',
                data: {
                    labels: last7Days,
                    datasets: [
                        { label: 'Sleep (hrs)', data: [6, 7, 5, 8, 7, 6, 7], borderColor: '#6366f1', tension: 0.4 },
                        { label: 'Water (Liters)', data: [1.5, 2, 1.8, 2.5, 2, 1.5, 2.2], borderColor: '#06b6d4', tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } },
                    plugins: { legend: { position: 'top', labels: { color: '#e2e8f0' } } }
                }
            });
        }
    }

    // Fire immediately initially
    updateDashboard();

    // Auto Update Feature (When Storage Changes)
    window.addEventListener('storage', updateDashboard);

    // Clear History Button Actions
    const clearBtn = document.getElementById('clear-data');
    if(clearBtn) {
        clearBtn.addEventListener('click', () => {
            if(confirm("Clear all history? This action cannot be undone.")) {
                sessionStorage.removeItem('symptoms');
                sessionStorage.removeItem('medicines');
                localStorage.removeItem('healthBuddyMedicines');
                sessionStorage.removeItem('chatHistory');
                updateDashboard();
            }
        });
    }
});
