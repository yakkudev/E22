function refresh(data, res) {
    if (res.ok) {
        location.reload()
    }
}

function goBack(data, res) {
    if (res.ok) {
        history.back()
    }
}

const handleInput = document.getElementById('handle')
const passwordInput = document.getElementById('password')
const passwordConfirmInput = document.getElementById('password-confirm')

const formSubmitButton = document.getElementById('form-submit')
const formErrors = document.getElementById('form-errors')

handleInput?.addEventListener('change', validateRegister)
passwordInput?.addEventListener('change', validateRegister)
passwordConfirmInput?.addEventListener('change', validateRegister)

function loginResponse(data, res) {
    if (res.ok) {
        location.reload()
        return
    }

    renderErrors(data.errors ?? ['Server error'])
}

function validatePassword(password) {
    const rules = [
        {
            regex: /.{8,}/,
            error: 'Password must be at least 8 characters long',
        },
        {
            regex: /^.{1,100}$/,
            error: 'Password must be at most 100 characters long',
        },
        {
            regex: /[A-Z]/,
            error: 'Password must use at least one uppercase letter',
        },
        {
            regex: /[a-z]/,
            error: 'Password must use at least one lowercase letter',
        },
        { regex: /\d/, error: 'Password must use at least one digit' },
        {
            regex: /[!@#$%^&*()-=_+,.<>/?;:"|{}]/,
            error: 'Password must use at least one special character',
        },
    ]

    let errors = []
    for (const { regex, error } of rules) {
        if (!regex.test(password)) {
            errors[errors.length] = error
        }
    }

    return { errors }
}

function validatePasswords() {
    let errors = []
    if (passwordInput.value.length) {
        const result = validatePassword(passwordInput.value)
        errors = [...errors, ...result.errors]
        if (passwordConfirmInput.value !== passwordInput.value) {
            errors = [...errors, 'Passwords do not match']
        }
    } else {
        errors = ['Password cannot be empty']
    }

    return { errors }
}

async function validateHandle() {
    let errors = []

    if (handleInput.value.length) {
        const reqBody = new URLSearchParams({ handle: handleInput.value })
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: reqBody.toString(),
        }

        const url = '/api/validate-handle'
        const response = await fetch(url, fetchOptions)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
            errors = [...data.errors]
        }
    } else {
        errors = ['Handle cannot be empty']
    }
    return { errors }
}

function renderErrors(errors) {
    let html = ''
    html += '<ul>'
    for (const err of errors) {
        html += `<li>${err}</li>`
    }
    html += '</ul>'
    formErrors.innerHTML = html
}

async function validateRegister() {
    formSubmitButton.disabled = true

    const passwordsResult = validatePasswords()
    const handleResult = await validateHandle()
    const errors = [...passwordsResult.errors, ...handleResult.errors]
    if (errors.length) {
        renderErrors(errors)
        return
    }

    formErrors.innerHTML = ''
    formSubmitButton.disabled = false
}

twemoji.parse(document.body)
