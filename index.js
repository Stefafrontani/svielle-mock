const express = require("express");
const { Request, Response } = require("express");
const http = require('http');
const app= express();
const { getErrorFormat, getProspectResponse, getOffer, converBlobBase64, setSelphiImage } = require('./utils.js')
const sucursales = require('./sucursales.json')
const sucursalesCercanas = require('./sucursalesCercanas.json')
const states = require('./states.json')
const localidades = require('./localidades.json')
const db = require('./db.json')
var fs = require('fs');
const jsonServer = require('json-server')
const multer = require("multer");
var upload = multer()
var cors = require('cors')
app.use(cors())

fs.writeFileSync('/tmp/db.json', JSON.stringify(db));

app.use(express.json({ limit: '5MB' }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, multipart/form-data"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});
app.use(express.static('views'));
app.use('/db', jsonServer.router('/tmp/db.json'));
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.engine('.pug', require('pug').__express);

app.get('/', (req, res) => {
  res.status(200).json({status: "ok"});
});

app.post('/prospect', (req, res) => {
  const response = getProspectResponse(req.body, false)
  setTimeout(() => {
    res.status(response.status).json(response.json)
  }, 300)
});

app.post('/prospect/juridica', (req, res) => {
  const response = getProspectResponse(req.body, true)
  setTimeout(() => {
    res.status(response.status).json(response.json)
  }, 300)
});


app.get('/sucursales', (req, res) => {
  let getSucursales = []
  sucursales.redes.forEach(({id, nombre, numero, direccion, zona, latitud, longitud}) => {
    getSucursales.push({id, nombre, numero, direccion, zona, latitud, longitud})
  });
  res.status(200).json(getSucursales)
});

app.get('/sucursales-cercanas', (req, res) => {
  res.status(200).json(sucursalesCercanas.redes)
});
0000000000
app.post('/token', (req, res) => {
  const { destinatario = {}} = req.body
  const valorMedio = destinatario.valor_medio
  if(valorMedio === 'xxx@xxx.xxx' || valorMedio === '111122223333') {
    const {responseCode, response} = getErrorFormat(500, '000000003')
    setTimeout(() => {
      res.status(responseCode).json(response)
    }, 500)
  } else {
    setTimeout(() => {
      res.status(200).json({
        "estado": "PENDIENTE_ENVIO"
      })
    }, 500)
  }
});

app.post('/token/validacion', (req, res) => {
  const {cuit, token} = req.body
  if(token === '111222') {
    setTimeout(() => {
      res.status(200).json({status: "ok"})
    }, 500)
  } else {
    const {responseCode, response} = getErrorFormat(400, '000000005')
    setTimeout(() => {
      res.status(responseCode).json(response)
    }, 500)
  }
});

app.post('/prospect/:id/oferta', (req, res) => {
  const { id } = req.params
  setTimeout(() => {
    res.status(200).json(getOffer(id))
  }, 500)
});

app.post('/prospect/:id/juridica/oferta', (req, res) => {
  const { id, facturacion_total: totalBilling } = req.params
  setTimeout(() => {
    res.status(200).json(getOffer(id, totalBilling))
  }, 500)
});

app.post('/prospect/:id/aceptacion-oferta', (req, res) => {
  const { id } = req.params
  if(id !== '12345') {
    setTimeout(() => {
      res.status(200).json({ id: id })
    }, 500)
  } else {
    setTimeout(() => {
      const {responseCode, response} = getErrorFormat(500, '000000003')
      res.status(responseCode).json(response)
    }, 500)
  }
});

app.get('/show_selphi_images', function (req, res) {
  let dataFile = fs.readFileSync('/tmp/db.json');
  let dbJSON = JSON.parse(dataFile);
  let selphiImages = dbJSON.selphi_images
  res.render('selphi_images', { title: 'Hesddy', message: 'Hello thsdddere!', selphiImages});
});

const cpUpload = upload.fields([{ name: 'archivo', maxCount: 1 }])
app.post('/prospect/:id/documento-digital', cpUpload, async (req, res) => {
  const originalname = req.files.archivo[0].originalname
  if (originalname !== 'fail.jpg') {
    setTimeout(() => {
      res.status(200).json({file: JSON.stringify(req.files)})
    }, 2000)
  } else {
    setTimeout(() => {
      const {responseCode, response} = getErrorFormat(500, '000000003')
      res.status(responseCode).json(response)
    }, 500)
  }
});

app.get('/provincias', (req, res) => {
  res.status(200).json(states.states)
});

app.get('/provincias/:idprovincia/localidades', (req, res) => {
  const { idprovincia } = req.params
  const distritFrom = localidades.localidades.filter((localidad) => localidad.provincia.toString() === idprovincia)
  res.status(200).json(distritFrom)
});

app.post('/prospect/:id/domicilio', (req, res) => {
  const { id } = req.params
  const { codigo_postal: zipCode = {}} = req.body
  if(zipCode !== '12345') {
    setTimeout(() => {
      res.status(200).json({ id: id })
    }, 500)
  } else {
    setTimeout(() => {
      const {responseCode, response} = getErrorFormat(500, '0000000014')
      res.status(responseCode).json(response)
    }, 500)
  }
});

const bioUpload = upload.fields([
  { name: 'imagen_dni_frente', maxCount: 1 },
  { name: 'imagen_dni_reverso', maxCount: 1 },
  { name: 'mejor_imagen_facial', maxCount: 1 },
  { name: 'mejor_imagen_recortada', maxCount: 1 }
])
app.post('/prospect/:id/verificacion-biometrica', bioUpload, async (req, res) => {
  const originalname1 = req.files.imagen_dni_frente[0].originalname
  const originalname2 = req.files.imagen_dni_reverso[0].originalname
  const originalname3 = req.files.mejor_imagen_facial[0].originalname
  const originalname4 = req.files.mejor_imagen_recortada[0].originalname
  const extendedImage  = JSON.stringify(req.body.plantilla_facial_extendida)
  const bufferDniFrente = Buffer.from(req.files.imagen_dni_frente[0].buffer, 'base64')
  fs.writeFileSync('/tmp/dniFrente.jpg', bufferDniFrente)
  const bufferDniReverso = Buffer.from(req.files.imagen_dni_reverso[0].buffer, 'base64')
  fs.writeFileSync('/tmp/dniReverso.jpg', bufferDniReverso)
  const bufferMejorFacial = Buffer.from(req.files.mejor_imagen_facial[0].buffer, 'base64')
  fs.writeFileSync('/tmp/bufferMejorFacial.jpg', bufferMejorFacial)
  const bufferImagenRecortada = Buffer.from(req.files.mejor_imagen_recortada[0].buffer, 'base64')
  fs.writeFileSync('/tmp/bufferImagenRecortada.jpg', bufferImagenRecortada)
  fs.writeFileSync('/tmp/plantillaFacial.txt', extendedImage)

  const base64DNIFront = `data:image/jpg;base64,${bufferDniFrente.toString('base64')}`
  const base64DNIReverse = `data:image/jpg;base64,${bufferDniReverso.toString('base64')}`
  const base64Facial = `data:image/jpg;base64,${bufferMejorFacial.toString('base64')}`
  const base64FacialR = `data:image/jpg;base64,${bufferImagenRecortada.toString('base64')}`
  const dataToSend = {
    base64DNIFront, base64DNIReverse,
    base64Facial, base64FacialR,
    extendedImage
  }
  let dataFile = fs.readFileSync('/tmp/db.json');
  let dbJSON = JSON.parse(dataFile);
  let selphiImages = dbJSON.selphi_images
  selphiImages.push(dataToSend)
  fs.writeFileSync('/tmp/db.json', JSON.stringify(dbJSON))
  
  setTimeout(() => {
    res.status(202).json({ 
      "id_tramite": 10454,
    })
  }, 500)
});

app.get('/prospect/:id/verificacion-identidad/:idTramite', (req, res) => {
  const { id, idTramite } = req.params
  setTimeout(() => {
    res.status(200).json({ 
      id, idTramite
    })
  }, 1500)
});

app.post('/encuesta/nivel-satisfaccion', (req, res) => {
  const { nivel_satisfaccion: score, id_prospect: prospectId } = req.body
  setTimeout(() => {
    res.status(200).json({ 
      prospectId, score
    })
  }, 500)
});

app.post('/prospect/:id/datos-economicos', (req, res) => {
  const { id } = req.params
  const { facturacion, cantidad_empleados } = req.body
  setTimeout(() => {
    res.status(200).json({ 
      id, facturacion, cantidad_empleados
    })
  }, 500)
});

app.post('/prospect/:id/juridica/datos-economicos', (req, res) => {
  const { id } = req.params
  const { resultado_operativo, patrimonio_neto, facturacion_total, accionistas } = req.body
  setTimeout(() => {
    res.status(200).json({ 
      id, resultado_operativo, patrimonio_neto, facturacion_total, accionistas
    })
  }, 500)
});

app.post('/notificacion/documentacion', (req, res) => {
  const { id_prospect: id } = req.body
  setTimeout(() => {
    res.status(200).json({ 
      id
    })
  }, 1500)
});

app.get('/config/params', (req, res) => {
  setTimeout(() => {
    res.status(200).json({
      "cfg_allow_calificacionpj": "true"
  })
  }, 1500)
});


app.get('/prospect/:id/formulario-unico', (req, res) => {
  const { id } = req.params 
  setTimeout(() => {
    res.status(200).json({
      "nombre": "Alberto Ernesto",
      "apellido": "Crajevich",
      "email": "crajevich@gmail.com",
      "telefono": 112323456,
      "cuit_solicitante": "20379044159",
      "cuit_pj":"20379044159",
      "razon_social": "Global Logic",
      "fecha_nacimiento": "1980-11-18",
      "genero": "M",
      "dni": 37904415,
      "codigo_actividad_afip": 22,
      "descripcion_actividad_afip": "Comerciante",
  })
  }, 1500)
});


app.post('/prospect/:id/formulario-unico', (req, res) => {
  const { id } = req.params 
  setTimeout(() => {
    res.status(200).json({ 
      id
    })
  }, 1500)
});

app.post('/prospect/:id/aceptacion-terminos', (req, res) => {
  const { id } = req.params
  setTimeout(() => {
    res.status(200).json({ 
      id
    })
  }, 1500)
});

app.get('/prospect/:id/terminos-vigentes', (req, res) => {
  setTimeout(() => {
    res.status(200).json({  
      "id_termino_condiciones": "77c88d2e-ffab-4816-9070-979d3581c933",
      "contenido_terminos_condiciones": "<html>contenido de los anexo</html>",
      "concepto_terminos_condiciones": "TERMINOS&CONDICIONES ONB-PYM",
      "id_anexo_comisiones": "777f9509-992b-4b49-9074-9c8aa45df23b",
      "contenido_anexo_condiciones": '<a href="https://content-us-7.content-cms.com/8ba19f21-9a97-4525-8886-f54d823a5cea/dxdam/06/06e494ac-3cdc-4881-bed1-e15d8ea58945/ANEXO%20DE%20COMISIONES%20Y%20GASTOS%20-%20CARTERA%20COMERCIAL%20-%2030-04-20.pdf?_ga=2.168490401.1837405704.1609341928-1043366479.1606830263" target="_blank" rel="noopener noreferrer" >anexos y comisiones</a>',
      "concepto_anexo_comisiones": "Anexos y comisiones"
  })
  }, 1500)
});

/*const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};*/

let httpPort = 5000;
app.set("port", httpPort);
let httpServer = http.createServer(app);

//listen on provided ports
httpServer.listen(httpPort, (data) => {
  console.log(`Listening on port ${httpPort}`)
});