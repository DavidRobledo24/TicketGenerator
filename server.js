const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { exec } = require('child_process');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
const port = 3000;

const credentials = require('./bd-restaurante-455516-0e578bc4c013.json');
const spreadsheetId = '1tgzjQeTLgSlX7dPWexUeHlho9VezCIGUC2BI6fTzFCA';

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/spreadsheets'
    ]
});

const sheets = google.sheets({ version: 'v4', auth });

const ValidadorComida = require('./validarComida');
const validador = new ValidadorComida(sheets, spreadsheetId);

let testMode = false;

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => res.json({ message: 'Conexión exitosa con el servidor' }));

app.post('/toggleTestMode', (req, res) => {
    testMode = !testMode;
    res.json({ success: true, testMode });
});

app.get('/testMode', (req, res) => {
    res.json({
        testMode,
        message: `Modo de prueba está ${testMode ? 'activado' : 'desactivado'}`
    });
});

app.post('/verificar', async (req, res) => {
    try {
        const { codigo } = req.body;
        const resultado = await validador.verificarEstudiante(codigo);
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        console.error('Error en verificar:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

app.get('/proxy-image', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'Falta el parámetro "id"' });

    const cachedImagePath = path.join(cacheDir, `${id}.jpg`);
    if (fs.existsSync(cachedImagePath)) return res.sendFile(cachedImagePath);

    const googleDriveUrl = `https://drive.google.com/uc?export=view&id=${id}`;
    try {
        const response = await axios.get(googleDriveUrl, { responseType: 'stream' });
        const tempImagePath = path.join(cacheDir, `${id}-temp.jpg`);
        const writeStream = fs.createWriteStream(tempImagePath);

        response.data.pipe(writeStream);
        writeStream.on('finish', async () => {
            try {
                await sharp(tempImagePath).resize(300, 300).toFile(cachedImagePath);
                fs.unlinkSync(tempImagePath);
                res.sendFile(cachedImagePath);
            } catch (error) {
                res.status(500).json({ success: false, message: 'Error al procesar la imagen' });
            }
        });

        writeStream.on('error', () => {
            res.status(500).json({ success: false, message: 'Error al guardar la imagen' });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'No se pudo obtener la imagen' });
    }
});

function obtenerPalabraDelDia() {
    const foodWords = [
        "apple", "banana", "bread", "butter", "carrot", "cheese", "chicken", "chocolate", "coffee", "cookie",
        "corn", "cream", "cucumber", "egg", "fish", "flour", "garlic", "grape", "honey", "ice cream",
        "juice", "lemon", "lettuce", "meat", "milk", "mushroom", "noodles", "onion", "orange", "pasta",
        "peach", "pear", "pepper", "pizza", "potato", "rice", "salad", "salt", "sandwich", "soup",
        "spinach", "steak", "strawberry", "sugar", "tea", "tomato", "water", "watermelon", "yogurt", "zucchini"
    ];
    const fechaActual = new Date();
    const diaDelAño = Math.floor((fechaActual - new Date(fechaActual.getFullYear(), 0, 0)) / 86400000);
    return foodWords[diaDelAño % foodWords.length];
}

function formatearFecha(fecha) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(fecha);
}

app.post('/imprimir', async (req, res) => {
    const tempFile = path.join(__dirname, 'temp.txt');
    try {
        const { contenido } = req.body;
        if (!contenido || !contenido.nombre) {
            return res.status(400).json({ success: false, message: 'El campo "contenido.codigo" es obligatorio' });
        }

        const palabraDelDia = obtenerPalabraDelDia();
        const fechaFormateada = formatearFecha(new Date());

        const negritaON = '\x1B\x45\x01';
        const negritaOFF = '\x1B\x45\x00';
        const tamañoMedio = '\x1D\x21\x10';
        const tamañoNormal = '\x1D\x21\x00';
        const cortar = '\x1B\x69';
        const salto = '\n';

        const ticketText =
            tamañoMedio + negritaON + 'TICKET DE VALIDACION' + negritaOFF + salto +
            tamañoNormal +
            'NOMBRE: ' + contenido.nombre + salto +
            'FECHA: ' + fechaFormateada + salto + tamañoNormal + negritaON +
            'PALABRA DEL DIA: ' + palabraDelDia.toUpperCase() + salto +
            '--------------------------' +
            salto.repeat(4) + cortar;

        if (testMode) {
            console.log('MODO DE PRUEBA - Contenido que se enviaría:', ticketText);
            return res.json({
                success: true,
                message: 'Ticket procesado en modo de prueba (no impreso)',
                testMode: true,
                ticketText
            });
        }

        fs.writeFileSync(tempFile, ticketText, { encoding: 'ascii' });
        console.log('Archivo temporal creado:', tempFile);

        //const printCommand = `copy /b "${tempFile}" "\\\\localhost\\XP-80C"`;
        const printCommand = `print /D:"\\\\localhost\\XP-80" "${tempFile}"`;


        exec(printCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error al imprimir:', error);
                return res.status(500).json({ success: false, error: error.message });
            }

            console.log('Impresión exitosa:', stdout);
            res.json({ success: true, message: 'Ticket impreso correctamente' });

            setTimeout(() => {
                if (fs.existsSync(tempFile)) {
                    try {
                        fs.unlinkSync(tempFile);
                        console.log('Archivo temporal eliminado:', tempFile);
                    } catch (unlinkError) {
                        console.error('Error al eliminar archivo temporal:', unlinkError);
                    }
                }
            }, 2000);
        });
    } catch (error) {
        console.error('Error en /imprimir:', error);

        if (fs.existsSync(tempFile)) {
            try {
                fs.unlinkSync(tempFile);
            } catch (unlinkError) {
                console.error('Error limpiando archivo tras fallo:', unlinkError);
            }
        }

        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log(`Modo de prueba ${testMode ? 'activado' : 'desactivado'}`);
});
