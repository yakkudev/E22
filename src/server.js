const app = require('./app')
const { connectDB } = require('./data/connection')

const PORT = 3000

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server horsin around on http://localhost:${PORT}`)
    })
})
