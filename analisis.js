/* =========================================================================
   analisis.js

   Evalúa la respuesta que escribe la persona contra la respuesta de
   referencia de la pregunta.

   QUÉ MIDE Y QUÉ NO MIDE
   ------------------------------------------------------------------------
   Sin conexión a internet, este evaluador NO puede saber si entendiste el
   concepto. Solo puede medir cuánto contenido compartís con la respuesta de
   referencia. Eso significa que:

     - responder con las palabras correctas puntúa alto aunque no entiendas;
     - explicar con tus propias palabras y sin compartir vocabulario puntúa
       bajo aunque lo entiendas perfectamente.

   Por eso el resultado se llama "cobertura de contenido" y no "corrección",
   y por eso el detalle te muestra qué conceptos te faltaron, que es la parte
   realmente accionable.

   Si necesitás una evaluación semántica de verdad, el botón opcional del
   final usa la API de OpenAI. Eso sí juzga el Understanding.

   CÓMO FUNCIONA
   ------------------------------------------------------------------------
   1. Se separa el texto en términos y se descartan las palabras vacías.
   2. Cada término recibe un peso TF-IDF calculado sobre las 144 respuestas de
      referencia. Un término que aparece en todas las respuestas pesa poco; uno
      que solo aparece en esta respuesta pesa mucho.
   3. Los términos de mayor peso son los conceptos clave de esa respuesta.
   4. Se mide cuántos de esos conceptos aparecen en lo que escribiste, y se
      compara el vector completo con similitud del coseno.
   ========================================================================= */


/* =========================================================================
   ORDEN DE CARGA
   -------------------------------------------------------------------------
   Este archivo NO depende de que el banco de preguntas esté cargado: construye
   su índice de forma diferida, la primera vez que se necesita. Así se puede
   cargar en cualquier orden respecto a entrevistas.js.
   ========================================================================= */


/* =========================================================================
   1. LISTA DE PALABRAS VACÍAS
   -------------------------------------------------------------------------
   Se necesitan las de los dos idiomas, porque se puede responder en cualquiera
   de los dos.
   ========================================================================= */

const VACIAS_ES = new Set([
  "el","la","los","las","un","una","unos","unas","lo","al","del","y","o","u","e","ni","pero",
  "que","qué","de","a","en","con","por","para","sin","sobre","entre","hasta","desde","hacia",
  "se","su","sus","tu","tus","mi","mis","nuestro","nuestra","es","son","era","eran","fue","fueron",
  "ser","estar","está","están","estaba","fueron","hay","ha","han","he","haver","hace",
  "como","cómo","cuando","cuándo","donde","dónde","porque","porqué","si","sí","no","also",
  "muy","más","menos","tanto","toda","todo","todos","todas","otro","otra","otros","otras",
  "este","esta","estos","estas","ese","esa","esos","esas","aquel","aquella",
  "y","o","u","ni","sino","porque","aunque","mientras","cuando","como","si","bien",
  "puede","pueden","poder","debe","deben","deber","debería","tiene","tienen","tener",
  "hace","hacen","hay","han","ver","ve","ves","dar","da","dan","saber","sabe",
  "cosa","cosas","caso","casos","vez","veces","parte","partes","caso","forma","formas",
  "ejemplo","ejemplos","cosa","ahi","allí","aqui","aquí","asi","así","también",
  "cada","cualquier","algún","alguno","mismo","misma","tan","solo","sólo","muy",
  "cual","cuál","quien","quién","cuyo","cuyo","donde","dónde","entonces",
  "le","les","lo","me","te","se","nos","os","ya","aun","aún","solo","sólo"
]);

