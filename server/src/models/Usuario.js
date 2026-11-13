import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  usuario: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(180),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(30),
    defaultValue: ''
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

export default Usuario;
