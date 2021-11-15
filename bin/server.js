const app = require("../app")
const { db } = require("../repository")
const { PORT, HOST } = require("../config/dotenv-config")

db.then(() => {
	app.listen(PORT, HOST, async () => {
		console.log(`Server running. Use our API on http://${HOST}:${PORT}`)
	})
}).catch(e => {
	console.log(`Server not run ${e.message}`)
})