const VACIAS_EN = new Set([
  "the","a","an","and","or","but","if","then","else","of","to","in","on","at","by","for",
  "with","without","from","into","onto","over","under","between","through","during",
  "it","its","they","them","their","he","she","his","her","we","us","our","you","your","i","me","my",
  "is","are","was","were","be","been","being","am","do","does","did","done",
  "has","have","had","having","will","would","shall","should","can","could","may","might","must",
  "this","that","these","those","there","here","where","when","while","which","who","whom","whose",
  "not","no","yes","so","than","then","too","very","just","also","only","even","still","already",
  "some","any","each","every","all","both","other","another","same","such",
  "thing","things","case","cases","way","ways","time","times","part","parts","example","examples",
  "because","since","although","however","about","into","out","up","down","off","again","once",
  "get","got","make","made","take","took","use","used","using","one","two"
]);

const VACIAS = new Set([...VACIAS_ES, ...VACIAS_EN]);


/* =========================================================================
   2. NORMALIZACIÓN DEL TEXTO
   -------------------------------------------------------------------------
   Convierte el texto en una lista de términos comparables:

     - pasa a minúsculas
     - le saca las tildes, para que "configuración" y "configuracion" sean
       la misma palabra
     - separa los términos
     - descarta las palabras vacías
     - reduce cada término a una forma aproximada quitando sufijos, para que
       "verifico", "verificar" y "verificación" se reconozcan entre sí
   ========================================================================= */

/* Sufijos que se quitan para comparar formas verbales o nominales.
   El orden importa: se prueban los más largos primero. */
const SUFIJOS = [
  "amiento","imiento","aciones","acion","aciones","idad","idades",
  "mente","ciones","cion","ciones","cion",
  "ando","iendo","ados","idas","ados","ido",
  "ar","er","ir","an","en","as","es","os",
  "cion","cion","sion",
];

/* Quita sufijos, pero nunca deja una palabra demasiado corta,
   porque "ir" o "no" se volverían inútiles al recortar. */
function raiz(palabra) {
  if (palabra.length <= 4) return palabra;
  for (const sufijo of SUFIJOS) {
    if (palabra.endsWith(sufijo) && palabra.length - sufijo.length >= 4) {
      return palabra.slice(0, palabra.length - sufijo.length);
    }
  }
  return palabra;
}

/* Convierte el texto en términos normalizados. */
function terminos(texto) {
  const limpio = String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // saca las tildes
    .replace(/[^a-zñ0-9\s]/g, " ")  // deja solo letras, números y espacios

  return limpio
    .split(/\s+/)
    .filter(Boolean)
    .map(raiz)
    .filter(p => p.length >= 3 && !VACIAS.has(p));
}

/* Divide el texto en pares de términos seguidos, sin palabras vacías en el medio.
   Sirve para reconocer frases como "indice unico" y no solo palabras sueltas. */
function pares(texto) {
  const crudos = String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zñ0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const utiles = crudos.filter(p => p.length >= 3 && !VACIAS.has(p)).map(raiz);
  const salida = [];
  for (let i = 0; i < utiles.length - 1; i++) {
    salida.push(utiles[i] + " " + utiles[i + 1]);
  }
  return salida;
}

/* Igual que terminos(), pero además recuerda con qué forma original apareció
   cada término: "pasarela" produce el interno "pasarel", y sin este mapa la
   persona vería "pasarel" en el informe, que no es una palabra.

   Cuando varias formas comparten el mismo interno se guarda la primera. */
function formasVisibles(texto) {
  const mapa = {};

  /* Se parte el texto por lo que no es letra ni número, así cada palabra
     entra con su forma original: tildes y mayúsculas intactas. La clave es
     la misma forma interna que produce raiz(), que es la que usa el
     comparador, de modo que las claves coinciden exactamente con las de
     terminos() aunque aquí no se repita su normalización completa. */
  for (const palabra of String(texto).split(/[^\p{L}\p{N}]+/u)) {
    if (!palabra) continue;
    const interno = raiz(palabra.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""));
    if (interno.length < 3 || VACIAS.has(interno)) continue;
    if (!Object.prototype.hasOwnProperty.call(mapa, interno)) {
      mapa[interno] = palabra;
    }
  }
  return mapa;
}


