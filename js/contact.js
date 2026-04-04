/* Contact form: Web3Forms primary, Formspree fallback */
(function () {
    var form = document.getElementById('contact-form');
    var statusEl = document.getElementById('form-status');
    var submitBtn = document.getElementById('contact-submit');
    if (!form || !statusEl || !submitBtn) return;

    var btnText = submitBtn.querySelector('.btn-text');
    var btnLoading = submitBtn.querySelector('.btn-loading');

    var WEB3FORMS_URL = 'https://api.web3forms.com/submit';
    var FORMSPREE_URL = 'https://formspree.io/f/xreobknk';
    var WEB3FORMS_KEY = 'fc8318e2-5801-47a9-af8c-209c4b3c5846';

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var formData = new FormData(form);

        var hCaptchaResponse = formData.get('h-captcha-response');
        if (!hCaptchaResponse) {
            showStatus('error', 'Please complete the CAPTCHA spam check before sending.');
            return;
        }

        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;

        var primaryData = new FormData();
        for (var pair of formData.entries()) {
            primaryData.append(pair[0], pair[1]);
        }
        primaryData.append('access_key', WEB3FORMS_KEY);

        fetch(WEB3FORMS_URL, {
            method: 'POST',
            body: primaryData,
            headers: { 'Accept': 'application/json' }
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data && data.success) {
                showStatus('success', 'Thank you! Your message has been sent successfully.');
                form.reset();
            } else {
                console.warn('Web3Forms failed. Falling back to Formspree...');
                return sendFormspree(formData);
            }
        })
        .catch(function () {
            console.warn('Web3Forms network error. Falling back to Formspree...');
            return sendFormspree(formData);
        })
        .finally(function () {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        });
    });

    function sendFormspree(formData) {
        formData.delete('h-captcha-response');
        formData.delete('g-recaptcha-response');

        return fetch(FORMSPREE_URL, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(function (response) {
            if (response.ok) {
                showStatus('success', 'Thank you! Your message has been sent successfully.');
                form.reset();
            } else {
                return response.json().then(function (data) {
                    var errors = data.errors
                        ? data.errors.map(function (err) { return err.message; }).join(', ')
                        : 'Something went wrong.';
                    showStatus('error', 'Oops! ' + errors);
                });
            }
        })
        .catch(function () {
            showStatus('error', 'Network error. Please try again or use the email link below.');
        });
    }

    function showStatus(type, message) {
        statusEl.textContent = message;
        statusEl.className = 'form-status form-status-' + type;
        statusEl.style.display = 'block';
        statusEl.style.opacity = '1';
        setTimeout(function () {
            statusEl.style.opacity = '0';
            setTimeout(function () {
                statusEl.style.display = 'none';
                statusEl.style.opacity = '1';
            }, 400);
        }, 6000);
    }
})();