import { html, render } from 'htm/preact'

const renderPost = (postData) => {
    return html`
        <a href="/horse/${postData.user.handle}">@${postData.user.handle}</a>
        <p>${postData.post.content}</p>
    `
}

async function loadPosts() {
    const postDivs = document.querySelectorAll('[post-id]')

    for (const div of postDivs) {
        const postId = div.getAttribute('post-id')

        fetch(`/api/post/${postId}`)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('error loading post')
                }
                const postData = await res.json()
                render(renderPost(postData), div)
            })
            .catch((error) => {
                div.remove()
                console.error('error fetching post:', error)
            })
    }
}

window.addEventListener('load', loadPosts)