/* =========================================================================
   3. ÍNDICE DE CONCEPTOS
   -------------------------------------------------------------------------
   Se construye una sola vez con las 144 respuestas de referencia.

   Para cada término se cuenta en cuántas respuestas aparece. Un término que
   está en casi todas no dice nada de esta pregunta en particular; uno que
   está en una sola es probablemente el concepto central de esa respuesta.
   ========================================================================= */

const IndiceConceptos = (() => {

  /* El índice se construye la primera vez que se usa, no al cargar el
     archivo. Así este módulo no exige que BANCO ya exista.

     Hay un índice por idioma. Es necesario: los conceptos que se buscan en tu
     respuesta tienen que ser los de la referencia del idioma en el que estás
     practicando. Con un único índice en español, al evaluar en inglés no se
     encontraría ningún concepto y la cobertura siempreería cero. */
  const caches = {};

  /* Cualquier valor que no sea "en" se trata como español, que es el
     comportamiento anterior y el que espera el resto del código. */
  function normalizarIdioma(idioma) {
    return idioma === "en" ? "en" : "es";
  }

  function construir(idioma) {
    const lang = normalizarIdioma(idioma);
    if (caches[lang]) return caches[lang];

    /* Para cada pregunta: sus términos y sus pares, ya normalizados,
       tomados de la respuesta del idioma que se está evaluando. */
    const porPregunta = BANCO.map(p => {
      const texto = (p[lang] && p[lang].a) || p.es.a;
      return {
        terminos: terminos(texto),
        pares:    pares(texto),
        visibles: formasVisibles(texto)
      };
    });

    /* Cuenta en cuántas respuestas aparece cada término, dentro del idioma. */
    const documentos = {};
    for (const item of porPregunta) {
      for (const t of new Set(item.terminos)) {
        documentos[t] = (documentos[t] || 0) + 1;
      }
    }

    caches[lang] = { porPregunta, documentos, totalDocumentos: porPregunta.length };
    return caches[lang];
  }

  /* Devuelve los conceptos más distintivos de una respuesta, ordenados por
     peso. Son los de la referencia en el idioma indicado. */
  function conceptosDe(indice, cantidad, idioma) {
    const { porPregunta, documentos, totalDocumentos } = construir(idioma);
    const item = porPregunta[indice];
    if (!item) return [];

    /* Peso de un término: cuántas veces aparece, dividido por su rareza.
       Un término común aporta poco, uno raro aporta mucho. */
    const pesos = new Map();
    for (const t of item.terminos) {
      const frecuencia = documentos[t] || 1;
      const rareza = Math.log(totalDocumentos / frecuencia) + 1;
      pesos.set(t, (pesos.get(t) || 0) + rareza);
    }

    /* Las frases valen más que las palabras sueltas, porque "indice unico"
       significa algo que "indice" y "unico" por separado no dicen. */
    for (const par of item.pares) {
      pesos.set(par, (pesos.get(par) || 0) + 2.5);
    }

    return [...pesos.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, cantidad)
      .map(([termino]) => termino);
  }

  /* Vector de pesos de un texto cualquiera, para comparar por coseno. La
     rareza se mide contra las referencias del mismo idioma. */
  function vectorDe(texto, idioma) {
    const { documentos, totalDocumentos } = construir(idioma);
    const vector = new Map();
    for (const t of terminos(texto)) {
      const rareza = Math.log(totalDocumentos / (documentos[t] || totalDocumentos)) + 1;
      vector.set(t, (vector.get(t) || 0) + rareza);
    }
    return vector;
  }

  /* Términos normalizados de una respuesta de referencia. */
  function terminosDe(indice, idioma) {
    return construir(idioma).porPregunta[indice];
  }

  /* Traduce un término interno a la forma en que aparece escrito en la
     respuesta de referencia. Si no lo encuentra, lo devuelve como estaba:
     es preferible mostrar un término raro antes que una palabra inventada.

     Un par de términos ("indice unico") se traduce parte por parte. */
  function formaDe(indice, interno, idioma) {
    const item = construir(idioma).porPregunta[indice];
    if (!item) return interno;
    if (interno.includes(" ")) {
      return interno
        .split(" ")
        .map(t => item.visibles[t] || t)
        .join(" ");
    }
    return item.visibles[interno] || interno;
  }

  return { conceptosDe, vectorDe, terminosDe, formaDe, construir };
})();


