const blobToBase64 = require('blob-to-base64')
const axios = require("axios");
const errorsCode = require('./errorsCode.json')
const FileReader = require('filereader')

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
    case 'aaa' :
      status = 409
      json = getErrorFormat(status, '000000004').response
    break
    case 'bbb' :
      status = 400
      json = getErrorFormat(status, '000000004').response
    break
    case 'ccc' :
      status = 500
      json = getErrorFormat(status, '000000004').response
    break
    case 'ddd' :
      status = 400
      json = getErrorFormat(status, '000000001').response
    break
    case 'eee' :
      status = 400
      json = getErrorFormat(status, '000000006').response
    break
    case 'fff' :
      status = 400
      json = getErrorFormat(status, '000000012').response
    break
    case 'Ronaldo' :
      status = 400
      json = getErrorFormat(status, '000000019').response
    break
    case 'Stefano' :
      status = isPj ? 400 : 200
      json = isPj ? getErrorFormat(status, '000000018').response : {status: "ok", id: 2}
    break
    case 'Santiago' :
      json = {status: "ok", id: isPj ? 4 : 3}
    break
    case 'Alberto' :
      json = {status: "ok", id: isPj ? 5 : 6}
    break
    default:
      json = {status: "ok", id: isPj ? 2 : 1}
  }
  return { status, json }
}

const getOffer = (id, totalBilling) => {
  return {
    "tarjeta_credito": {
      "monto": Math.random() * 10000.40
    },
    "acuerdo_cc": {
      "monto": Math.random() * 130000.33
    },
    "descuento_cheque": {
      "monto": Math.random() * 200000
    },
    "prestamos_personales": {
      "monto": Math.random() * 400000.33
    },
    "oferta_exitosa": (id < 3 && id < 5),
    "cliente_potable": (id < 5)
  }
}

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