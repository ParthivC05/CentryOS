import { DataTypes } from 'sequelize'
import { sequelize } from '../../db/index.js'

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password_hash: DataTypes.STRING,
  partner_code: DataTypes.STRING,

  centryos_entity_id: DataTypes.STRING,
  centryos_wallet_id: DataTypes.STRING
}, {
  tableName: 'users',
  timestamps: true
})

export { User }
