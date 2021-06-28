const blobToBase64 = require('blob-to-base64')
const axios = require("axios");
const errorsCode = require('./errorsCode.json')
const FileReader = require('filereader')

const { NAMES } = require('./casuisticas')
const { CONDICION_TRIBUTARIA } = require('./domains')

const getErrorByCode = (code, internalErrorCode) => {
  let errorResponse = {}
  errorsCode.errors.forEach((error) => {
    if (error.code === code && error.internalErrorCode === internalErrorCode) {
      errorResponse = error
    }
  })
  return errorResponse
}

const getErrorFormat = (code, internalErrorCode) => {
  const errorByCode= getErrorByCode(code, internalErrorCode)
  return {
    responseCode : errorByCode.code, 
    response : {
      codigo: errorByCode.code,
      errores: [
        {
          titulo: errorByCode.title,
          detalle: errorByCode.message,
          codigo: errorByCode.internalErrorCode
        }
      ]
    }
  }
}

const getProspectResponse = ({ nombre }, isPj) => {
  let json = {}
  let status = 200
  switch( nombre ) {
    case NAMES.LEAD_CLIENTE:
      // LEAD CLIENTE DEL BANCO
      status = 400
      json = getErrorFormat(status, '000000001').response
      break
    case 'Jorge' :
      // DATOS INCORRECTOS
      status = 400
      json = getErrorFormat(status, '000000004').response
      break
    case NAMES.PROSPECT_NO_ENRIQUECIDO:
      // LEAD NO ENRIQUECIDO
      status = 400
      json = getErrorFormat(status, '000000006').response
      break
    case NAMES.SOLICITUD_EXISTENTE :
      // SOLICITUD EN ONBPYMES YA EXISTE 
      status = 400
      json = getErrorFormat(status, '000000012').response
      break
    case NAMES.ACTIVIDAD_PLD :
      // Actividad PLD
      status = 400
      json = getErrorFormat(status, '000000019').response
      break
    case 'aaa' :
      status = 409
      json = getErrorFormat(status, '000000004').response
      break
    case 'ccc' :
      status = 500
      json = getErrorFormat(status, '000000004').response
      break
    case 'Stefano' :
      status = isPj ? 400 : 200
      json = isPj ? getErrorFormat(status, '000000018').response : {status: "ok", id: 2}
      break

    // CALIFICACION / OFERTA CREDITICIA
    case NAMES.ID_3_4 :
      json = {status: "ok", id: !isPj ? 3 : 4}
      break
    case NAMES.ID_5_6 :
      json = {status: "ok", id: !isPj ? 5 : 6}
      break
    case NAMES.ID_7_8 :
      json = {status: "ok", id: !isPj ? 7 : 8}
      break

    // CONDICION TRIBUTARIA
    // CASO DE MONOTRBUTO A B C - id 9 solo PF
    case NAMES.CONDICION_TRIBUTARIA.MONOTRIBUTISTA :
      json = { status: 'ok', id: 9, condicion_tributaria: CONDICION_TRIBUTARIA.MONOTRIBUTISTA }
      break
    // CASO DE MONOTRBUTO > C - id 10 solo PF
    case NAMES.CONDICION_TRIBUTARIA.RESPONSABLE_INSCRIPTO :
      json = { status: 'ok', id: 10, condicion_tributaria: CONDICION_TRIBUTARIA.RESPONSABLE_INSCRIPTO }
      break
    // CASO DE CONDICION Y CATEGORIA NULL - 11 solo PF
    case NAMES.CONDICION_TRIBUTARIA.NULL :
      json = { status: 'ok', id: 11, condicion_tributaria: null }
      break
    default:
      json = {
        status: "ok",
        id: !isPj ? 1 : 2,
        condicion_tributaria: !isPj ? CONDICION_TRIBUTARIA.RESPONSABLE_INSCRIPTO : null
      }
  }
  return {
    status,
    json: {
      ...json,
      id_persona: 1000
    }
  }
}

const getOffer = (id, totalBilling) => {
  return {
    "tarjeta_credito": {
      // "monto": Math.random() * 10000.40
      "monto": (id == 3 || id == 4)
        ? 18000
        : 1800000
    },
    "acuerdo_cc": {
      // "monto": Math.random() * 130000.33
      "monto": (id == 3 || id == 4)
        ? 30000
        : 300000
    },
    "descuento_cheque": {
      // "monto": Math.random() * 200000
      "monto": (id == 3 || id == 4)
        ? 36000
        : 3600000
    },
    "prestamos_personales": {
      // "monto": Math.random() * 400000.33
      "monto": (id == 3 || id == 4)
        ? 200000
        : 2000000
    },
    "oferta_exitosa": !(id == 5 || id == 6 || id == 7 || id == 8),
    "cliente_potable": (id == 5 || id == 6) || !(id == 7 || id == 8),
  }
}

// ofetta exitosa: false
// cliente potable : true o false

/*const converBlobBase64 = async (blob) => blobToBase64(blob, function (error, base64) {
  if (!error) {
    return base64
  } else {
    return null
  }
})*/

const converBlobBase64 = async (blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
};


const setSelphiImage = async (dataToSend) => {
  return axios.post('https://mock-onboarding-pymes2.cart274.vercel.app/db/selphi_images', dataToSend)
    .then(response => {
      return true
    })
    .catch(error => {
      return false
    })
}


module.exports = {getErrorByCode, getErrorFormat, getProspectResponse, getOffer, converBlobBase64, setSelphiImage}