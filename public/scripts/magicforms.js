async function sendMagicForm(form, action, method, onResponse) {
    // collect form data
    const formData = {}
    const inputs = form.querySelectorAll('input, textarea, select')

    inputs.forEach((input) => {
        if (input.name) formData[input.name] = input.value
    })
    const formBody = new URLSearchParams(formData)

    // prep fetch options
    const fetchOptions = {
        method: method,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }

    // put form data into body (or the url in GET requests)
    let url = action
    if (method === 'GET') {
        url += `?${formBody.toString()}`
    } else {
        fetchOptions.body = formBody.toString()
    }

    // send request
    const response = await fetch(url, fetchOptions)
    const data = await response.json().catch(() => ({}))

    // on-response callback
    if (onResponse && typeof window[onResponse] === 'function') {
        window[onResponse](data, response)
    }
}

function initMagicForms() {
    const magicForms = document.querySelectorAll('magicform')

    magicForms.forEach((form) => {
        const action = form.getAttribute('action')
        const method = form.getAttribute('method') || 'GET'
        const onResponse = form.getAttribute('onresponse')

        // find submit buttons
        const submitButtons = form.querySelectorAll('button[type="submit"]')

        submitButtons.forEach((button) => {
            button.addEventListener('click', async (e) => {
                e.preventDefault()

                sendMagicForm(form, action, method, onResponse).catch((error) =>
                    console.error('magicform error:', error)
                )
            })
        })
    })
}

window.addEventListener('load', initMagicForms)
