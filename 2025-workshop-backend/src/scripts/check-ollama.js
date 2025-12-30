/**
 * Script multisistema para verificar la instalación de Ollama.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

// Convertimos funcionamiento de exec (con callbacks) a promsesas con async/awayt usando promisify
const execAsync = promisify(exec);

// Colores para la terminal
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	cyan: '\x1b[36m',
};

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
		// Si falla, puede ser que Ollama no esté corriendo o no esté instalado
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
	console.log(`\n${colors.yellow}${colors.bright}Ollama no está instalado${colors.reset}`);
	console.log(`\n${colors.cyan}Instrucciones de instalación para ${osType}:${colors.reset}\n`);

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

	console.log(
		`\n${colors.cyan}Después de instalar, ejecuta este script nuevamente.${colors.reset}\n`
	);
}

/**
 * Muestra instrucciones para descargar el modelo
 */
function showModelInstructions() {
	console.log(
		`\n${colors.yellow}${colors.bright}El modelo '${REQUIRED_MODEL}' no está disponible${colors.reset}`
	);
	console.log(`\n${colors.cyan}Para descargar el modelo:${colors.reset}\n`);
	console.log(`  ollama pull ${REQUIRED_MODEL}`);
}

/**
 * Función principal
 */
async function main() {
	console.log(`\n${colors.bright}Verificando configuración de Ollama...${colors.reset}\n`);

	// 1. Detectar sistema operativo
	const osType = detectOS();
	console.log(`Sistema operativo: ${colors.cyan}${osType}${colors.reset}`);

	// 2. Verificar instalación de Ollama
	const ollamaCheck = await checkOllamaInstalled();

	// 2.1. Si no está instalado
	if (!ollamaCheck.installed) {
		console.log(`Ollama: ${colors.red}✗ No instalado${colors.reset}`);
		showInstallInstructions(osType);
		process.exit(1); // Salimos con código de error
	}

	// 2.2. Si está instalado
	console.log(`Ollama: ${colors.green}✓ Instalado (${ollamaCheck.version})${colors.reset}`);

	// 3. Verificar que el modelo esté disponible
	const modelCheck = await checkModelAvailable();

	// 3.1. Si no está disponible
	if (!modelCheck.available) {
		console.log(`Modelo '${REQUIRED_MODEL}': ${colors.red}✗ No disponible${colors.reset}`);
		showModelInstructions();
		process.exit(1);
	}

	// 4. Si está disponible -> configuración completa pasada
	console.log(`Modelo '${REQUIRED_MODEL}': ${colors.green}✓ Disponible${colors.reset}`);
	console.log(
		`\n${colors.green}${colors.bright}✅ ¡Todo listo! Ollama está configurado correctamente. Asegura que lo tienes abierto antes de probar nuestro servicio de IA!${colors.reset}`
	);

	process.exit(0); // Salimos con código de éxito
}

// Ejecutar el script capturando errores no esperados
main().catch(error => {
	console.error(`\n${colors.red}Error inesperado: ${error.message}${colors.reset}\n`);
	process.exit(1);
});
