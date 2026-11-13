import { DataTypes } from 'sequelize';
import sequelize from './index.js';
import Tablero from './Tablero.js';

const Tarjeta = sequelize.define('Tarjeta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  checklist: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Iniciado',
    validate: {
      isIn: [['Iniciado', 'Pendiente', 'En Proceso', 'Listo', 'Entregado', 'Verificado']]
    }
  },
  tablero_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'tableros', key: 'id' }
  },
  responsable: {
    type: DataTypes.STRING(150),
    defaultValue: ''
  },
  fecha_inicio: {
    type: DataTypes.DATE
  },
  fecha_vencimiento: {
    type: DataTypes.DATE
  },
  fecha_culminacion: {
    type: DataTypes.DATE
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tarjetas',
  timestamps: false
});

// Asociaciones
Tarjeta.belongsTo(Tablero, { foreignKey: 'tablero_id', as: 'tablero' });
Tablero.hasMany(Tarjeta, { foreignKey: 'tablero_id', as: 'tarjetas' });

export default Tarjeta;
