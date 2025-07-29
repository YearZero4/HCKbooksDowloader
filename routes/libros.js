const router = require('express').Router();
const JSZip = require('jszip');
const axios = require('axios');
const { links } = require('../links');

router.get('/links', (req, res) => {
 res.json({ links });
});

router.post('/download', async (req, res) => {

 try {
  const { selectedLinks } = req.body;
  
  if (!selectedLinks || selectedLinks.length === 0) {
   return res.status(400).json({ error: 'No se seleccionaron archivos' });
  }

  const zip = new JSZip();
  
  await Promise.all(selectedLinks.map(async (link) => {
   try {
    const response = await axios.get(link, {
     responseType: 'arraybuffer',
     maxContentLength: Infinity,
     maxBodyLength: Infinity
    });
    
    const filename = link.split('/').pop();
    zip.file(filename, response.data, { binary: true });
   } catch (error) {
    console.error(`Error al descargar ${link}:`, error.message);
   }
  }));

  const zipData = await zip.generateAsync({
   type: 'nodebuffer',
   compression: 'DEFLATE',
   compressionOptions: { level: 6 }
  });

  res.set('Content-Type', 'application/zip');
  res.set('Content-Disposition', 'attachment; filename=pack-libros.zip');
  res.send(zipData);

 } catch (error) {
  console.error('Error al generar el ZIP:', error);
  res.status(500).json({ error: 'Error al generar el archivo ZIP' });
 }
});

module.exports = router;