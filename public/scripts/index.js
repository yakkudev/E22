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

twemoji.parse(document.body)
