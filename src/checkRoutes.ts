import express from 'express';
import freteRoutes from './routes/freteRoutes';
import veiculoRoutes from './routes/veiculoRoutes';

// Tentativa de importar rotas de motoristas se o arquivo existir
let motoristaRoutes: any = null;
try {
  motoristaRoutes = require('./routes/motoristaRoutes').default;
} catch (e) {
  // Arquivo ainda não foi criado
}

const app = express();

console.log('\n--- DIAGNÓSTICO DO BACKEND TÁPERTO ---');
console.log('✅ Rotas de Fretes: Carregadas');
console.log('✅ Rotas de Veículos: Carregadas');

if (motoristaRoutes) {
  console.log('✅ Rotas de Motoristas: Encontradas e Prontas!');
} else {
  console.log('❌ Rotas de Motoristas: Ficheiro src/routes/motoristaRoutes.ts não encontrado ou com erro.');
}

console.log('-------------------------------------\n');