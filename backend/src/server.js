import 'dotenv/config'
import app from './app.js'
import { sequelize } from './db/index.js'

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await sequelize.authenticate()
    console.log('Database connected')

    await sequelize.sync({ alter: true }) // 👈 IMPORTANT
    console.log('Database synced')

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('DB Error:', err)
  }
}

start()
