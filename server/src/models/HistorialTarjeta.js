import { DataTypes } from 'sequelize';
import sequelize from './index.js';
import Tarjeta from './Tarjeta.js';

const HistorialTarjeta = sequelize.define('HistorialTarjeta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tarjeta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'tarjetas', key: 'id' }
  },
  estado_anterior: {
    type: DataTypes.STRING(50)
  },
  estado_nuevo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'historial_tarjetas',
  timestamps: false
});

// Asociaciones
HistorialTarjeta.belongsTo(Tarjeta, { foreignKey: 'tarjeta_id', as: 'tarjeta' });
Tarjeta.hasMany(HistorialTarjeta, { foreignKey: 'tarjeta_id', as: 'historial' });

export default HistorialTarjeta;
