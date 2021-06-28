const NAMES = {
  // CASOS PROSPECT
  LEAD_CLIENTE: 'Charly',
  PROSPECT_NO_ENRIQUECIDO: 'Bruno',
  SOLICITUD_EXISTENTE: 'Alejandro',
  ACTIVIDAD_PLD: 'Diego',

  // CASOS CALI
  ID_1_2: 'Stephano',            // CALI EXITOSA - POR CALI EXPRESS (DEFAULT)
  ID_3_4: 'Santiago',            // CALI EXITOSA - POR FACTURACION
  ID_5_6: 'Lucas',               // CALI NO EXITOSA - CLIENTE POTABLE
  ID_7_8: 'Tomas',               // CALI NO EXITOSA - CLIENTE NO POTABLE

  CONDICION_TRIBUTARIA: {
    // CASO MONOTRIBUTO > C
    MONOTRIBUTISTA: 'Esteban',
    // CASO RESPONSABLE INSCRIPTO
    RESPONABLE_INSCRIPTO: 'Esteve',
    // CASO CONDICION NULL
    NULL: 'Steve',
    // CASO SALIDA DEL FLUJO - ERROR DE BFF
    EXIT_FLOW: 'Steven'
  }
}

module.exports = { NAMES }