// --- 1. تنظیمات عمومی و PWA ---

// ثبت Service Worker برای قابلیت آفلاین
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered!', reg.scope))
            .catch(err => console.error('Service Worker Failed:', err));
    });
}

// تشخیص صفحه فعلی و اجرای کد مربوطه
document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.id;

    if (pageId === 'page-workout') {
        loadWorkoutPage();
    } else if (pageId === 'page-tracker') {
        loadTrackerPage();
    }
    
    // چک کردن وضعیت آنلاین/آفلاین
    window.addEventListener('offline', () => showOfflineStatus(true));
    window.addEventListener('online', () => showOfflineStatus(false));
});

function showOfflineStatus(isOffline) {
    const badge = document.getElementById('offline-badge');
    if (badge) {
        badge.style.display = isOffline ? 'block' : 'none';
        badge.textContent = isOffline ? 'شما آفلاین هستید (ویدیوهای دیده شده در دسترس‌اند)' : '';
    }
}

// --- 2. منطق صفحه تمرین (Workout) ---

async function loadWorkoutPage() {
    const container = document.getElementById('workout-container');
    container.innerHTML = '<p class="text-center">در حال بارگذاری تمرینات...</p>';

    try {
        // دریافت اطلاعات از فایل JSON
        const response = await fetch('./data/exercises.json');
        if (!response.ok) throw new Error('فایل تمرینات یافت نشد');
        
        const exercises = await response.json();
        container.innerHTML = ''; // پاک کردن پیام لودینگ

        if (exercises.length === 0) {
            container.innerHTML = '<p class="text-center">هنوز حرکتی اضافه نشده است.</p>';
            return;
        }

        // ساخت کارت‌ها برای هر حرکت
        exercises.forEach(exercise => {
            const card = document.createElement('div');
            card.className = 'exercise-card';
            
            // قالب HTML هر کارت
            card.innerHTML = `
                <div class="exercise-header">
                    <span class="exercise-title">${exercise.name}</span>
                </div>
                
                <div class="video-container">
                    <video controls playsinline preload="metadata" poster="icons/icon-192.png">
                        <source src="${exercise.videoUrl}" type="video/mp4">
                        مرورگر شما ویدیو را پشتیبانی نمی‌کند.
                    </video>
                </div>

                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-value">${exercise.sets}</div>
                        <div class="stat-label">ست</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${exercise.reps}</div>
                        <div class="stat-label">تکرار</div>
                    </div>
                </div>

                <p class="mb-4" style="font-size: 0.9rem; color: #666;">
                    ${exercise.description || ''}
                </p>

                <button class="btn btn-primary" onclick="logWorkout('${exercise.id}', '${exercise.name}')">
                    ✅ ثبت انجام حرکت
                </button>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-center text-danger">خطا در بارگذاری اطلاعات. لطفا اینترنت خود را چک کنید.</p>';
    }
}

// تابع ثبت تمرین (وقتی دکمه زده می‌شود)
window.logWorkout = function(id, name) {
    const history = JSON.parse(localStorage.getItem('workout_history') || '[]');
    
    const newLog = {
        id: id,
        name: name,
        date: new Date().toISOString(), // تاریخ استاندارد سیستم
        displayDate: new Date().toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' }) // تاریخ شمسی برای نمایش
    };

    history.unshift(newLog); // اضافه کردن به ابتدای لیست
    localStorage.setItem('workout_history', JSON.stringify(history));

    alert(`حرکت "${name}" ثبت شد! خسته نباشید.`);
};

// --- 3. منطق صفحه ردیاب (Tracker) ---

function loadTrackerPage() {
    const historyContainer = document.getElementById('history-list');
    const totalCountEl = document.getElementById('total-workouts');
    
    const history = JSON.parse(localStorage.getItem('workout_history') || '[]');

    // نمایش تعداد کل
    if (totalCountEl) {
        totalCountEl.innerText = history.length;
    }

    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="text-center">هنوز تمرینی ثبت نکرده‌اید.</p>';
        return;
    }

    historyContainer.innerHTML = ''; // پاک کردن لیست قبلی

    history.forEach(log => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <strong>${log.name}</strong>
            <span class="history-date">${log.displayDate}</span>
        `;
        historyContainer.appendChild(item);
    });

    // دکمه پاک کردن تاریخچه (اختیاری)
    const clearBtn = document.getElementById('clear-history');
    if (clearBtn) {
        clearBtn.onclick = () => {
            if(confirm('آیا مطمئن هستید که می‌خواهید تمام تاریخچه را پاک کنید؟')) {
                localStorage.removeItem('workout_history');
                location.reload();
            }
        };
    }
}