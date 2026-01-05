import 'dotenv/config'
import app from './app.js'
import { sequelize } from './db/index.js'
import { User } from './modules/users/user.model.js'
import { Partner } from './modules/partners/partner.model.js'
import { Transaction } from './modules/payments/payment.model.js'

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await sequelize.authenticate()
    console.log('Database connected')

    // Associations
    User.belongsTo(Partner, { foreignKey: 'partner_code', targetKey: 'partner_code', as: 'partner', constraints: false })
    Partner.hasMany(User, { foreignKey: 'partner_code', sourceKey: 'partner_code', as: 'users', constraints: false })

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
