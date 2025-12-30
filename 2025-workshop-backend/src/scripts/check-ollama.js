/**
 * Script multisistema para verificar la instalación de Ollama.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import chalk from 'chalk';

// Convertimos funcionamiento de exec (con callbacks) a promesas con async/await usando promisify
const execAsync = promisify(exec);

// Leer el modelo desde variables de entorno (misma configuración que ollama.service.js)
const REQUIRED_MODEL = process.env.OLLAMA_MODEL;

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
	console.log(`\n${chalk.yellow.bold('Ollama no está instalado')}`);
	console.log(`\n${chalk.cyan(`Instrucciones de instalación para ${osType}:`)}\n`);

	if (osType === 'macOS') {
		console.log('Opción 1 - Homebrew (recomendado):');
		console.log(chalk.gray('  brew install ollama'));
		console.log('\nOpción 2 - Descarga directa:');
		console.log(chalk.gray('  https://ollama.com/download/mac'));
	} else if (osType === 'Linux') {
		console.log('Ejecuta este comando:');
		console.log(chalk.gray('  curl -fsSL https://ollama.com/install.sh | sh'));
		console.log('\nO visita: https://ollama.com/download/linux');
	} else if (osType === 'Windows') {
		console.log('Descarga el instalador desde:');
		console.log(chalk.gray('  https://ollama.com/download/windows'));
	} else {
		console.log('Visita: https://ollama.com/download');
	}

	console.log(`\n${chalk.cyan('Después de instalar, ejecuta este script nuevamente.')}\n`);
}

/**
 * Muestra instrucciones para descargar el modelo
 */
function showModelInstructions() {
	console.log(`\n${chalk.yellow.bold(`El modelo '${REQUIRED_MODEL}' no está disponible`)}`);
	console.log(`\n${chalk.cyan('Para descargar el modelo:')}\n`);
	console.log(chalk.gray(`  ollama pull ${REQUIRED_MODEL}`));
}

/**
 * Función principal
 */
async function main() {
	console.log(`\n${chalk.bold('Verificando configuración de Ollama...')}\n`);

	// 1. Detectar sistema operativo
	const osType = detectOS();
	console.log(`Sistema operativo: ${chalk.cyan(osType)}`);

	// 2. Verificar instalación de Ollama
	const ollamaCheck = await checkOllamaInstalled();

	// 2.1. Si no está instalado
	if (!ollamaCheck.installed) {
		console.log(`Ollama: ${chalk.red('✗ No instalado')}`);
		showInstallInstructions(osType);
		process.exit(1); // Salimos con código de error
	}

	// 2.2. Si está instalado
	console.log(`Ollama: ${chalk.green(`✓ Instalado (${ollamaCheck.version})`)}`);

	// 3. Verificar que el modelo esté disponible
	const modelCheck = await checkModelAvailable();

	// 3.1. Si no está disponible
	if (!modelCheck.available) {
		console.log(`Modelo '${REQUIRED_MODEL}': ${chalk.red('✗ No disponible')}`);
		showModelInstructions();
		process.exit(1);
	}

	// 4. Si está disponible -> configuración completa pasada
	console.log(`Modelo '${REQUIRED_MODEL}': ${chalk.green('✓ Disponible')}`);
	console.log(
		`\n${chalk.green.bold(
			'✅ ¡Todo listo! Ollama está configurado correctamente. ¡Deberías tener Ollama abierto listo para ser probado!'
		)}`
	);

	process.exit(0); // Salimos con código de éxito
}

// Ejecutar el script capturando errores no esperados
main().catch(err => {
	console.error(`\n${chalk.red(`Error inesperado: ${err.message}`)}\n`);
	process.exit(1);
});
