import { DataTypes } from 'sequelize'
import { sequelize } from '../../db/index.js'

const Partner = sequelize.define('Partner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  partner_code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING
}, {
  tableName: 'partners',
  timestamps: true
})

export { Partner }