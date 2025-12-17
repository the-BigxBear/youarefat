document.addEventListener('DOMContentLoaded', () => {
    
    // انتخاب المان‌های صفحه
    const form = document.getElementById('exercise-form');
    const previewSection = document.getElementById('preview-section');
    const addedList = document.getElementById('added-list');
    const jsonOutput = document.getElementById('json-output');
    const countBadge = document.getElementById('count-badge');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    // آرایه برای نگهداری لیست موقت حرکات
    let exercises = [];

    // --- 1. افزودن حرکت به لیست ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // جلوگیری از رفرش صفحه

        // ساختن یک آیدی منحصر به فرد بر اساس زمان
        const uniqueId = 'move_' + Date.now();

        // دریافت مقادیر از فرم
        const newExercise = {
            id: uniqueId,
            name: document.getElementById('ex-name').value.trim(),
            category: document.getElementById('ex-category').value,
            videoUrl: document.getElementById('ex-video').value.trim(),
            sets: parseInt(document.getElementById('ex-sets').value),
            reps: document.getElementById('ex-reps').value.trim(),
            description: document.getElementById('ex-desc').value.trim()
        };

        // اضافه کردن به آرایه
        exercises.push(newExercise);

        // بروزرسانی ظاهر صفحه
        updateUI();
        
        // خالی کردن فرم برای حرکت بعدی
        form.reset();
        document.getElementById('ex-name').focus(); // تمرکز روی فیلد اول
    });

    // --- 2. بروزرسانی رابط کاربری و تولید JSON ---
    function updateUI() {
        // اگر لیستی وجود دارد، بخش پیش‌نمایش را نشان بده
        if (exercises.length > 0) {
            previewSection.style.display = 'block';
        } else {
            previewSection.style.display = 'none';
        }

        // بروزرسانی عدد شمارنده
        countBadge.innerText = exercises.length;

        // ساخت لیست HTML برای نمایش موقت
        addedList.innerHTML = '';
        exercises.forEach((ex, index) => {
            const li = document.createElement('li');
            li.style.padding = '5px 0';
            li.style.borderBottom = '1px solid #eee';
            li.innerHTML = `
                <strong>${index + 1}. ${ex.name}</strong> 
                <small class="text-muted">(${ex.category})</small>
            `;
            addedList.appendChild(li);
        });

        // تولید کد JSON نهایی
        // پارامتر null و 2 برای مرتب‌سازی و فاصله گذاری زیباست
        const jsonString = JSON.stringify(exercises, null, 2);
        jsonOutput.value = jsonString;
    }

    // --- 3. دکمه کپی کردن کد ---
    copyBtn.addEventListener('click', () => {
        jsonOutput.select();
        jsonOutput.setSelectionRange(0, 99999); // برای موبایل

        try {
            navigator.clipboard.writeText(jsonOutput.value).then(() => {
                alert('کد JSON کپی شد! \nحالا فایل data/exercises.json را باز کنید و این کد را جایگزین کنید.');
            });
        } catch (err) {
            // روش قدیمی اگر روش بالا کار نکرد
            document.execCommand('copy');
            alert('کد کپی شد.');
        }
    });

    // --- 4. دکمه پاک کردن همه ---
    clearBtn.addEventListener('click', () => {
        if (confirm('آیا مطمئن هستید؟ تمام لیست ساخته شده پاک می‌شود.')) {
            exercises = [];
            updateUI();
        }
    });
});