/* =========================================================================
   4. SIMILITUD DEL COSENO
   -------------------------------------------------------------------------
   Compara dos vectores de pesos y devuelve un valor entre 0 y 1.
   0 = no comparten nada. 1 = idénticos.
   ========================================================================= */

function similitudCoseno(a, b) {
  if (a.size === 0 || b.size === 0) return 0;

  let producto = 0;
  let normaA = 0;
  let normaB = 0;

  for (const valor of a.values()) normaA += valor * valor;
  for (const valor of b.values()) normaB += valor * valor;

  /* Solo se recorren en común: el resto aporta 0 al producto. */
  const [corto, largo] = a.size <= b.size ? [a, b] : [b, a];
  for (const [clave, valor] of corto) {
    if (largo.has(clave)) producto += valor * largo.get(clave);
  }

  if (normaA === 0 || normaB === 0) return 0;
  return producto / (Math.sqrt(normaA) * Math.sqrt(normaB));
}


/* =========================================================================
   5. EVALUACIÓN LOCAL
   -------------------------------------------------------------------------
   Devuelve un informe con:
     - cobertura:   cuántos conceptos clave mencionaste
     - contenido:   qué conceptos clave te faltaron
     - similitud:   qué tan parecidas son las respuestas en conjunto
     - equilibrio:  penalties por respuesta vacía, muy corta o muy larga
     - nivel:       una de cuatro franjas
     - detalle:     las cosas que vale la pena mirar
   ========================================================================= */

