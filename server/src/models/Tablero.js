import { DataTypes } from 'sequelize';
import sequelize from './index.js';
import Usuario from './Usuario.js';

const Tablero = sequelize.define('Tablero', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' }
  },
  fecha_reunion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tableros',
  timestamps: false
});

// Asociaciones
Tablero.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'creador' });
Usuario.hasMany(Tablero, { foreignKey: 'id_usuario', as: 'tableros' });

export default Tablero;
