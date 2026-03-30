// ============================================================
// CONFIGURATION — Replace this URL with your Google Apps Script
// web app URL after deployment (see README.md for instructions)
// ============================================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwD0UZLCdPDsCxI1EHDk1C3Gb-sT3U6bAyCueKLvM8Be4uK9ChBCPeDPuLb3RBIDLg0/exec';

// ===== DOM Elements =====
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// ===== Field definitions (id, required?, validate function, error message) =====
const fields = [
    // -- Basic Data --
    { id: 'sex',              type: 'radio',  required: true,  validate: () => !!document.querySelector('input[name="sex"]:checked'), msg: 'Please select sex' },
    { id: 'firstName',        type: 'input',  required: true,  validate: v => v.trim().length > 0, msg: 'First name is required' },
    { id: 'middleName',       type: 'input',  required: false },
    { id: 'lastName',         type: 'input',  required: true,  validate: v => v.trim().length > 0, msg: 'Last name is required' },
    { id: 'pesel',            type: 'input',  required: true, validate: v => v === '' || /^\d{11}$/.test(v), msg: 'PESEL must be exactly 11 digits' },
    { id: 'dateOfBirth',      type: 'input',  required: true },
    { id: 'placeOfBirth',     type: 'input',  required: true },
    { id: 'countryOfBirth',   type: 'input',  required: true },
    { id: 'nationality',      type: 'input',  required: true },
    { id: 'secondNationality',type: 'input',  required: false },
    // -- Identity Document --
    { id: 'documentType',     type: 'select', required: true },
    { id: 'documentNumber',   type: 'input',  required: true },
    { id: 'dateOfIssue',      type: 'input',  required: true },
    { id: 'expirationDate',   type: 'input',  required: true },
    { id: 'countryOfIssue',   type: 'input',  required: true },
    // -- Contact Details --
    { id: 'phone',            type: 'input',  required: true, validate: v => v === '' || /^[+]?[\d\s\-()]{7,20}$/.test(v.trim()), msg: 'Enter a valid phone number' },
    { id: 'email',            type: 'input',  required: true, validate: v => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Enter a valid email address' },
    // -- Home Address --
    { id: 'city',             type: 'input',  required: true },
    { id: 'zipCode',          type: 'input',  required: true },
    { id: 'countryOfResidence', type: 'input', required: true },
    { id: 'addressLine',      type: 'input',  required: true },
    { id: 'plan',             type: 'select', required: true,  validate: v => v !== '', msg: 'Please select a plan' },
];

// ===== Real-time validation on blur & clear on input =====
fields.forEach(field => {
    if (field.type === 'radio') {
        // For radio: validate on change
        document.querySelectorAll('input[name="sex"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('sexError').textContent = '';
            });
        });
        return;
    }

    const el = document.getElementById(field.id);
    if (!el) return;

    el.addEventListener('blur', () => {
        if (el.disabled) return;
        if (field.validate) {
            const errorEl = document.getElementById(field.id + 'Error');
            if (!field.validate(el.value)) {
                el.classList.add('invalid');
                if (errorEl) errorEl.textContent = field.msg || '';
            } else {
                el.classList.remove('invalid');
                if (errorEl) errorEl.textContent = '';
            }
        } else if (field.required) {
            const errorEl = document.getElementById(field.id + 'Error');
            if (!el.value.trim()) {
                el.classList.add('invalid');
                if (errorEl) errorEl.textContent = 'This field is required';
            } else {
                el.classList.remove('invalid');
                if (errorEl) errorEl.textContent = '';
            }
        }
    });

    el.addEventListener('input', () => {
        el.classList.remove('invalid');
        const errorEl = document.getElementById(field.id + 'Error');
        if (errorEl) errorEl.textContent = '';
    });
});