function evaluarLocal(respuestaUsuario, indicePregunta, idioma) {
  const pregunta = BANCO[indicePregunta];
  if (!pregunta) return null;

  /* Si no se indica idioma, se evalúa contra la referencia en español. */
  const lang = (idioma === "en" && pregunta.en) ? "en" : "es";
  idioma = lang;

  const referencia = pregunta[idioma].a;
  const mio = String(respuestaUsuario || "").trim();

  /* --- Respuesta vacía --- */
  if (!mio) {
    return {
      vacia: true,
      nivel: "sin-intentar",
      titulo: "No escribiste nada",
      cobertura: 0, similitud: 0, coberturaDecimal: 0, nota: 0,
      hallados: [], faltantes: [], sobrantes: [],
      longitud: "corta", palabras: 0,
      detalle: [
        "Escribí tu respuesta y volvé a comprobar. Podés mirar la de referencia antes si querés, pero conviene intentarlo primero."
      ]
    };
  }

  /* --- Conceptos clave de la respuesta de referencia, en el idioma que
         se está practicando --- */
  const conceptos = IndiceConceptos.conceptosDe(indicePregunta, 14, idioma);

  /* --- Qué conceptos aparecen en lo que escribiste --- */
  const mioTerminos = new Set(terminos(mio));
  const mioPares = new Set(pares(mio));

  const hallados = [];
  const faltantes = [];
  for (const concepto of conceptos) {
    if (concepto.includes(" ")) {
      (mioPares.has(concepto) ? hallados : faltantes).push(concepto);
    } else {
      (mioTerminos.has(concepto) ? hallados : faltantes).push(concepto);
    }
  }

  /* --- Términos que usaste y no están en la respuesta de referencia --- */
  const refTerms = IndiceConceptos.terminosDe(indicePregunta, idioma);
  const referenciaTerminos = new Set(refTerms.terminos);
  const referenciaPares = new Set(refTerms.pares);
  const sobrantes = [...mioTerminos]
    .filter(t => t.length > 4 && !referenciaTerminos.has(t))
    .filter(t => ![...mioPares].some(p => p.endsWith(" " + t)))
    .slice(0, 8);

  /* --- De término interno a palabra, para mostrarlo en el informe ---
     Los conceptos salen de la referencia; los sobrantes salen de lo que
     escribiste vos. Cada lista se traduce con su propio mapa. */
  const forma = t => IndiceConceptos.formaDe(indicePregunta, t, idioma);
  const mioVisibles = formasVisibles(mio);

  const cobertura = conceptos.length ? hallados.length / conceptos.length : 0;

  /* --- Similitud global entre las dos respuestas --- */
  const similitud = similitudCoseno(
    IndiceConceptos.vectorDe(mio, idioma),
    IndiceConceptos.vectorDe(referencia, idioma)
  );

  /* --- Penalización por longitud --- */
  const palabras = mio.split(/\s+/).filter(Boolean).length;
  let longitud = "adecuada";
  const detalles = [];

  if (palabras < 25) {
    longitud = "corta";
    detalles.push(
      "Tu respuesta tiene " + palabras + " palabras. Con menos de 25 es difícil que cubras los puntos principales de una pregunta de entrevista."
    );
  } else if (palabras > 400) {
    longitud = "muy larga";
    detalles.push(
      "Tu respuesta tiene " + palabras + " palabras. En una entrevista eso son varios minutos: conviene recortar a lo esencial."
    );
  }

  /* --- Nota final --- */
  /* La cobertura pesa más que la similitud porque la cobertura sí identifica
     conceptos concretos. La longitud solo resta, nunca suma. */
  const base = cobertura * 70 + similitud * 30;
  const penalizacion = (longitud === "corta" ? 8 : longitud === "muy larga" ? 6 : 0);
  const nota = Math.max(0, Math.min(100, Math.round(base - penalizacion)));

  let nivel, titulo;
  if (nota >= 70)      { nivel = "solida";   titulo = "Cobertura sólida"; }
  else if (nota >= 45) { nivel = "parcial";  titulo = "Cobertura parcial"; }
  else if (nota >= 20) { nivel = "baja";     titulo = "Cobertura baja"; }
  else                 { nivel = "muy-baja"; titulo = "Cobertura muy baja"; }

  if (faltantes.length) {
    detalles.push(
      "Te faltaron " + faltantes.length + " de los " + conceptos.length +
      " conceptos que aparecen en la respuesta de referencia. Esos son los puntos que un entrevistador esperaría escuchar."
    );
  }
  if (sobrantes.length > 5) {
    detalles.push(
      "Usaste términos que no están en la referencia. Puede ser que estésivan bien, o que te habías ido del tema. Revisá si la pregunta pedía otra cosa."
    );
  }
  if (cobertura >= 0.7 && palabras >= 40) {
    detalles.push("Mencionaste la mayoría de los conceptos importantes y con suficiente detalle.");
  }

  return {
    vacia: false,
    nivel, titulo, nota,
    cobertura: Math.round(cobertura * 100),
    similitud: Math.round(similitud * 100),
    coberturaDecimal: cobertura,
    hallados: hallados.map(forma),
    faltantes: faltantes.map(forma),
    sobrantes: sobrantes.map(t => mioVisibles[t] || t),
    longitud, palabras,
    detalle: detalles
  };
}


/* =========================================================================
   6. EVALUACIÓN CON IA (OPCIONAL)
   -------------------------------------------------------------------------
   Esta parte sí juzga la comprensión, no solo el vocabulario: le pregunta
   a un modelo si la respuesta explica lo mismo que la de referencia.

   Requiere una clave propia de OpenAI. La clave se usa solo en esa
   conversación y no se guarda en el disco ni en el navegador.

   Antes de habilitarla, conviene saber que la respuesta que escribas se
   envía a OpenAI. Con datos de una entrevista de trabajo eso suele estar
   bien, pero es tu decisión.
   ========================================================================= */

