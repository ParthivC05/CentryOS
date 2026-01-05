import { DataTypes } from 'sequelize'
import { sequelize } from '../../db/index.js'
import { User } from '../users/user.model.js'

const Transaction = sequelize.define('CentryTransaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  eventType: DataTypes.STRING,
  status: DataTypes.STRING,
  entry: DataTypes.STRING,
  amount: DataTypes.DECIMAL,
  method: DataTypes.STRING,
  summary: DataTypes.STRING,
  currency: DataTypes.STRING,
  entityId: DataTypes.STRING,
  walletId: DataTypes.STRING,
  timestamp: DataTypes.DATE,
  entityType: DataTypes.STRING,
  description: DataTypes.TEXT,
  transactionId: {
    type: DataTypes.STRING,
    unique: true
  },
  paymentLink: DataTypes.JSON,
  feeCharged: DataTypes.STRING,
  rawPayload: DataTypes.JSON,
  userId: DataTypes.INTEGER
}, {
  tableName: 'centryos_transactions',
  timestamps: true
})

// Define associations
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export { Transaction }
