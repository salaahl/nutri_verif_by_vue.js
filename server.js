import express from "express"
import serveStatic from "serve-static"
import path from "path"

app = express()
app.use(serveStatic(path.join(__dirname, 'dist')))
const port = process.env.PORT || 8080
app.listen(port)
