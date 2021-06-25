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
const fs = require('fs');
const jsonServer = require('json-server')
const multer = require("multer");
const upload = multer()
const cors = require('cors');

const { NAMES } = require('./casuisticas')

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

app.post('/prospect/:id/enriquecimiento-tributario', (req, res) => {
  const prospectId = req.params && req.params.id
  let response = { status: 'ok', condicion_tributaria: 'Responsable Inscripto', categoria_condiciotn_tributaria: 'CAT 1' };
  let status = 201
  if (prospectId == '9') {
    response = { condicion_tributaria: 'Monotributista', categoria_condicion_tributaria: 'A' }
  }
  if (prospectId == '10') {
    response = { condicion_tributaria: 'Monotributista', categoria_condicion_tributaria: 'D' }
  }
  if (prospectId == '11') {
    response = { condicion_tributaria: null, categoria_condicion_tributaria: null }
  }
  setTimeout(() => {
    res.status(status).json(response)
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
  const NAME = id == 1 || id == 2
    ? NAMES.ID_1_2
    : id == 3 || id == 4
      ? NAMES.ID_3_4
      : id == 5 || id == 6
        ? NAMES.ID_5_6
        : id == 7 || id == 8
          ? NAMES.ID_7_8
          : 'Stefano'

  let prospect = {
    "nombre": NAME,
    "apellido": "Frontani",
    "email": "frontani@gmail.com",
    "cuit_solicitante": "20379044159",
    "telefono": 1141695824,
    "fecha_nacimiento": "1980-11-18",
    "genero": "M",
    "dni": 37904415,
    "codigo_actividad_afip": 22,
    "descripcion_actividad_afip": "Comerciante",
  }

  if (id == 2 || id == 4 || id == 6 || id == 8) {
    prospect = {
      ...prospect,
      cuit_pj: "30379044159",
      razon_social: "Global Logic",
    }
      
  }
  setTimeout(() => {
    res.status(200).json(prospect)
  }, 1500)
});


app.post('/prospect/:id/formulario-unico', (req, res) => {
  const { id } = req.params
  const { motivo_pep } = req.body
  if(motivo_pep !== 'solicitud existente') {
    setTimeout(() => {
      res.status(200).json({ 
        id
      })
    }, 1500)
  } else {
    setTimeout(() => {
      const {responseCode, response} = getErrorFormat(400, '000000021')
      res.status(responseCode).json(response)
    }, 500)
  }
  
});

app.post('/prospect/:id/aceptacion-terminos', (req, res) => {
  const { id } = req.params
  setTimeout(() => {
    res.status(200).json({ 
      id
    })
  }, 1500)
});


app.get('/prospect/:id/terminos-vigentes/:concept', (req, res) => {
  const { concept } = req.params;
  setTimeout(() => {
    if (concept === 'ALTAPRODUCTOONBPYME') {
      res.status(200).json({
        "id_terminos_condiciones": "T&C-ffab-4816-9070-979d3581c933",
        "contenido_terminos_condiciones": "<p><b>Declaraciones</b></p> <p><b>Términos de Contratación Electrónica de Productos y Servicios del Banco para su Cartera Comercial.</b></p> <p>La información contenida en el presente documento fue proporcionada por el Solicitante en el proceso de contratación electrónica del producto y/o servicio seleccionado en este documento y que fuera realizado a través de la siguiente web del Banco: https://onboardingnegocios.supervielle.com.ar/ (el “Proceso de Contratación Electrónica”). Asimismo, conocemos y aceptamos los “Términos de Contratación de Productos y Servicios del Banco para su Cartera Comercial”, cuyo texto ha sido elevado a Escritura Pública N° 143.Folio 427con fecha 28.de febrero de 2020 por ante el escribano Juan Molinari (Adscripto al Registro.24 de la Ciudad Autónoma de Buenos Aires) (los “Términos de Contratación”), que también hemos aceptado en el Proceso de Contratación Electrónica como así también los términos y condiciones incluidos en el presente documento. Asimismo, reconocemos que el envío de los Términos de Contratación Electrónica a la casilla de correo informada por el Solicitante en el Proceso de Contratación constituye la entrega de dichas condiciones.</p> <p>Entendemos y reconocemos que la elevación a escritura pública de los Términos de Contratación del Banco es al solo efecto de su protocolización, como medio de hacerlo fehaciente y dotarlo de publicidad, sin que ella implique que la presente contratación de apertura de una cuenta, o cada futura contratación de un producto o servicio del Banco que se haga bajo su marca, sea o deba ser efectuada por instrumento público, pudiendo por el contrario ser solicitada o modificada por instrumento privado.</p> <p>Declaraciones particulares relativas al Proceso de Contratación Electrónica: El Solicitante declara conocer y aceptar que (i) en caso de tratarse de una persona jurídíca, el firmante de la presente (a) es el Representante Legal de la misma, con facultades suficientes para este acto y (b) cuenta con todas las autorizaciones societarias internas que fueran necesarias para realizar la presente solicitud; (ii) la información y documentación aportada durante el Proceso de Contratación Electrónica (incluyendo sin limitación [Estatuto, Actas, Balance, DDJJ IVA, Constancia CUIT, Pago Monotributo o Autonomo, SUSS]) es verídica y, en el segundo caso, copia fiel del original (la “Documentación de Apertura”); (iii) considerando que la Documentación de Apertura fue remitida en soporte electrónico, resulta necesario que el Solicitante aporte dicha documentación original (y cualquier otra que pueda ser solicitada, todo ello a entera satisfacción del Banco, incluyendo, a modo enunciativo, la presentación de copia certificada del estatuto o contrato social con constancia de su inscripción por la autoridad de controlar societario competente en el Registro Público de la correspondiente jurisdicción) ante la sucursal del Banco en donde se haya requerido radicar la cuenta bancaria en soporte papel, todo ello en un plazo no mayor a los 30 días hábiles desde la realización de la presente solicitud; (iv) en caso de incumplimiento de lo establecido en las presentes declaraciones, el Banco se encontrará facultado a proceder al cierre de los productos contratados, sin necesidad de notificación previa; (v) durante el período en que el Solicitante no cumpla con lo requerido en el punto (iii) anterior, la cuenta bancaria que el Solicitante haya requerido sólo tendrá las siguientes funcionalidades: Ingresar a On line Banking, realizar transferencias (vi) optamos por el envío de los resúmenes de cuenta y de comunicaciones en forma electrónica; y (vii) se designará como administrador del Online Banking Empresas del Banco a la persona humana que suscribe la presente, con los datos proporcionados durante el Proceso de Contratación Electrónica.</p> <p><b>Constancia de entrega de información al Solicitante</b></p> <p>Declaramos que hemos sido informados en el Proceso de Contratación Electrónica sobre el detalle de las comisiones y gastos por servicios vinculados al funcionamiento de los productos solicitados, cualquier sea su concepto. Asimismo, reconocemos que el envío de las comisiones y gastos a la casilla de correo informada por el Solicitante en el Proceso de Contratación Electrónica constituye la entrega de dichas condiciones.</p> <p>Asimismo, declaramos que: a) en el caso de haber contratado una cuenta corriente bancaria, hemos sido informados que se encuentran a nuestra disposición en el Banco el texto completo de la Ley de Cheques y sus normas reglamentarias, las cuales también podrán ser consultados en www.bcra.gob.ar; y b) en el caso de haber contratado una cuenta corriente especial, hemos sido informados por el Banco que el texto de las normas reglamentarias de la cuenta corriente especial, así como sus eventuales actualizaciones, se encuentra a nuestra disposición en el Banco y que también podrán ser consultados en www.bcra.gob.ar; y c) en el caso de haber contratado una Caja de Ahorro, hemos sido informados por el Banco sobre la existencia de las normas sobre “Depósitos de Ahorro, Cuenta Sueldo y Especiales” emitidas por el BCRA, también disponibles en www.bcra.gob.ar. Asimismo, reconocemos que el envío de dichas normas a la casilla de correo informada por el Solicitante en el Proceso de Contratación constituye la entrega de dichas condiciones.</p> <p><b>Datos Personales</b></p> <p>Los datos personales aquí incluidos tienen el carácter de declaración jurada y son recogidos para ser tratados e incorporados en una base de datos, cuyo destinatario y titular es el Banco Supervielle S.A., con domicilio en Bartolomé Mitre 434, CABA. La presente solicitud en ningún caso requiere proporcionar datos sensibles. Cualquier falseamiento, error y/o inexactitud de la información respecto de lo cual el Banco tenga conocimiento, implicará la suspensión de dichos datos de la base de referencia.</p> <p>El Solicitante presta su consentimiento para que el Banco pueda utilizar, disponer y/o ceder la información que le ha suministrado, incluyendo la información financiera y crediticia, manteniendo la confidencialidad y seguridad de los datos, a sus afiliados, subsidiarias y/o terceros, con fines comerciales o estadísticos.</p> <p>Asimismo, el Solicitante manifiesta conocer que puede ejercer los derechos de acceso, rectificación y supresión de la información, conforme las normas de protección de datos personales.</p> <p>El titular de los datos personales consignados en la presente solicitud tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a 6 meses, salvo que acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. LA AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos de incumplimiento de las normas vigentes en materia de protección de datos personales.</p>",
        "concepto_terminos_condiciones": "TERMINOS&CONDICIONES ONB-PYM",
      })
    }
    if (concept === 'COMISIONESPYMES') {
      res.status(200).json({
        "id_terminos_condiciones": "A&C-992b-4b49-9074-9c8aa45df23b",
        "contenido_terminos_condiciones": '<p> "contenido_anexo_condiciones": <a href="https://content-us-7.content-cms.com/8ba19f21-9a97-4525-8886-f54d823a5cea/dxdam/ca/ca4b2568-9592-4efd-8e5e-519c7a585ed0/ANEXO%20DE%20COMISIONES%20Y%20GASTOS%20-%20CARTERA%20COMERCIAL%20v.1-6-2021.pdf?_ga=2.107704322.1611411448.1624457115-874448457.1590000432" target="_blank" rel="noopener noreferrer">anexos y comisiones</a>, "concepto_anexo_comisiones": "Anexos y comisiones" </p>',
        "concepto_terminos_condiciones": "Anexos y comisiones"
      })
    }
    if (concept === 'BIOONBPYMES') {
      res.status(200).json({
        "id_terminos_condiciones": "BIO-992b-4b49-9074-9c8aa45df23b",
        "contenido_terminos_condiciones": "<p><b>Declaraciones</b></p> <p><b>Términos de Contratación Electrónica de Productos y Servicios del Banco para su Cartera Comercial.</b></p> <p>La información contenida en el presente documento fue proporcionada por el Solicitante en el proceso de contratación electrónica del producto y/o servicio seleccionado en este documento y que fuera realizado a través de la siguiente web del Banco: https://onboardingnegocios.supervielle.com.ar/ (el “Proceso de Contratación Electrónica”). Asimismo, conocemos y aceptamos los “Términos de Contratación de Productos y Servicios del Banco para su Cartera Comercial”, cuyo texto ha sido elevado a Escritura Pública N° 143.Folio 427con fecha 28.de febrero de 2020 por ante el escribano Juan Molinari (Adscripto al Registro.24 de la Ciudad Autónoma de Buenos Aires) (los “Términos de Contratación”), que también hemos aceptado en el Proceso de Contratación Electrónica como así también los términos y condiciones incluidos en el presente documento. Asimismo, reconocemos que el envío de los Términos de Contratación Electrónica a la casilla de correo informada por el Solicitante en el Proceso de Contratación constituye la entrega de dichas condiciones.</p> <p>Entendemos y reconocemos que la elevación a escritura pública de los Términos de Contratación del Banco es al solo efecto de su protocolización, como medio de hacerlo fehaciente y dotarlo de publicidad, sin que ella implique que la presente contratación de apertura de una cuenta, o cada futura contratación de un producto o servicio del Banco que se haga bajo su marca, sea o deba ser efectuada por instrumento público, pudiendo por el contrario ser solicitada o modificada por instrumento privado.</p> <p>Declaraciones particulares relativas al Proceso de Contratación Electrónica: El Solicitante declara conocer y aceptar que (i) en caso de tratarse de una persona jurídíca, el firmante de la presente (a) es el Representante Legal de la misma, con facultades suficientes para este acto y (b) cuenta con todas las autorizaciones societarias internas que fueran necesarias para realizar la presente solicitud; (ii) la información y documentación aportada durante el Proceso de Contratación Electrónica (incluyendo sin limitación [Estatuto, Actas, Balance, DDJJ IVA, Constancia CUIT, Pago Monotributo o Autonomo, SUSS]) es verídica y, en el segundo caso, copia fiel del original (la “Documentación de Apertura”); (iii) considerando que la Documentación de Apertura fue remitida en soporte electrónico, resulta necesario que el Solicitante aporte dicha documentación original (y cualquier otra que pueda ser solicitada, todo ello a entera satisfacción del Banco, incluyendo, a modo enunciativo, la presentación de copia certificada del estatuto o contrato social con constancia de su inscripción por la autoridad de controlar societario competente en el Registro Público de la correspondiente jurisdicción) ante la sucursal del Banco en donde se haya requerido radicar la cuenta bancaria en soporte papel, todo ello en un plazo no mayor a los 30 días hábiles desde la realización de la presente solicitud; (iv) en caso de incumplimiento de lo establecido en las presentes declaraciones, el Banco se encontrará facultado a proceder al cierre de los productos contratados, sin necesidad de notificación previa; (v) durante el período en que el Solicitante no cumpla con lo requerido en el punto (iii) anterior, la cuenta bancaria que el Solicitante haya requerido sólo tendrá las siguientes funcionalidades: Ingresar a On line Banking, realizar transferencias (vi) optamos por el envío de los resúmenes de cuenta y de comunicaciones en forma electrónica; y (vii) se designará como administrador del Online Banking Empresas del Banco a la persona humana que suscribe la presente, con los datos proporcionados durante el Proceso de Contratación Electrónica.</p> <p><b>Constancia de entrega de información al Solicitante</b></p> <p>Declaramos que hemos sido informados en el Proceso de Contratación Electrónica sobre el detalle de las comisiones y gastos por servicios vinculados al funcionamiento de los productos solicitados, cualquier sea su concepto. Asimismo, reconocemos que el envío de las comisiones y gastos a la casilla de correo informada por el Solicitante en el Proceso de Contratación Electrónica constituye la entrega de dichas condiciones.</p> <p>Asimismo, declaramos que: a) en el caso de haber contratado una cuenta corriente bancaria, hemos sido informados que se encuentran a nuestra disposición en el Banco el texto completo de la Ley de Cheques y sus normas reglamentarias, las cuales también podrán ser consultados en www.bcra.gob.ar; y b) en el caso de haber contratado una cuenta corriente especial, hemos sido informados por el Banco que el texto de las normas reglamentarias de la cuenta corriente especial, así como sus eventuales actualizaciones, se encuentra a nuestra disposición en el Banco y que también podrán ser consultados en www.bcra.gob.ar; y c) en el caso de haber contratado una Caja de Ahorro, hemos sido informados por el Banco sobre la existencia de las normas sobre “Depósitos de Ahorro, Cuenta Sueldo y Especiales” emitidas por el BCRA, también disponibles en www.bcra.gob.ar. Asimismo, reconocemos que el envío de dichas normas a la casilla de correo informada por el Solicitante en el Proceso de Contratación constituye la entrega de dichas condiciones.</p> <p><b>Datos Personales</b></p> <p>Los datos personales aquí incluidos tienen el carácter de declaración jurada y son recogidos para ser tratados e incorporados en una base de datos, cuyo destinatario y titular es el Banco Supervielle S.A., con domicilio en Bartolomé Mitre 434, CABA. La presente solicitud en ningún caso requiere proporcionar datos sensibles. Cualquier falseamiento, error y/o inexactitud de la información respecto de lo cual el Banco tenga conocimiento, implicará la suspensión de dichos datos de la base de referencia.</p> <p>El Solicitante presta su consentimiento para que el Banco pueda utilizar, disponer y/o ceder la información que le ha suministrado, incluyendo la información financiera y crediticia, manteniendo la confidencialidad y seguridad de los datos, a sus afiliados, subsidiarias y/o terceros, con fines comerciales o estadísticos.</p> <p>Asimismo, el Solicitante manifiesta conocer que puede ejercer los derechos de acceso, rectificación y supresión de la información, conforme las normas de protección de datos personales.</p> <p>El titular de los datos personales consignados en la presente solicitud tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a 6 meses, salvo que acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. LA AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos de incumplimiento de las normas vigentes en materia de protección de datos personales.</p>",
        "concepto_terminos_condiciones": "Anexos y comisiones"
      })
    }
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