const EvaluadorIA = {

  endpoint: "https://api.openai.com/v1/responses",

  /* Arma el pedido: la pregunta, tu respuesta y la de referencia. */
  construirCuerpo(mia, referencia, idioma) {
    const enCastellano = idioma === "es";

    const instrucciones = enCastellano
      ? [
          "Sos un evaluador de entrevistas técnicas.",
          "Recibís una pregunta, la respuesta de la persona y la respuesta de referencia.",
          "Evaluá si la respuesta de la persona EXPLICA LO MISMO que la de referencia.",
          "Importante: no busques palabras literales. Una respuesta puede estar",
          "correcta y usar otro vocabulario, y eso vale igual.",
          "También marcá como error cualquier afirmación que la referencia no dice",
          "o que la contradiga, aunque suene convincente.",
          "Devolví únicamente JSON con esta forma:",
          '{',
          '  "conceptosCubiertos": ["..."],',
          '  "conceptosFaltantes": ["..."],',
          '  "errores": ["..."],',
          '  "claridad": 0,',
          '  "profundidad": 0,',
          '  "ajuste": 0,',
          '  "resumen": "..."',
          '}',
          "Donde claridad, profundidad y ajuste van de 0 a 100."
        ].join(" ")
      : [
          "You are a technical interview evaluator.",
          "You receive a question, the candidate's answer, and a reference answer.",
          "Evaluate whether the candidate EXPLAINS THE SAME THING as the reference.",
          "Important: do not look for literal words. An answer can be correct and use",
          "different vocabulary, and that still counts.",
          "Also flag as an error any claim the reference does not make, or that",
          "contradicts it, even if it sounds convincing.",
          "Reply with JSON only, in this shape:",
          '{',
          '  "coveredConcepts": ["..."],',
          '  "missingConcepts": ["..."],',
          '  "errors": ["..."],',
          '  "clarity": 0,',
          '  "depth": 0,',
          '  "fit": 0,',
          '  "summary": "..."',
          '}',
          "Where clarity, depth and fit run from 0 to 100."
        ].join(" ");

    return {
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: [{ type: "input_text", text: instrucciones }] },
        {
          role: "user",
          content: [{
            type: "input_text",
            text: enCastellano
              ? `PREGUNTA:\n${pregunta}\n\nRESPUESTA DE LA PERSONA:\n${mia}\n\nRESPUESTA DE REFERENCIA:\n${referencia}`
              : `QUESTION:\n${pregunta}\n\nCANDIDATE ANSWER:\n${mia}\n\nREFERENCE ANSWER:\n${referencia}`
          }]
        }
      ]
    };
  },

  /* Hace el pedido. Devuelve un resultado con la misma forma que el local,
     más los campos propios de la evaluación con IA. */
  async evaluar(mia, indicePregunta, idioma, clave) {
    const pregunta = BANCO[indicePregunta];
    if (!pregunta) return null;
    if (!clave || !clave.trim()) throw new Error("Falta la clave.");

    const cuerpo = this.construirCuerpo(
      mia, pregunta[idioma].a, idioma, pregunta[idioma].q
    );

    const respuesta = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + clave.trim()
      },
      body: JSON.stringify(cuerpo)
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      throw new Error("La API respondió " + respuesta.status + ": " + detalle.slice(0, 200));
    }

    const datos = await respuesta.json();
    const salida = datos.output_text || (datos.output && datos.output[0]
      && datos.output[0].content && datos.output[0].content[0] && datos.output[0].content[0].text);

    if (!salida) throw new Error("La API no devolvió texto.");

    /* Se limpia por si el modelo agregó el bloque ```json */
    const limpio = salida.replace(/```json?/g, "").trim();
    return JSON.parse(limpio);
  }
};
