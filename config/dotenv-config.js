require("dotenv").config()
console.log(111111111111)
console.log(222222222222, process)
console.log(333333333333, process.env)
console.log(444444444444)
module.exports = { PORT: 4040, ...process.env }