// ===== Form submission =====
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    // Validate all fields
    let isValid = true;
    fields.forEach(field => {
        if (field.type === 'radio' && field.required) {
            if (!field.validate()) {
                document.getElementById('sexError').textContent = field.msg;
                isValid = false;
            }
            return;
        }

        const el = document.getElementById(field.id);
        if (!el || el.disabled) return;
        const errorEl = document.getElementById(field.id + 'Error');

        if (field.validate && !field.validate(el.value)) {
            el.classList.add('invalid');
            if (errorEl) errorEl.textContent = field.msg || '';
            isValid = false;
        } else if (field.required && !el.value.trim()) {
            el.classList.add('invalid');
            if (errorEl) errorEl.textContent = 'This field is required';
            isValid = false;
        }
    });

    if (!isValid) {
        const firstError = form.querySelector('.invalid');
        if (firstError) firstError.focus();
        return;
    }

    // Collect form data
    const sexRadio = document.querySelector('input[name="sex"]:checked');
    const data = {
        timestamp: new Date().toISOString(),
        // Basic Data
        sex: sexRadio ? sexRadio.value : '',
        firstName: val('firstName'),
        middleName: val('middleName'),
        lastName: val('lastName'),
        pesel: val('pesel'),
        dateOfBirth: val('dateOfBirth'),
        placeOfBirth: val('placeOfBirth'),
        countryOfBirth: val('countryOfBirth'),
        nationality: val('nationality'),
        secondNationality: val('secondNationality'),
        // Identity Document
        documentType: val('documentType'),
        documentNumber: val('documentNumber'),
        dateOfIssue: val('dateOfIssue'),
        expirationDate: val('expirationDate'),
        countryOfIssue: val('countryOfIssue'),
        // Contact Details
        phone: val('phone'),
        email: val('email'),
        // Home Address
        city: val('city'),
        zipCode: val('zipCode'),
        countryOfResidence: val('countryOfResidence'),
        addressLine: val('addressLine'),
        // Plan Selection
        plan: val('plan'),
    };

    setLoading(true);

    try {
        if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            console.log('Form data (demo mode):', data);
            await new Promise(resolve => setTimeout(resolve, 800));
            showSuccess();
            form.reset();
            return;
        }

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        showSuccess();
        form.reset();
    } catch (error) {
        console.error('Submission error:', error);
        showError();
    } finally {
        setLoading(false);
    }
});

// ===== Helpers =====
function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoading.style.display = loading ? 'inline' : 'none';
}

function showSuccess() {
    successMessage.style.display = 'flex';
    errorMessage.style.display = 'none';
    setLoading(false);
}

function showError() {
    errorMessage.style.display = 'flex';
    successMessage.style.display = 'none';
    setLoading(false);
}

// ===== Consent checkboxes: Select All + Submit gate =====
(function() {
    const selectAllCb = document.getElementById('selectAll');
    const consentCbs = document.querySelectorAll('.consent-cb');

    // Disable submit button initially
    updateSubmitState();

    // Select All toggle
    selectAllCb.addEventListener('change', () => {
        consentCbs.forEach(cb => { cb.checked = selectAllCb.checked; });
        updateSubmitState();
    });

    // Individual checkbox change → update Select All state + submit
    consentCbs.forEach(cb => {
        cb.addEventListener('change', () => {
            const allChecked = [...consentCbs].every(c => c.checked);
            selectAllCb.checked = allChecked;
            updateSubmitState();
        });
    });

    function updateSubmitState() {
        const allChecked = [...consentCbs].every(c => c.checked);
        submitBtn.disabled = !allChecked;
    }
})();

// ===== Foreigner without PESEL toggle =====
(function() {
    const foreignerCb = document.getElementById('foreignerNoPesel');
    const peselInput = document.getElementById('pesel');
    const peselError = document.getElementById('peselError');

    foreignerCb.addEventListener('change', () => {
        if (foreignerCb.checked) {
            peselInput.disabled = true;
            peselInput.value = '';
            peselInput.classList.remove('invalid');
            if (peselError) peselError.textContent = '';
        } else {
            peselInput.disabled = false;
        }
    });
})();

// ===== Expiration Date toggle =====
(function() {
    const expirationDateCb = document.getElementById('expirationDateNotApplicable');
    const expirationDateInput = document.getElementById('expirationDate');
    const expirationDateError = document.getElementById('expirationDateError');

    expirationDateCb.addEventListener('change', () => {
        if (expirationDateCb.checked) {
            expirationDateInput.disabled = true;
            expirationDateInput.value = '';
            expirationDateInput.classList.remove('invalid');
            if (expirationDateError) expirationDateError.textContent = '';
        } else {
            expirationDateInput.disabled = false;
        }
    });
})();
