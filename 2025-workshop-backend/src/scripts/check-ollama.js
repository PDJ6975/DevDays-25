/**
 * Script multisistema para verificar la instalación de Ollama.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

// Convertimos funcionamiento de exec (con callbacks) a promsesas con async/awayt usando promisify
const execAsync = promisify(exec);

// Colores ANSI para la terminal
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	cyan: '\x1b[36m',
};

// Funciones para encapsular los colores y mejorar la legibilidad del código
const success = msg => `${colors.green}${msg}${colors.reset}`;
const error = msg => `${colors.red}${msg}${colors.reset}`;
const info = msg => `${colors.cyan}${msg}${colors.reset}`;
const title = msg => `${colors.bright}${msg}${colors.reset}`;
const warningBold = msg => `${colors.yellow}${colors.bright}${msg}${colors.reset}`;
const successBold = msg => `${colors.green}${colors.bright}${msg}${colors.reset}`;

// Modelo usado en el servicio (ver ollama.service.js:10)
const REQUIRED_MODEL = 'llama3.2:1b';

/**
 * Detecta el sistema operativo actual
 */
function detectOS() {
	const platform = os.platform();

	if (platform === 'win32') return 'Windows';
	if (platform === 'darwin') return 'macOS';
	if (platform === 'linux') return 'Linux';

	return platform; // Para otros sistemas
}

/**
 * Verifica si Ollama está instalado en el sistema
 */
async function checkOllamaInstalled() {
	try {
		const { stdout } = await execAsync('ollama --version');
		return {
			installed: true,
			version: stdout.trim(),
		};
	} catch (error) {
		return {
			installed: false,
			version: null,
		};
	}
}

/**
 * Verifica si el modelo específico está disponible localmente
 */
async function checkModelAvailable() {
	try {
		const { stdout } = await execAsync('ollama list');

		// La salida de 'ollama list' es una tabla con los modelos. Buscamos si el requerido aparece
		const modelExists = stdout.includes(REQUIRED_MODEL);

		return {
			available: modelExists,
			allModels: stdout,
		};
	} catch (error) {
		// Si falla, puede ser que Ollama no esté corriendo o no esté instalado (aunque debe correr con ollama list)
		return {
			available: false,
			error: error.message,
		};
	}
}

/**
 * Muestra instrucciones de instalación según el sistema operativo
 */
function showInstallInstructions(osType) {
	console.log(`\n${warningBold('Ollama no está instalado')}`);
	console.log(`\n${info(`Instrucciones de instalación para ${osType}:`)}\n`);

	if (osType === 'macOS') {
		console.log('Opción 1 - Homebrew (recomendado):');
		console.log('  brew install ollama');
		console.log('\nOpción 2 - Descarga directa:');
		console.log('  https://ollama.com/download/mac');
	} else if (osType === 'Linux') {
		console.log('Ejecuta este comando:');
		console.log('  curl -fsSL https://ollama.com/install.sh | sh');
		console.log('\nO visita: https://ollama.com/download/linux');
	} else if (osType === 'Windows') {
		console.log('Descarga el instalador desde:');
		console.log('  https://ollama.com/download/windows');
	} else {
		console.log('Visita: https://ollama.com/download');
	}

	console.log(`\n${info('Después de instalar, ejecuta este script nuevamente.')}\n`);
}

/**
 * Muestra instrucciones para descargar el modelo
 */
function showModelInstructions() {
	console.log(`\n${warningBold(`El modelo '${REQUIRED_MODEL}' no está disponible`)}`);
	console.log(`\n${info('Para descargar el modelo:')}\n`);
	console.log(`  ollama pull ${REQUIRED_MODEL}`);
}

/**
 * Función principal
 */
async function main() {
	console.log(`\n${title('Verificando configuración de Ollama...')}\n`);

	// 1. Detectar sistema operativo
	const osType = detectOS();
	console.log(`Sistema operativo: ${info(osType)}`);

	// 2. Verificar instalación de Ollama
	const ollamaCheck = await checkOllamaInstalled();

	// 2.1. Si no está instalado
	if (!ollamaCheck.installed) {
		console.log(`Ollama: ${error('✗ No instalado')}`);
		showInstallInstructions(osType);
		process.exit(1); // Salimos con código de error
	}

	// 2.2. Si está instalado
	console.log(`Ollama: ${success(`✓ Instalado (${ollamaCheck.version})`)}`);

	// 3. Verificar que el modelo esté disponible
	const modelCheck = await checkModelAvailable();

	// 3.1. Si no está disponible
	if (!modelCheck.available) {
		console.log(`Modelo '${REQUIRED_MODEL}': ${error('✗ No disponible')}`);
		showModelInstructions();
		process.exit(1);
	}

	// 4. Si está disponible -> configuración completa pasada
	console.log(`Modelo '${REQUIRED_MODEL}': ${success('✓ Disponible')}`);
	console.log(`\n${successBold('✅ ¡Todo listo! Ollama está configurado correctamente.')}`);

	process.exit(0); // Salimos con código de éxito
}

// Ejecutar el script capturando errores no esperados
main().catch(err => {
	console.error(`\n${error(`Error inesperado: ${err.message}`)}\n`);
	process.exit(1);
});
