// ============================================================
// CONFIGURATION — Replace this URL with your Google Apps Script
// web app URL after deployment (see README.md for instructions)
// ============================================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzD18LJ34Na8y3sQoX902RuBV1kQaHNliWx47X_XcMqpYeaN6H4oKctHMsXJJJ94ag/exec';

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
    // -- Other Details --
    { id: 'haveCompany',      type: 'radio',  required: false },
    // -- Plan Selection --
    { id: 'plan',             type: 'select', required: true,  validate: v => v !== '', msg: 'Please select a plan' },
];

// ===== Real-time validation on blur & clear on input =====
fields.forEach(field => {
    if (field.type === 'radio') {
        // For radio: validate on change
        document.querySelectorAll(`input[name="${field.id}"]`).forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById(field.id + 'Error').textContent = '';
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
                document.getElementById(field.id + 'Error').textContent = field.msg;
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
    const haveCompanyRadio = document.querySelector('input[name="haveCompany"]:checked');
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
        // Other Details
        haveCompany: haveCompanyRadio ? haveCompanyRadio.value : '',
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

// ===== Plan Details — open in new tab =====
const planData = {
    start: [
        ['<b>Outpatient consultations in the field of</b>', '<li>16 specializations</li>'],
        ['<li>allergology, general surgery, dermatology, diabetology, endocrinology, gastroenterology, cardiology, nephrology, neurology, ophthalmology, orthopedics and traumatology of the musculoskeletal system, otolaryngology, pulmonology, rheumatology, urology, venereology</li>', '<li>no limit, free of charge</li>'],
        ['<b>Gynecology and obstetrics</b>', '<li>2 consultations per policy year, free of charge</li>'],
        ['<b>Telemedicine advice in the field of</b>', '<li>12 specializations</li>'],
        ['<li>allergology, general surgery, dermatology, diabetology, endocrinology, gynecology and obstetrics, cardiology, nephrology, neurology, orthopedics and traumatology of the musculoskeletal system, pulmonology, urology</li>', '<li>no limit, free of charge</li>'],
        ['<b>Computed tomography / MRI</b>', '<li>48 tests — unlimited, 15% discount</li>'],
        ['<b>Diagnostic and laboratory tests</b>', '<li>23 — no limit, free of charge</li><li>80 - unlimited, 15% discount</li>'],
        ['<b>Outpatient procedures</b>', '<li>41 — unlimited, free of charge</li>'],
        ['<b>Dentistry</b>', '<li>Check-up and preventive dentistry: unlimited, 20% discount</li>'],
        ['<b>Reimbursement</b> of costs for medical visits and tests covered by the scope (in an amount not higher than indicated on the invoice and not higher than specified for a given service in the price list attached to the contract)', '<li>YES</li>']
    ],
    medium: [
        ['<b>Outpatient consultations in the field of</b>', '<li>24 specializations</li>'],
        ['<li>internal medicine, family medicine, allergology, anesthesiology, audiology, general surgery, oncological surgery, dermatology, diabetology, endocrinology, gastroenterology, hematology, hepatology, cardiology, nephrology, neurology, ophthalmology, oncology, orthopedics and traumatology of the musculoskeletal system, otolaryngology, pulmonology, rheumatology, urology, venereology</li>', '<li>no limit, free of charge</li>'],
        ['<b>Gynecology and obstetrics</b>', '<li>2 consultations per policy year, free of charge</li>'],
        ['<b>Telemedicine advice in the field of</b>', '<li>15 specializations</li>'],
        ['<li>internal medicine, allergology, general surgery, dermatology, diabetology, endocrinology, gynecology and obstetrics, hematology, cardiology, nephrology, neurology, oncology, orthopedics and traumatology of the musculoskeletal system, pulmonology, urology</li>', '<li>no limit, free of charge</li>'],
        ['<b>Computed tomography / MRI</b>', '<li>51 tests — unlimited, 15% discount</li>'],
        ['<b>Diagnostic and laboratory tests</b>', '<li>215 — unlimited, free of charge</li><li>74 — unlimited, 15% discount</li>'],
        ['<b>Outpatient procedures<b>', '<li>42 — unlimited, free of charge</li>'],
        ['<b>Dentistry</b>', '<li>Check-up and conservative dentistry: 20% discount</li>'],
        ['<b>Protective vaccinations</b>', '<li>Tetanus — unlimited, free of charge</li><li>Flu — once per policy year, free of charge</li>'],
        ['<b>Home visits</b>', '<li>2 visits per policy year, free of charge (internal medicine and family medicine)</li>'],
        ['<b>Reimbursement</b> of costs for medical visits and tests covered by the scope (in an amount not higher than indicated on the invoice and not higher than specified for a given service in the price list attached to the contract)','<li>YES</li>']
    ]
};

function openPlanDetails(planKey) {
    const title = planKey === 'start' ? 'Zdrowie Start — Plan Details' : 'Zdrowie Medium — Plan Details';
    const rows = planData[planKey];
    let tableRows = '';
    for (const [service, details] of rows) {
        tableRows += '<tr><td>' + service + '</td><td>' + details + '</td></tr>';
    }
    const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
        + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        + '<title>' + title + '</title>'
        + '<style>'
        + 'body{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f8fafc;color:#1e293b;padding:40px 20px;line-height:1.6;}'
        + 'h1{text-align:center;font-size:1.5rem;margin-bottom:24px;color:#0d9488;}'
        + 'table{width:100%;max-width:900px;margin:0 auto;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07),0 10px 40px rgba(0,0,0,0.08);}'
        + 'th,td{padding:12px 16px;text-align:left;border-bottom:1px solid #e2e8f0;font-size:0.9rem;}'
        + 'th{background:#0d9488;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;}'
        + 'tr:last-child td{border-bottom:none;}'
        + 'tr:hover{background:#ccfbf1;}'
        + 'td:first-child{width:60%;vertical-align:top;}'
        + '</style></head><body>'
        + '<h1>' + title + '</h1>'
        + '<table><thead><tr></tr></thead><tbody>'
        + tableRows
        + '</tbody></table></body></html>';
    const newTab = window.open('', '_blank');
    if (newTab) {
        newTab.document.write(html);
        newTab.document.close();
    }
}
