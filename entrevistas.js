/* =========================================================================
   entrevistas.js

   Organizado en cuatro partes:

     1. BANCO        - las preguntas, con la traducción al español y al inglés.
     2. DICCIONARIOS - los textos de la interfaz en ambos idiomas.
     3. ESTADO       - qué se está mostrando y qué ya se vio.
     4. APP          - los controles de la interfaz.

   La idea central: una sola pregunta, dos idiomas. No hay dos bancos
   paralelos, así que nunca pueden desincronizarse.
   ========================================================================= */


/* =========================================================================
   1. BANCO DE PREGUNTAS
   -------------------------------------------------------------------------
   Cada pregunta tiene:
     - area:      la temática principal (ver NOMBRES.area)
     - areaTema:  el sub-tema, que se muestra como etiqueta
     - nivel:     basico | medio | avanzado
     - es / en:   el texto de la pregunta y de la respuesta en cada idioma
   ========================================================================= */

const BANCO = [

  /* ---------------------------------------------------------------------
     ARQUITECTURA — decisiones de diseño
     --------------------------------------------------------------------- */
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "medio",
    es: {
      q: "Elegiste un motor embebido para un sistema que después quizá necesite escalar. ¿Cómo se justifica esa decisión?",
      a: "Decisión deliberada para validar la lógica de negocio y las invariantes antes de elegir motor. No es que el motor embebido no sirva, es que no puedo afirmar una capacidad que no medí. Lo dejo explícito en la configuración: el despliegue por defecto es de una sola instancia, y el modo multiproceso está bloqueado hasta que exista un adaptador de persistencia verificado. Si el volumen lo justifica, se cambia el motor; lo que no hago es prometer escalabilidad sin haberla probado con carga real del entorno destino."
    },
    en: {
      q: "You picked an embedded engine for a system that may later need to scale. How do you justify that decision?",
      a: "A deliberate decision to validate the business logic and the invariants before choosing an engine. It is not that the embedded engine does not work, it is that I cannot claim a capability I have not measured. I make it explicit in configuration: the default deployment is single-instance, and multi-process mode is blocked until a verified persistence adapter exists. If the volume justifies it, I change the engine; what I do not do is promise scalability without having tested it under real load on the target environment."
    }
  },
  {
    area: "ddd",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Qué es un Bounded Context y cómo lo aplicaste?",
      a: "Un límite donde un modelo tiene un significado propio. Un límite donde un modelo tiene su propio vocabulario y sus propias invariantes. Lo aplico por lo que protege, no por lo que contiene: el ejemplo es un despachador que coordina autorizaciones y está marcado en el código como *trabajador técnico*, explícitamente NO es un Domain Service ni un Aggregate Root, porque gobierna la persistencia de solicitudes y no reglas de negocio. Esa distinción es la que evita que un servicio técnico crezca hasta convertirse en el centro de todo."
    },
    en: {
      q: "What is a Bounded Context and how did you apply it?",
      a: "A boundary within which a model has its own meaning. A boundary where a model has its own vocabulary and its own invariants. I apply it for what it protects, not for what it contains: the example is a dispatcher that coordinates authorisations and is marked in the code as a *technical worker*, explicitly NOT a Domain Service nor an Aggregate Root, because it governs the persistence of requests and not business rules. That distinction is what stops a technical service from growing until it becomes the centre of everything."
    }
  },
  {
    area: "ddd",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Cómo determinaste dónde termina un contexto?",
      a: "Por las invariantes que cada uno protege. El contexto fiscal protege que no se emita un comprobante sin autorización. El de venta protege que exista una venta. El de cobro protege la imputación. Cuando dos contextos necesitan el mismo dato, ese dato se duplica o se traduce en el borde, en lugar de compartir un modelo común."
    },
    en: {
      q: "How did you decide where a context ends?",
      a: "By the invariants each one protects. The fiscal context protects that no receipt is issued without authorisation. Sales protects that a sale exists. Collections protects the allocation. When two contexts need the same data, that data is duplicated or translated at the boundary, rather than sharing one common model."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "medio",
    es: {
      q: "¿Qué es un outbox transaccional?",
      a: "Escribir el evento de salida en la misma transacción que el cambio de estado de negocio, en lugar de publicarlo después. Así se escriben ambos o ninguno: nunca queda un pago aprobado sin su evento, ni un evento de un pago que se revirtió. Es el patrón que uso en integraciones con proveedores externos, como pasarelas de pago y servicios fiscales."
    },
    en: {
      q: "What is a transactional outbox?",
      a: "Writing the outbound event in the same transaction as the business state change, instead of publishing it afterwards. That way both are written or neither is: a payment is never approved without its event, and there is never an event for a payment that was rolled back. It is the pattern I use for integrations with external providers, such as payment gateways and tax services."
    }
  },
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Por qué una condición de salida a producción la implementarías como código y no como checklist?",
      a: "Porque un checklist se puede completar mintiendo o por error: no deja rastro de quién decidió qué, ni se puede verificar automáticamente. Si una capacidad no está implementada, la condición va en código con el valor fijado en `false` y sin bandera ni configuración que la habilite. While tanto no exista el adaptador real, es estructuralmente imposible que el sistema se declare listo. El revisor no tiene que confiar en mí ni hacer un interrogatorio: lo lee en el código y corre el test que lo comprueba."
    },
    en: {
      q: "Why would you implement a production release condition as code rather than as a checklist?",
      a: "Because a checklist can be completed dishonestly or by mistake: it leaves no record of who decided what, and it cannot be verified automatically. If a capability is not implemented, the condition goes in code with the value fixed at `false` and no flag or setting that enables it. Until the real adapter exists, it is structurally impossible for the system to declare itself ready. The reviewer does not have to trust me or interview me: they read it in the code and run the test that checks it."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "basico",
    es: {
      q: "Contame el recorrido completo de un sistema de trazabilidad, y por qué esa trazabilidad invierte el sentido de la lectura.",
      a: "Recepción de material, producción, lote, liberación, venta, cobro, comprobante fiscal, entrega y traslado. Y desde la venta se puede trazar inversamente hasta la recepción de origen. Eso último es lo que define al problema: no es un registro, es responder de dónde salió una cosa concreta. Esa inversión de la lectura es la que define el modelo: cada paso deja una traza al anterior, y esa traza es un dato de negocio, no un log."
    },
    en: {
      q: "Walk me through the complete flow of a traceability system, and why that traceability inverts the direction of reading.",
      a: "Material reception, production, batch, release, sale, collection, fiscal receipt, delivery and transfer. And from the sale you can trace backwards to the original reception. That last part is what defines the problem: it is not a log, it is answering where a specific thing came from. That inversion in the reading is what shapes the model: each step leaves a trace to the previous one, and that trace is business data, not a log."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "arquitectura",
    nivel: "medio",
    es: {
      q: "¿Qué es un lease y por qué lo implementaste?",
      a: "Una concesión temporal con token y vencimiento. Un proceso toma el trabajo, le asigna un `lease_token` y un `lease_until`. Si ese proceso muere, otro puede reclamarlo cuando el lease expira. Lo clave es que el token se compara: si la respuesta llega tarde, de un proceso que ya perdió el lease, se descarta y se registra como `STALE_RESPONSE`. Nunca se aplica sobre trabajo que ya no le pertenece."
    },
    en: {
      q: "What is a lease and why did you implement one?",
      a: "A time-limited claim with a token and an expiry. A process takes the job and sets a `lease_token` and a `lease_until`. If that process dies, another can claim it once the lease expires. The key point is that the token is compared: if a response arrives late, from a process that already lost the lease, it is discarded and logged as `STALE_RESPONSE`. It is never applied to work that no longer belongs to it."
    }
  },
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "Un sistema con una sola instancia tiene una capacidad acotada. ¿Qué necesitás para escalarlo a varias?",
      a: "No se puede hacerlo sin trabajo previo, y conviene que el sistema lo diga en vez de fingir que escala. Habría que escribir un adaptador de persistencia nuevo, migrar los datos y probar concurrencia real entre procesos, que es la parte que casi siempre falta: los bloqueos que en un proceso se resuelven solos, entre dos procesos se convierten en carreras. El despliegue por defecto queda en una sola instancia, y el modo multiproceso bloqueado hasta que exista ese adaptador. Es la respuesta honesta."
    },
    en: {
      q: "A single-instance system has a bounded capacity. What would you need in order to scale it to several?",
      a: "It cannot be done without prior work, and the system should say so rather than pretend it scales. It would require writing a new persistence adapter, migrating the data, and testing real concurrency between processes, which is the part almost always missing: what locks resolve on their own in one process become races across two. The default deployment stays at one instance, and multi-process mode stays blocked until that adapter exists. That is the honest answer."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "medio",
    es: {
      q: "¿Por qué el gateway HTTPS está escrito a mano?",
      a: "Para que la API escuche solo en loopback y la superficie expuesta sea mínima y auditable. El gateway aplica CSP restrictiva, HSTS, límite de 64 KB, filtra cabeceras hop-by-hop y verifica path traversal. Todo está en 150 líneas que se pueden leer completas, en lugar de depender de un framework que no controlo."
    },
    en: {
      q: "Why is the HTTPS gateway hand-written?",
      a: "So that the API only listens on loopback and the exposed surface is minimal and auditable. The gateway applies a strict CSP, HSTS, a 64 KB body limit, filters hop-by-hop headers and verifies path traversal. It is all in 150 lines that can be read end to end, instead of depending on a framework I do not control."
    }
  },
  {
    area: "it-general",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Qué es fallar cerrado y dónde lo aplicaste?",
      a: "Ante la duda, rechazar en lugar de permitir. En la configuración en tiempo de ejecución rechazo motores y topologías no soportados aunque sean la opción obvia. En la recuperación de contraseñas, si no se puede preparar el envío, borro el código de la base. En el despacho fiscal, si algo no cuadra, va a revisión manual. En ningún caso el sistema sigue adelante con un dato que no puede verificar."
    },
    en: {
      q: "What is failing closed, and where did you apply it?",
      a: "When in doubt, reject rather than allow. In the runtime configuration I reject unsupported engines and topologies even when they are the obvious choice. In password recovery, if the delivery cannot be prepared, I delete the code from the database. In the fiscal dispatch, if something does not add up it goes to manual review. The system never proceeds with data it cannot verify."
    }
  },

  /* ---------------------------------------------------------------------
     ARQUITECTURA
     --------------------------------------------------------------------- */
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "¿Qué pasa si el proceso muere a mitad de una autorización fiscal?",
      a: "Es el caso que más me importaba. Hay tres estados: pendiente, en vuelo e incierto. Cuando un proceso toma el trabajo toma un lease; si muere, otro lo retoma cuando expira. Y lo clave: un resultado desconocido NUNCA se reenvía como solicitud nueva, porque eso causaría comprobantes duplicados. Se convierte en una consulta. Después de varios intentos va a revisión humana."
    },
    en: {
      q: "What happens if the process dies halfway through a fiscal authorisation?",
      a: "That is the case I cared about most. There are three states: pending, in flight and uncertain. When a process takes the job it takes a lease; if it dies, another one picks it up when the lease expires. And the key point: an unknown result is NEVER resent as a new request, because that would produce duplicate receipts. It becomes a lookup instead. After several attempts it goes to human review."
    }
  },
  {
    area: "ddd",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "¿Cómo garantizás no emitir un comprobante sobre datos que cambiaron?",
      a: "Antes de autorizar, reconstruyo el comprobante desde toda la historia de intentos persistida y lo reidrato como el agregado. Si el estado que reconstruyo no coincide con el que está en la base, no emito: mando a revisión. Además comparo el hash de la solicitud antes de invocar al proveedor y otra vez después de recibir la respuesta, así detecto alteración de contenido."
    },
    en: {
      q: "How do you guarantee you will not issue a receipt based on data that changed?",
      a: "Before authorising, I rebuild the receipt from the entire persisted attempt history and rehydrate it as the aggregate. If the state I rebuild does not match what is in the database, I do not issue: I send it to review. I also compare the request hash before calling the provider and again after receiving the response, which detects content tampering."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "¿Qué es idempotencia y cómo la implementaste?",
      a: "Que la misma operación repetida produce el mismo efecto. En el despacho fiscal la clave de idempotencia se compara con el hash de la solicitud: si ya existe un trabajo con la misma clave pero distinto contenido, es un conflicto y se rechaza, no se sobrescribe. En el alta de socios hay una restricción única en la base. Y el commit usa versión optimista: si el UPDATE no cambia exactamente una fila, la transacción revienta."
    },
    en: {
      q: "What is idempotency and how did you implement it?",
      a: "Repeating the same operation produces the same effect. In the fiscal dispatch the idempotency key is compared against the request hash: if a job with the same key but different content already exists, that is a conflict and it is rejected, not overwritten. Member creation relies on a unique constraint in the database. And the commit uses optimistic versioning: if the UPDATE does not change exactly one row, the transaction blows up."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "medio",
    es: {
      q: "¿Por qué la llamada a ARCA tiene que salir de la transacción?",
      a: "Porque una caída o demora de red dentro de la transacción retiene el bloqueo de escritura y deja una coordinación comercial difícil de recuperar. La solución es persistir la solicitud, confirmar la transacción local, invocar ARCA fuera de ella, y reanudar de forma idempotente. Esa es exactamente la razón por la que existen el outbox y el lease."
    },
    en: {
      q: "Why does the ARCA call have to happen outside the transaction?",
      a: "Because a network drop or delay inside the transaction holds the write lock and leaves a commercial reconciliation that is hard to recover. The solution is to persist the request, commit the local transaction, call ARCA outside it, and resume idempotently. That is precisely why the outbox and the lease exist."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "basico",
    es: {
      q: "¿Qué es un CAE?",
      a: "El Código de Autorización Electrónico que ARCA asigna a un comprobante. En el MVP es una simulación con referencias `HOMO-*`; el sistema se niega a emitirlas en modo producción. El adaptador real WSAA/WSFE todavía no existe, y el propio sistema bloquea el paso hasta que exista."
    },
    en: {
      q: "What is a CAE?",
      a: "The Electronic Authorisation Code that ARCA assigns to a receipt. In the MVP it is a simulation with `HOMO-*` references; the system refuses to issue them in production mode. The real WSAA/WSFE adapter does not exist yet, and the system itself blocks that step until it does."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "Explicame la rectificación prospectiva.",
      a: "Si un lote se libera y después aparece un problema de calidad, la revocación se registra como un hecho nuevo. La venta conserva el estado de liberación que era válido cuando se confirmó, y la revocación queda registrada aparte con su responsable y su motivo. La historia no se reescribe. Eso es lo que permite responder qué sabía el sistema cuándo, y quién decidió qué."
    },
    en: {
      q: "Explain prospective rectification.",
      a: "If a batch is released and later a quality problem appears, the revocation is recorded as a new fact. The sale keeps the release state that was valid when it was confirmed, and the revocation is recorded separately with its responsible person and its reason. History is not rewritten. That is what lets you answer what the system knew when, and who decided what."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "¿Cómo evito el doble cobro fiscal?",
      a: "El estado incierto nunca vuelve a envío: el primer intento genera un registro persistido y los siguientes son consultas. Si llegaran dos respuestas distintas, el hash de la solicitud no coincidiría con lo registrado y el caso va a revisión manual con el motivo de conflicto de respuesta del proveedor."
    },
    en: {
      q: "How do you prevent double fiscal charging?",
      a: "The uncertain state never goes back to send: the first attempt creates a persisted record and the following ones are lookups. If two different responses arrived, the request hash would not match what was recorded and the case goes to manual review with a provider response conflict reason."
    }
  },
  {
    area: "lenguajes",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "¿Cómo manejas la concurrencia en la autorización fiscal?",
      a: "Con tres capas. Una: `FOR UPDATE` al leer el comprobante dentro de la transacción. Dos: versión optimista en el UPDATE final, que exige que se afecte exactamente una fila. Tres: el lease con token, que garantiza que solo el proceso dueño aplica la respuesta. Las tres juntas hacen que una respuesta tardía de un proceso que ya perdió el lease se descarte."
    },
    en: {
      q: "How do you handle concurrency in fiscal authorisation?",
      a: "With three layers. One: `FOR UPDATE` when reading the receipt inside the transaction. Two: optimistic versioning on the final UPDATE, which requires exactly one row to be affected. Three: the token lease, which guarantees only the owning process applies the response. Together, a late response from a process that already lost the lease is discarded."
    }
  },
  {
    area: "lenguajes",
    areaTema: "fiscal",
    nivel: "medio",
    es: {
      q: "¿Qué es `skip locked`?",
      a: "Una cláusula de PostgreSQL que salta las filas bloqueadas por otra transacción en lugar de esperar. En la emisión de facturas sirve para que varios procesos de fondo repartan trabajo sin pisarse. También se puede usar un lease con token, que es más explícito porque te dice quién tomó qué tarea."
    },
    en: {
      q: "What is `skip locked`?",
      a: "A PostgreSQL clause that skips rows locked by another transaction instead of waiting. In invoice issuance it lets several background processes share the work without colliding. You can alternatively use a token lease, which is more explicit because it tells you who took which task."
    }
  },

  /* ---------------------------------------------------------------------
     CONCURRENCIA
     --------------------------------------------------------------------- */
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "avanzado",
    es: {
      q: "¿Qué es una condición de carrera y dónde la has visto?",
      a: "Es cuando dos operaciones concurrentes leen el mismo estado, deciden y escriben, y el resultado depende del orden. El caso clásico: dos operadores autorizan el mismo comprobante a la vez. Lo resuelvo con `FOR UPDATE` para serializar, versión optimista como segunda barrera, y el lease como tercera."
    },
    en: {
      q: "What is a race condition, and where have you seen one?",
      a: "It is when two concurrent operations read the same state, decide, and write, and the result depends on the ordering. The classic case: two operators authorising the same receipt at the same time. I handle it with `FOR UPDATE` to serialise, optimistic versioning as a second barrier, and the lease as a third."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "medio",
    es: {
      q: "¿Qué es `BEGIN IMMEDIATE`?",
      a: "Una variante de transacción de SQLite que toma el bloqueo de escritura al empezar, no en la primera escritura. Reduce la ventana en la que dos transacciones pueden leer el mismo estado antes de escribir. Con `busy_timeout` configurado, SQLite espera en lugar de fallar si hay contención."
    },
    en: {
      q: "What is `BEGIN IMMEDIATE`?",
      a: "A variant of the SQLite transaction that takes the write lock at the start, not at the first write. It narrows the window in which two transactions can read the same state before writing. With `busy_timeout` configured, SQLite waits rather than failing when there is contention."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "avanzado",
    es: {
      q: "Explicame versionado optimista contra pesimista.",
      a: "El pesimista bloquea la fila al leer, serializando todo. El optimista no bloquea: leés, decidís, y al escribir verificás que la versión no haya cambiado. Uso el optimista en autorización fiscal porque el conflicto es raro y el bloqueo largo bloquearía las lecturas. Y hay una barrera extra: el lease, que es pesimista pero solo sobre el trabajo en vuelo."
    },
    en: {
      q: "Explain optimistic versus pessimistic versioning.",
      a: "Pessimistic locks the row on read, serialising everything. Optimistic does not lock: you read, you decide, and when writing you verify the version has not changed. I use optimistic for fiscal authorisation because the conflict is rare and a long lock would block reads. And there is one extra barrier: the lease, which is pessimistic but only over in-flight work."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "basico",
    es: {
      q: "¿Qué es WAL?",
      a: "Write-Ahead Logging. En lugar de escribir directo al archivo principal, SQLite escribe primero a un log de anexado y periódicamente vuelca al archivo. Permite que lectores y escritor trabajen concurrentemente sin bloquearse. Por eso el archivo de log puede pesar 3 MB con la base en 4 KB."
    },
    en: {
      q: "What is WAL?",
      a: "Write-Ahead Logging. Instead of writing straight to the main file, SQLite writes first to an append log and periodically checkpoints it into the file. It lets readers and the writer work concurrently without blocking. That is why the log file can weigh 3 MB with the database at 4 KB."
    }
  },

  /* ---------------------------------------------------------------------
     CIBERSEGURIDAD
     --------------------------------------------------------------------- */
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "medio",
    es: {
      q: "¿Cómo guardás las contraseñas?",
      a: "Con scrypt, salt de 16 bytes por usuario, y comparación con `timingSafeEqual`. Además hay un hash señuelo: cuando el usuario no existe, verifico igualmente contra un hash ficticio, para que el tiempo de respuesta sea indistinguible. Fuera del modo local la contraseña mínima sube de 8 a 12 caracteres y la de demostración se bloquea explícitamente."
    },
    en: {
      q: "How do you store passwords?",
      a: "With scrypt, a 16-byte salt per user, and comparison using `timingSafeEqual`. There is also a decoy hash: when the user does not exist, I still verify against a fake hash so the response time is indistinguishable. Outside local mode the minimum password length goes from 8 to 12 characters, and the demo password is explicitly blocked."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Qué es la enumeración de usuarios y cómo la evitas?",
      a: "Es usar el mensaje o el tiempo de respuesta para averiguar qué cuentas existen. Evito las dos cosas: el mensaje es idéntico tanto si el usuario no existe, está inactivo, está bloqueado o la contraseña falla. Y el tiempo se iguala verificando siempre contra un hash, real o señuelo. La única excepción es el bloqueo temporal, que devuelve su propio mensaje: es un trade-off deliberado, acepto que un atacante sepa que esa cuenta está bloqueada."
    },
    en: {
      q: "What is user enumeration, and how do you prevent it?",
      a: "Using the message or the response time to find out which accounts exist. I prevent both: the message is identical whether the user does not exist, is inactive, is locked, or the password is wrong. And the time is equalised by always verifying against a hash, real or decoy. The only exception is the temporary lock, which returns its own message: that is a deliberate trade-off, I accept that an attacker learns that account is locked."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Por qué el token de sesión se hashea en la base?",
      a: "Porque si alguien lee la base no debe poder autenticarse. El token que viaja al cliente es aleatorio de 32 bytes; en la base solo queda su SHA-256. Como el hash no es reversible, no se puede reconstruir el token y por lo tanto no se puede suplantar la sesión. El cierre de sesión marca la fila como revocada, de modo que la revocación es inmediata y no espera a que expire."
    },
    en: {
      q: "Why is the session token hashed in the database?",
      a: "Because if someone reads the database they should not be able to authenticate. The token sent to the client is 32 random bytes; only its SHA-256 stays in the database. Since the hash is not reversible, nobody can reconstruct the token and therefore cannot impersonate the session. Logging out marks the row as revoked, so revocation is immediate and does not wait for expiry."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "medio",
    es: {
      q: "¿Qué es el secreto de configuración inicial?",
      a: "El primer administrador se crea sin credenciales previas, lo que lo dejaría abierto para cualquiera que llegara primero. En preproducción y producción se exige un secreto externo de al menos 32 caracteres, comparado con `timingSafeEqual`, y en producción tiene que venir de un archivo, no de una variable de entorno. Después de crear el administrador se desactiva el alta."
    },
    en: {
      q: "What is the initial setup secret?",
      a: "The first administrator is created without prior credentials, which would leave it open to anyone who arrived first. In preproduction and production an external secret of at least 32 characters is required, compared with `timingSafeEqual`, and in production it must come from a file rather than an environment variable. After the administrator is created, sign-up is disabled."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Qué es path traversal y cómo lo previenes?",
      a: "Es pedir una ruta con `../` para leer archivos fuera del directorio servido. En el gateway resuelvo la ruta contra la raíz, calculo la ruta relativa, y si empieza con `..` o es absoluta, devuelvo 403. También rechazo el byte nulo. Verifiqué además que los archivos servidos están dentro del directorio raíz, incluso con nombres poco comunes."
    },
    en: {
      q: "What is path traversal and how do you prevent it?",
      a: "Requesting a path containing `../` to read files outside the served directory. In the gateway I resolve the path against the root, compute the relative path, and if it starts with `..` or is absolute I return 403. I also reject the null byte. I verified that the files served stay inside the root directory, even with unusual names."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "medio",
    es: {
      q: "¿Por qué limitas los intentos de acceso en la base y no en memoria?",
      a: "Porque en memoria se reinicia con el proceso. Si un atacante espera un reinicio del servidor, el contador vuelve a cero. Persistiéndolo, el límite sobrevive. También hay un ámbito por origen y otro por usuario, con ventanas de 15 minutos, y el borrado de registros antiguos evita que la tabla crezca sin límite."
    },
    en: {
      q: "Why do you track login attempts in the database rather than in memory?",
      a: "Because in memory it resets with the process. If an attacker waits for a server restart, the counter goes back to zero. Persisting it means the limit survives. There is also one scope per origin and one per user, with 15-minute windows, and deleting old records stops the table growing without bound."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "basico",
    es: {
      q: "¿Qué cabeceras defensivas aplicás?",
      a: "Content-Security-Policy restrictiva, HSTS, `frame-ancestors 'none'`, `Permissions-Policy` que desactiva cámara, micrófono y geolocalización, `Referrer-Policy: no-referrer` y `X-Content-Type-Options: nosniff`. En la API la política es más restrictiva todavía: `default-src 'none'`, porque no sirve recursos, solo JSON."
    },
    en: {
      q: "Which defensive headers do you set?",
      a: "A strict Content-Security-Policy, HSTS, `frame-ancestors 'none'`, a `Permissions-Policy` disabling camera, microphone and geolocation, `Referrer-Policy: no-referrer` and `X-Content-Type-Options: nosniff`. On the API the policy is even stricter: `default-src 'none'`, because it serves no resources, only JSON."
    }
  },
  {
    area: "lenguajes",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Qué harías distinto si esto tuviera usuarios de internet?",
      a: "El modelo de amenazas cambia. Ahora confío en la red local y en el gateway. Con usuarios reales agregaría rotación de claves de credenciales, limitación de tasa distribuida, CSP con nonces, y sobre todo monitoreo. Y el respaldo local diario no alcanza: haría falta uno externo y verificable, más una prueba de restauración. Un respaldo que nunca se restauró es una hipótesis, no un respaldo."
    },
    en: {
      q: "What would you do differently if this had users on the internet?",
      a: "The threat model changes. Right now I trust the local network and the gateway. With real users I would add credential key rotation, distributed rate limiting, CSP with nonces, and above all monitoring. And a local daily backup is not enough: I would need an external, verified one, plus a restore drill. A backup that has never been restored is a hypothesis, not a backup."
    }
  },

  /* ---------------------------------------------------------------------
     DATOS
     --------------------------------------------------------------------- */
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "basico",
    es: {
      q: "¿Cómo garantizás la integridad referencial en SQLite?",
      a: "Con `PRAGMA foreign_keys = ON`, que en SQLite viene desactivado por defecto. Es un detalle fácil de olvidar: sin esa línea, las claves foráneas no se verifican."
    },
    en: {
      q: "How do you guarantee referential integrity in SQLite?",
      a: "With `PRAGMA foreign_keys = ON`, which is disabled by default in SQLite. It is an easy detail to forget: without that line, foreign keys are not enforced."
    }
  },
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "medio",
    es: {
      q: "¿Cómo funcionan las migraciones acumulativas?",
      a: "Cada archivo se aplica una sola vez y se registra en la tabla de migraciones con su versión. Al arrancar, leo los archivos, los ordeno por número, y aplico solo los que no están registrados, cada uno en su propia transacción. La versión esperada se compara contra la aplicada en el readiness, así que un esquema a medio migrar se detecta antes de recibir tráfico."
    },
    en: {
      q: "How do the cumulative migrations work?",
      a: "Each file is applied once and recorded in the migrations table with its version. On startup I read the files, sort them by number, and apply only the ones not yet recorded, each in its own transaction. The expected version is compared against the applied one during readiness, so a half-migrated schema is detected before any traffic is accepted."
    }
  },
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "avanzado",
    es: {
      q: "¿Qué pasa si una migración falla a mitad?",
      a: "Como cada migración corre en su transacción y las del archivo no llevan bloques de confirmación explícitos, el fallo revierte esa migración completa y no se registra la versión. El próximo arranque reintenta. Además, la versión esperada se compara contra la aplicada, así que un esquema inconsistente se marca como no listo en lugar de fallar en silencio."
    },
    en: {
      q: "What happens if a migration fails halfway?",
      a: "Since each migration runs in its own transaction, and the files do not carry explicit commit blocks, a failure rolls back that whole migration and the version is not recorded. The next startup retries it. Also, the expected version is compared against the applied one, so an inconsistent schema is marked not ready rather than failing silently."
    }
  },
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "medio",
    es: {
      q: "¿Cómo hacés los respaldos?",
      a: "Copia en caliente con la API de respaldo de SQLite, que es consistente incluso con escrituras en curso. Después verifico la integridad del archivo resultante y registro el resultado. La retención es de 14 días por defecto. Y hay un ensayo de restauración aislado, que es lo que convierte 'tengo respaldos' en 'sé que puedo recuperar'."
    },
    en: {
      q: "How do you do the backups?",
      a: "Hot copy using the SQLite backup API, which is consistent even with writes in progress. Afterwards I verify the integrity of the resulting file and record the result. Retention defaults to 14 days. And there is an isolated restore rehearsal, which is what turns 'I have backups' into 'I know I can recover'."
    }
  },
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "avanzado",
    es: {
      q: "¿Qué pasa si se pierde la base en producción?",
      a: "Se restaura desde el último respaldo verificado. Por eso el readiness exige que exista una fecha de restauración comprobada: no alcanza con que el respaldo exista, tiene que haberse restaurado una vez. La ventana de pérdida es el intervalo de respaldo, 24 horas por defecto. Un SQLite de una sola instancia no tiene réplica, así que ese es el riesgo asumido y declarado."
    },
    en: {
      q: "What happens if the database is lost in production?",
      a: "You restore from the last verified backup. That is why readiness requires a recorded restore date: it is not enough that the backup exists, it has to have been restored once. The loss window is the backup interval, 24 hours by default. A single-instance SQLite has no replica, so that is the accepted and documented risk."
    }
  },

  /* ---------------------------------------------------------------------
     DISEÑO DDD
     --------------------------------------------------------------------- */
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "avanzado",
    es: {
      q: "¿Qué es una raíz de agregado y cómo decidís los límites?",
      a: "Es la única puerta de entrada a un grupo de objetos que deben ser consistentes entre sí. Los límites los decido por invariante: qué conjunto de datos tiene que ser consistente sin coordinación externa. En Liberación de Lote, la liberación y su revocación son el mismo agregado porque forman una historia. Un Lote, en cambio, es su propio agregado."
    },
    en: {
      q: "What is an Aggregate Root, and how do you decide the boundaries?",
      a: "It is the single entry point to a group of objects that must be consistent with each other. I decide boundaries by invariant: which set of data has to be consistent without external coordination. In LoteRelease, the release and its revocation are the same aggregate because they form one story. A Lote, on the other hand, is its own aggregate."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "avanzado",
    es: {
      q: "¿Qué es un Process Manager?",
      a: "Un componente que reacciona a eventos de otros contextos y coordina un proceso de largo alcance que ningún contexto posee. En un sistema de ventas, por ejemplo, la autorización fiscal coordina venta, comprobante y entrega a lo largo del tiempo. Es importante clasificarlo explícitamente: es un trabajador técnico, no el dueño de las reglas de negocio, y antes de crear uno conviene pasar por una clasificación explícita para no convertirlo sin querer en el centro de todo."
    },
    en: {
      q: "What is a Process Manager?",
      a: "A component that reacts to events from other contexts and coordinates a long-running process that no single context owns. In a sales system, for instance, fiscal authorisation coordinates sale, receipt and delivery over time. It is important to classify it explicitly: it is a technical worker, not the owner of business rules, and before creating one it is worth going through an explicit classification so it does not quietly become the centre of everything."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "medio",
    es: {
      q: "¿Objeto de valor inmutable o entidad con identidad?",
      a: "Si solo importa el valor y no su historia, es un objeto de valor inmutable: se compara por contenido, se puede compartir, no tiene identidad. Si tiene historia y dos instancias con el mismo valor son distintas, es una entidad, con identidad y ciclo de vida. El CUIT del receptor es un objeto de valor. Un Lote es una entidad."
    },
    en: {
      q: "Immutable Value Object or entity with identity?",
      a: "If only the value matters and not its history, it is an immutable value object: compared by content, shareable, no identity. If it has history and two instances with the same value are different things, it is an entity, with identity and lifecycle. The receiver's tax ID is a value object. A Lote is an entity."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "avanzado",
    es: {
      q: "¿Qué es un evento de dominio y cómo lo diseñás?",
      a: "Un hecho que ya ocurrió, en pasado, inmutable. Lo nombro en pasado: Pago Aprobado, Lote Revocado. No es un comando ni una instrucción. Y lleva lo mínimo necesario: identificadores, no objetos enteros. La ventaja es que el nombre obliga a pensar en pasado, y si el evento dice Procesar Pago es porque todavía no ocurrió."
    },
    en: {
      q: "What is a domain event, and how do you design one?",
      a: "A fact that already happened, in the past tense, immutable. I name it in the past: PaymentApproved, BatchRevoked. It is not a command nor an instruction. And it carries the minimum: identifiers, not whole objects. The advantage is that the name forces past thinking, and if the event says ProcessPayment it is because it has not happened yet."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "avanzado",
    es: {
      q: "Aplicaste DDD a un diseño y el resultado fue un número alto de contextos. ¿Cuál es la razón por la cual eliminar alguno sería incorrecta?",
      a: "Porque el número es consecuencia de los límites que cada contexto protege, no un objetivo en sí mismo. Un contexto existe si custodia invariantes que no se pueden garantizar en otro lado; si lo elimino sin trasladar esas invariantes, alguien termina comprobándolas en el lugar equivocado y el modelo deja de proteger lo que protege. Un criterio concreto para dudar de un límite: si dos contextos necesitan el mismo dato, ese dato no debería tener un dueño único, sino una traducción en cada borde. Si borrás un contexto y tenés que mover su dato a un vecino que ya tenía otro propósito, lo que en realidad estás haciendo es juntar dos modelos con significados distintos. Prefiero dejar el límite y documentar que se revisa, antes que maquillar el recuento."
    },
    en: {
      q: "You applied DDD to a design and ended up with a high number of contexts. What would make removing one of them incorrect?",
      a: "Because the number is a consequence of the boundaries each context protects, not a goal in itself. A context exists if it guards invariants that cannot be guaranteed elsewhere; if I remove it without moving those invariants, someone ends up checking them in the wrong place and the model stops protecting what it was protecting. A concrete test for doubting a boundary: if two contexts need the same data, that data should not have a single owner but a translation at each edge. If deleting a context means moving its data into a neighbour that already had a different purpose, what you are really doing is merging two models with different meanings. I would rather keep the boundary and document that it should be revisited than adjust the design to make the count look better."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "medio",
    es: {
      q: "¿Qué es una capa anticorrupción?",
      a: "Un traductor entre el modelo propio y un modelo externo, para que el concepto del otro dominio no contamine el tuyo. En el caso de ARCA, el concepto de comprobante fiscal tiene su propio vocabulario y no debería filtrarse a Venta. El adaptador es donde ocurre la traducción."
    },
    en: {
      q: "What is an anti-corruption layer?",
      a: "A translator between your own model and an external one, so the other domain's concept does not contaminate yours. In the ARCA case, the fiscal receipt concept has its own vocabulary and should not leak into Sales. The adapter is where that translation happens."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "basico",
    es: {
      q: "¿Qué buscabas con DDD?",
      a: "Poner las invariantes donde no se puedan saltar. Que no se pueda sobre-recibir material, que no se pague dos veces la misma cuota, que no se emita sin autorización. Esas reglas viven en el dominio, con el dato, no en el controlador HTTP. Si mañana cambio de framework, las reglas siguen."
    },
    en: {
      q: "What were you after with DDD?",
      a: "Putting invariants where they cannot be bypassed. That declared material cannot be over-received, that the same charge cannot be paid twice, that nothing is issued without authorisation. Those rules live in the domain, next to the data, not in the HTTP controller. If I change framework tomorrow, the rules remain."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "avanzado",
    es: {
      q: "¿Qué es Event Storming y cómo lo usaste?",
      a: "Es una technique de modelado que empieza por los eventos, en pasado, y de ahí sale el modelo. Me sirvió para separar 'lo que ya pasó' de 'lo que quiero que pase', que es la confusión más común al diseñar un dominio. Después usé el mapa de contextos para ver dónde están las fronteras."
    },
    en: {
      q: "What is Event Storming and how did you use it?",
      a: "A modelling technique that starts from the events, in the past tense, and the model follows from them. It helped me separate 'what already happened' from 'what I want to happen', which is the most common confusion when designing a domain. Afterwards I used the context map to see where the boundaries sit."
    }
  },

  /* ---------------------------------------------------------------------
     PAGOS
     --------------------------------------------------------------------- */
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Cómo evitás que alguien pague dos veces?",
      a: "Dos mecanismos. Al crear el pago, bloqueo las cuotas con `FOR UPDATE` y las cambio a estado pendiente de pago en la misma transacción; si otra persona intenta pagar, no encuentra la cuota en estado pagable. Y el webhook es idempotente: el proveedor manda la misma notificación varias veces, y la restricción única en la base rechaza el duplicado."
    },
    en: {
      q: "How do you prevent someone paying twice?",
      a: "Two mechanisms. When creating the payment, I lock the charges with `FOR UPDATE` and set them to pending-payment inside the same transaction; if someone else tries to pay, they do not find the charge in a payable state. And the webhook is idempotent: the provider sends the same notification several times, and a unique constraint in the database rejects the duplicate."
    }
  },
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Qué pasa si alguien manipula el webhook?",
      a: "No confío en lo que llega. Verifico la firma HMAC con comparación en tiempo constante, después vuelvo a consultar el pago directamente a Mercado Pago, y comparo importe y moneda contra lo que esperamos antes de mover un peso. Aunque alguien falsificara la firma, la consulta al proveedor la contradice. Y si el importe no coincide, la transacción se revierte."
    },
    en: {
      q: "What happens if someone manipulates the webhook?",
      a: "I do not trust what arrives. I verify the HMAC signature with a constant-time comparison, then I query the payment directly at Mercado Pago again, and compare amount and currency against what we expect before moving any money. Even if someone forged the signature, the provider query contradicts it. And if the amount does not match, the transaction rolls back."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "medio",
    es: {
      q: "¿Qué es la clave de idempotencia y dónde la usás?",
      a: "Un identificador que hace que repetir la misma operación no genere un efecto duplicado. La mando al proveedor como encabezado de idempotencia para que no cree dos preferencias de pago, y la guardo en la base. En el webhook, la restricción única sobre club, proveedor e identificador de pago hace que una notificación repetida no procese dos veces."
    },
    en: {
      q: "What is an idempotency key, and where do you use it?",
      a: "An identifier that makes repeating the same operation not produce a duplicate effect. I send it to the provider as the idempotency header so it does not create two payment preferences, and I store it in the database. On the webhook, the unique constraint over club, provider and payment id stops a repeated notification from processing twice."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "Explicame el aislamiento multi-tenant.",
      a: "Cada consulta filtra por identificador de club, y ese identificador sale del token firmado, nunca del cuerpo de la petición. Hay doble control: un guard de rol en la aplicación y filtrado por tenant en SQL. Revisé unas treinta consultas y todas lo hacen. Y para la cuenta de un socio hay una condición explícita que compara el usuario autenticado con el propietario del perfil."
    },
    en: {
      q: "Explain the multi-tenant isolation.",
      a: "Every query filters by club id, and that id comes from the signed token, never from the request body. There are two controls: a role guard in the application and tenant filtering in SQL. I reviewed about thirty queries and all of them do it. And for a member's account there is an explicit condition comparing the authenticated user with the profile owner."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "basico",
    es: {
      q: "¿Qué roles manejás?",
      a: "Depende del dominio. En el sistema donde trabajé había cuatro roles: administrador, tesorero, entrenador y socio. Cada endpoint declara qué roles lo pueden invocar, y un guard lo verifica antes de llegar al controlador. El rol no alcanza para cruzar tenants: la pertenencia se valida por separado."
    },
    en: {
      q: "Which roles do you handle?",
      a: "It depends on the domain. In the system I worked on there were four roles: administrator, treasurer, coach and member. Every endpoint declares which roles may call it, and a guard verifies it before reaching the controller. The role is not enough to cross tenants: membership is validated separately."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Cómo cambio de club si pertenezco a varios?",
      a: "El token incluye el identificador de club. Cambiar de club emite un token nuevo con ese club como contexto. Y el JWT no confía en sí mismo: en cada petición se revalida contra la base para comprobar que el usuario siga activo, que el club siga activo, y que la versión de autenticación no haya cambiado. Un token con el rol alterado se rechaza."
    },
    en: {
      q: "How do I switch club if I belong to several?",
      a: "The token carries the club id. Switching club issues a new token with that club as context. And the JWT does not trust itself: on every request it is revalidated against the database to confirm the user is still active, the club is still active, and the authentication version has not changed. A token with a tampered role is rejected."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "arquitectura",
    nivel: "medio",
    es: {
      q: "¿Qué es la autenticación por versión?",
      a: "Cada usuario tiene una versión de autenticación que se incrementa al cambiar la contraseña. El token lleva la versión con la que se emitió, y en cada petición se compara con la actual. Si no coinciden, la sesión muere. Eso permite revocar todas las sesiones de una persona sin lista de revocación: basta con subir el número."
    },
    en: {
      q: "What is authentication versioning?",
      a: "Each user has an authentication version that increments when the password changes. The token carries the version it was issued with, and on every request it is compared with the current one. If they do not match, the session dies. That allows revoking all of a person's sessions without a revocation list: just increment the number."
    }
  },
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Cómo manejas la reversión de un pago?",
      a: "Si el pago se rechaza o se cancela, los cargos vuelven al estado pendiente en la misma transacción. Si hay reintegro, además limpio la fecha de pago y dejo el movimiento en la historia del socio. Nunca borro el registro: queda la constancia del intento, que es información de auditoría."
    },
    en: {
      q: "How do you handle a payment reversal?",
      a: "If the payment is rejected or cancelled, the charges go back to pending inside the same transaction. If there is a refund, I also clear the paid date and leave the entry in the member's history. I never delete the record: the attempt remains as audit information."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Por qué importes en centavos?",
      a: "Porque los enteros no tienen error de redondeo. Un peso con decimales en coma flotante acumula error, y en una suma de cuotas eso se convierte en diferencias de centavos que nadie sabe de dónde salieron. Con importes enteros la aritmética es exacta. La conversión a pesos ocurre solo al presentar."
    },
    en: {
      q: "Why store amounts in cents?",
      a: "Because integers have no rounding error. A peso with decimals in floating point accumulates error, and across a sum of charges that becomes cent differences nobody can trace. With integer amounts the arithmetic is exact. Conversion to pesos happens only for display."
    }
  },
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "medio",
    es: {
      q: "¿Cómo generás el número de socio?",
      a: "Con un bloqueo consultivo de PostgreSQL sobre el identificador del club, dentro de la transacción. Serializa dos altas simultáneas para el mismo club, así que el correlativo no se duplica. Y uso el mismo bloqueo en el alta administrativa y en el autoregistro desde la aplicación móvil, para que ambos caminos numeren igual."
    },
    en: {
      q: "How do you generate the member number?",
      a: "With a PostgreSQL advisory lock on the club id, inside the transaction. It serialises two simultaneous registrations for the same club, so the sequence does not duplicate. I use the same lock for administrative creation and for self-registration from the mobile app, so both paths number identically."
    }
  },
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Qué pasa si dos personas pagan al mismo socio a la vez?",
      a: "Cada pago va contra cuotas concretas, no contra el saldo. Y esas cuotas se bloquean con `FOR UPDATE` al crear la intención de pago. Si dos pagos apuntan a las mismas cuotas, el segundo espera al primero y cuando obtiene el bloqueo ya no las encuentra en estado pagable, así que falla con un mensaje claro en lugar de cobrar dos veces."
    },
    en: {
      q: "What happens if two people pay the same member at once?",
      a: "Each payment targets specific charges, not the balance. And those charges are locked with `FOR UPDATE` when the payment intent is created. If two payments target the same charges, the second waits for the first, and once it gets the lock it no longer finds them payable, so it fails with a clear message instead of charging twice."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Cómo garantizás que el saldo nunca se contradiga?",
      a: "El saldo no se guarda: se calcula. Los cargos son la fuente de verdad y el saldo es una proyección: la suma de cargos no pagados, y vencidos los que pasaron su fecha. Nunca hay que reconciliar dos números, porque hay uno solo."
    },
    en: {
      q: "How do you guarantee the balance never contradicts itself?",
      a: "The balance is not stored: it is computed. The charges are the source of truth and the balance is a projection: the sum of unpaid charges, and overdue those past their date. Two numbers never have to be reconciled, because there is only one."
    }
  },
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "basico",
    es: {
      q: "¿Qué es Checkout Pro?",
      a: "El checkout alojado de Mercado Pago. El usuario paga en la página del proveedor y nunca pasa por mi servidor, así que no manejo datos de tarjetas. Eso reduce la superficie de cumplimiento normativo. Yo solo guardo el enlace del checkout y el pago se confirma por webhook."
    },
    en: {
      q: "What is Checkout Pro?",
      a: "Mercado Pago's hosted checkout. The user pays on the provider's page and never passes through my server, so I do not handle card data. That reduces the compliance surface. I only store the checkout link and the payment is confirmed by webhook."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Cómo dejas de recibir webhooks duplicados?",
      a: "El webhook de Mercado Pago no garantiza entrega única. Lo trato como duplicado por diseño: la actualización del pago es idempotente porque busca por referencia externa, y si el estado ya era final no lo cambia. La transición a aprobado marca los cargos pagados una sola vez, y el evento de salida lleva una condición de no-existencia para no duplicarlo."
    },
    en: {
      q: "How do you stop receiving duplicate webhooks?",
      a: "Mercado Pago's webhook does not guarantee single delivery. I treat it as a duplicate by design: the payment update is idempotent because it looks up by external reference, and if the state was already final it does not change it. The transition to approved marks the charges paid only once, and the outbound event carries a not-exists condition so it is not duplicated."
    }
  },

  /* ---------------------------------------------------------------------
     CIBERSEGURIDAD
     --------------------------------------------------------------------- */
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "basico",
    es: {
      q: "¿Cómo guardás las credenciales de Mercado Pago y ARCA?",
      a: "Cifradas con AES-256-GCM, por club, con vector de inicialización aleatorio por escritura y etiqueta de autenticación. La clave viene de una variable de entorno y en producción tiene que tener 32 caracteres o más, o el sistema no arranca. GCM además detecta si alguien alteró el texto cifrado."
    },
    en: {
      q: "How do you store the Mercado Pago and ARCA credentials?",
      a: "Encrypted with AES-256-GCM, per club, with a random initialisation vector per write and an authentication tag. The key comes from an environment variable and in production it must be 32 characters or longer, or the system will not start. GCM also detects if someone tampered with the ciphertext."
    }
  },
  {
    area: "lenguajes",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Por qué no guardás datos de tarjetas?",
      a: "Porque no hace falta. Uso Checkout Pro, que es el checkout alojado del proveedor: el usuario paga en la página de Mercado Pago y nunca pasa por mi servidor. Así no manejo números de tarjeta, no guardo el código de seguridad, y la superficie de cumplimiento normativo se reduce muchísimo."
    },
    en: {
      q: "Why do you not store card data?",
      a: "Because there is no need. I use Checkout Pro, the provider's hosted checkout: the user pays on Mercado Pago's page and never passes through my server. So I do not handle card numbers, do not store the security code, and the compliance surface is greatly reduced."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Qué pasa si alguien roba la base de datos?",
      a: "Tres cosas. Las contraseñas están hasheadas, así que no se recuperan. Los tokens de sesión no están en la base, son JWT firmados. Y las credenciales de los proveedores están cifradas con una clave que no está en la base. Quedan los datos personales y las cuotas, que sí son sensibles y requieren respaldo cifrado y política de retención."
    },
    en: {
      q: "What happens if someone steals the database?",
      a: "Three things. Passwords are hashed, so they cannot be recovered. Session tokens are not in the database, they are signed JWTs. And provider credentials are encrypted with a key that is not in the database. What remains is personal data and charges, which are sensitive and require encrypted backups and a retention policy."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "medio",
    es: {
      q: "¿Cómo te proteges contra la fuerza bruta?",
      a: "Con limitación de tasa por endpoint. En el sistema donde trabajé: el acceso 5 intentos por minuto, el registro de organización 5, el de usuario 5, y un límite global más alto. Lo importante es que los endpoints caros de crear o enviar (alta de organización, recuperación de contraseña) tengan su propio límite, porque si no son un vector obvio."
    },
    en: {
      q: "How do you protect against brute force?",
      a: "With per-endpoint rate limiting. In the system I worked on: login 5 attempts per minute, organisation registration 5, user registration 5, and a higher global limit. What matters is that expensive endpoints to create or send (organisation registration, password recovery) have their own limit, because otherwise they are an obvious vector."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Por qué el identificador de club nunca viene del formulario?",
      a: "Porque si lo aceptara del cuerpo, cualquiera podría pedir datos de otro club con su propio token. El tenant se toma del token firmado, que es lo único que el cliente no controla. Después, además, la consulta filtra por ese identificador, y para la cuenta de un socio hay un chequeo de propiedad explícito."
    },
    en: {
      q: "Why does the club id never come from the form?",
      a: "Because if it were accepted from the body, anyone could request another club's data with their own token. The tenant is taken from the signed token, which is the only thing the client does not control. Then, on top of that, the query filters by that id, and for a member's account there is an explicit ownership check."
    }
  },
  {
    area: "lenguajes",
    areaTema: "seguridad",
    nivel: "medio",
    es: {
      q: "¿Qué es la validación con lista blanca?",
      a: "Validación de objetos de entrada con lista blanca: cualquier campo que no esté declarado se rechaza en lugar de ignorarse. Sumado a rechazar campos no declarados, si alguien manda un campo extra da error en vez de aceptarlo en silencio. Y con la transformación activada, los tipos se convierten, así que no comparo cadenas contra números."
    },
    en: {
      q: "What is whitelist validation?",
      a: "Input object validation with an allow-list: any field that is not declared is rejected rather than ignored. Combined with rejecting undeclared fields, if someone sends an extra field it errors instead of being silently accepted. And with transformation enabled, types are converted, so I do not compare strings against numbers."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Cómo validas una foto de perfil?",
      a: "No confío en la extensión. Parseo los marcadores JPEG reales, verifico que empiece y termine con las firmas correctas, recorro los segmentos comprobando longitudes, y leo las dimensiones del marcador de inicio de imagen. Solo acepto hasta 1024 píxeles y 60 KB. El nombre base64 no dice nada sobre el contenido real."
    },
    en: {
      q: "How do you validate a profile photo?",
      a: "I do not trust the extension. I parse the real JPEG markers, verify it starts and ends with the correct signatures, walk the segments checking lengths, and read the dimensions from the start-of-image marker. I only accept up to 1024 pixels and 60 KB. The base64 name says nothing about the real content."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "basico",
    es: {
      q: "¿Qué pasa si se filtra la base?",
      a: "Las fotos de perfil están codificadas en base64 dentro de la columna. Con el límite de 60 KB por foto es manejable, pero si el padrón crece los listados se vuelven pesados. Por eso en las consultas de listado elijo columnas explícitas y no selecciono todo: la foto solo se trae cuando se pide ese socio."
    },
    en: {
      q: "What happens if the database leaks?",
      a: "Profile photos are base64-encoded in the column. With the 60 KB limit per photo it is manageable, but as the membership grows listings get heavy. That is why the listing queries use explicit columns instead of selecting everything: the photo is only fetched when that specific member is requested."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Qué es la doble validación de tenant?",
      a: "Dos capas independientes. La primera es el guard de rol, que verifica el permiso para la operación. La segunda es el filtro por club en la consulta SQL. Importa que sean independientes: si una falla, la otra sigue sosteniendo. Si dependiera solo del guard, un error en el mapeo del decorador expondría datos."
    },
    en: {
      q: "What is double tenant validation?",
      a: "Two independent layers. The first is the role guard, which checks permission for the operation. The second is the club filter in the SQL query. It matters that they are independent: if one fails, the other still holds. Relying only on the guard, a decorator mapping mistake would expose data."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Por qué el sistema no arranca en producción con secretos débiles?",
      a: "Porque la comprobación está en el arranque, no en la primera petición. El arranque verifica que el secreto de sesión y la clave de cifrado tengan 32 caracteres o más, que exista la cadena de conexión, que CORS no sea comodín, y que las URLs públicas usen HTTPS. Si algo falta, el proceso muere al iniciar. Es preferible no arrancar que arrancar inseguro."
    },
    en: {
      q: "Why does the system refuse to start in production with weak secrets?",
      a: "Because the check is at startup, not on the first request. Startup verifies that the session secret and encryption key are 32 characters or longer, that the connection string exists, that CORS is not a wildcard, and that public URLs use HTTPS. If anything is missing the process dies on boot. It is better not to start than to start insecure."
    }
  },
  {
    area: "it-general",
    areaTema: "seguridad",
    nivel: "medio",
    es: {
      q: "¿Qué es la comparación en tiempo constante y por qué importa?",
      a: "Comparar sin que el tiempo dependa de dónde difieren. Con el operador de igualdad, si el primer carácter distinto está al principio la comparación termina rápido, y si está al final tarda más. Eso filtra información. Con la comparación en tiempo constante el tiempo es siempre el mismo. Lo uso en la firma del webhook de Mercado Pago."
    },
    en: {
      q: "What is constant-time comparison and why does it matter?",
      a: "Comparing without the time depending on where the values differ. With the equality operator, if the first differing character is at the start the comparison finishes fast, and if it is at the end it takes longer. That leaks information. With constant-time comparison the time is always the same. I use it for the Mercado Pago webhook signature."
    }
  },

  /* ---------------------------------------------------------------------
     INTEGRACIONES
     --------------------------------------------------------------------- */
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "basico",
    es: {
      q: "¿Qué es el web service de facturación electrónica?",
      a: "El servicio de facturación electrónica de ARCA. Solicita autorización de comprobantes con el certificado digital del contribuyente. Yo pido el código de autorización y genero el comprobante en PDF con su código QR oficial. Cada club tiene su propio certificado, y las credenciales siguen conectando directamente con el servicio fiscal."
    },
    en: {
      q: "What is the electronic invoicing web service?",
      a: "ARCA's electronic invoicing service. It requests receipt authorisation with the taxpayer's digital certificate. I request the authorisation code and generate the PDF receipt with its official QR code. Each club has its own certificate, and the credentials keep connecting directly to the tax service."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "¿Cómo manejas los reintentos de emisión?",
      a: "Con espera progresiva: el primer reintento espera un minuto, y cada uno duplica hasta un tope de 60 minutos. Y hay un límite de intentos, después del cual la factura queda con su último error registrado y requiere intervención. La factura pasa a estado emitiéndose mientras se procesa, así no se emite dos veces."
    },
    en: {
      q: "How do you handle issuance retries?",
      a: "With progressive backoff: the first retry waits a minute, and each one doubles up to a cap of 60 minutes. And there is an attempt limit, after which the invoice keeps its last recorded error and requires intervention. The invoice moves to an issuing state while being processed, so it is not issued twice."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "¿Por qué no dejar que el sistema deduzca datos fiscales?",
      a: "Porque el tipo de comprobante, el concepto, la condición impositiva del receptor y la alícuota dependen de la situación tributaria real de cada club. El sistema los configura explícitamente y no los deduce. Una configuración fiscal incorrecta produce comprobantes incorrectos aunque la conexión técnica funcione, y eso no se arregla con código."
    },
    en: {
      q: "Why not let the system infer tax data?",
      a: "Because the receipt type, the concept, the recipient's tax condition and the tax rate depend on the real tax situation of each club. The system configures them explicitly and does not infer them. An incorrect tax configuration produces incorrect receipts even when the technical connection works, and that is not fixed with code."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "medio",
    es: {
      q: "¿Qué es el código QR fiscal?",
      a: "El código que ARCA genera para cada comprobante y que permite verificarlo contra la base de la agencia. Va embebido en el PDF que descargan el club y el socio. Se genera con los datos que devuelve la autorización, no inventados."
    },
    en: {
      q: "What is the fiscal QR code?",
      a: "The code ARCA generates for each receipt, which allows verifying it against the agency's database. It is embedded in the PDF that the club and the member download. It is generated from the data the authorisation returns, not invented."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "¿Qué pasa si ARCA autoriza y yo caigo antes de guardar el código?",
      a: "Es el peor caso: el comprobante está autorizado en ARCA pero en mi base figura pendiente. El bloqueo con omisión más la reserva de numeración ayudan a que solo un proceso lo intente, y la siguiente ejecución retoma. Pero la conciliación real contra ARCA todavía no está implementada: es parte de lo que falta del adaptador fiscal."
    },
    en: {
      q: "What happens if ARCA authorises and I crash before saving the code?",
      a: "That is the worst case: the receipt is authorised at ARCA but shows as pending in my database. The skip-locked clause plus number reservation help ensure only one process attempts it, and the next run picks it up. But real reconciliation against ARCA is not implemented yet: it is part of what the fiscal adapter still lacks."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "fiscal",
    nivel: "avanzado",
    es: {
      q: "¿Por qué guardas las credenciales de un proveedor cifradas por tenant?",
      a: "Porque cada cliente es un contribuyente distinto, con su certificado y su identificación fiscal. No hay un certificado global: el sistema tiene que poder operar N clientes con N conjuntos de credenciales. Cifradas con AES-256-GCM y con la clave fuera de la base, para que un acceso a la base no sirva de nada."
    },
    en: {
      q: "Why do you store per-tenant provider credentials encrypted?",
      a: "Because each customer is a different taxpayer, with its own certificate and tax id. There is no global certificate: the system has to be able to operate N customers with N sets of credentials. Encrypted with AES-256-GCM and with the key outside the database, so database access is useless on its own."
    }
  },
  {
    area: "arquitectura",
    areaTema: "fiscal",
    nivel: "basico",
    es: {
      q: "¿Qué necesitás para emitir facturas electrónicas contra un proveedor real, y por qué se empieza por un entorno de pruebas?",
      a: "Habilitar el servicio web, tener el certificado y la clave de la identificación fiscal, crear un punto de venta para servicios web, completar los datos registrales y definir el tipo de comprobante. Se prueba primero contra el entorno de homologación, y a producción se pasa con el circuito completo ya ejercido y con aprobación de quien responde por la contabilidad. El orden importa: el entorno de pruebas tiene respuestas distintas, así que pasar a producción sin haber visto las de verdad es cambiar de sistema sin darme cuenta."
    },
    en: {
      q: "What do you need in order to issue electronic invoices against a real provider, and why do you start in a test environment?",
      a: "Enable the web service, have the certificate and key for the tax id, create a point of sale for web services, complete the registration data and define the receipt type. You exercise it first against the test environment, and you reach production only with the full circuit already run and sign-off from whoever owns the accounting. The order matters: the test environment returns different responses, so going to production without having seen the real ones is changing systems without noticing."
    }
  },

  /* ---------------------------------------------------------------------
     CONCURRENCIA
     --------------------------------------------------------------------- */
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "avanzado",
    es: {
      q: "¿Qué es `FOR UPDATE` y por qué lo usás?",
      a: "Bloquea las filas seleccionadas hasta que termine la transacción, así que otra transacción que intente tomar esas filas espera. Lo uso para reservar cuotas antes de crear el pago, y en la emisión fiscal para que dos procesos no tomen la misma factura. Es la forma de serializar el acceso cuando el conflicto es frecuente y hay que decidir."
    },
    en: {
      q: "What is `FOR UPDATE` and why do you use it?",
      a: "It locks the selected rows until the transaction ends, so another transaction trying to take those rows waits. I use it to reserve charges before creating the payment, and in fiscal issuance so two processes do not take the same invoice. It is how you serialise access when the conflict is frequent and a decision is needed."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "avanzado",
    es: {
      q: "¿Qué es un interbloqueo y cómo lo evitas?",
      a: "Dos transacciones que esperan un recurso que la otra tiene tomado. La forma más robusta de evitarlo es un orden de bloqueo estable: si una operación necesita varios bloqueos, los toma siempre en el mismo orden. En el sistema de préstamos, el socio se bloquea siempre antes que el ejemplar o el préstamo. Con orden consistente no se forma el ciclo."
    },
    en: {
      q: "What is a deadlock and how do you avoid it?",
      a: "Two transactions each waiting for a resource the other holds. The most robust way to avoid it is a stable lock order: if an operation needs several locks, it always takes them in the same order. In a loan system, the member is always locked before the copy or the loan. With consistent ordering the cycle cannot form."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "medio",
    es: {
      q: "¿Qué pasa si se cae la conexión a mitad de una transacción?",
      a: "PostgreSQL detecta la conexión caída y hace rollback de la transacción abierta. No queda estado parcial. Por eso todas las operaciones que tocan dinero están dentro de una transacción explícita, nunca en confirmación implícita."
    },
    en: {
      q: "What happens if the connection drops mid-transaction?",
      a: "PostgreSQL detects the dropped connection and rolls back the open transaction. No partial state remains. That is why every operation touching money sits inside an explicit transaction, never in implicit commit."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "basico",
    es: {
      q: "¿Qué es una restricción única parcial?",
      a: "Un índice único que aplica solo a un subconjunto de filas. En el caso del ejemplar, el índice es sobre el identificador de ejemplar donde la devolución es nula. Así un ejemplar no puede tener dos préstamos activos, pero sí cuantos devueltos haga falta. Es la regla de negocio resuelta en la base, no en el código."
    },
    en: {
      q: "What is a partial unique constraint?",
      a: "A unique index that applies only to a subset of rows. For the copy, the index is on the copy id where the return date is null. So a copy cannot have two active loans, but can have as many returned ones as needed. It is the business rule solved in the database, not in code."
    }
  },
  {
    area: "arquitectura",
    areaTema: "concurrencia",
    nivel: "avanzado",
    es: {
      q: "Explícame el bloqueo consultivo.",
      a: "Es un bloqueo de PostgreSQL que no está asociado a una fila sino a una clave que yo elijo. Lo uso para serializar la generación de un correlativo por tenant: tomo el bloqueo con la clave del tenant, leo el máximo, calculo el siguiente, inserto. Dos altas simultáneas para el mismo tenant se serializan, y para tenants distintos van en paralelo."
    },
    en: {
      q: "Explain the advisory lock.",
      a: "It is a PostgreSQL lock that is not tied to a row but to a key I choose. I use it to serialise generation of a per-tenant sequence: take the lock with the tenant key, read the maximum, compute the next, insert. Two simultaneous registrations for the same tenant are serialised, while different tenants run in parallel."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "avanzado",
    es: {
      q: "¿Cómo evitas la doble generación de cuotas?",
      a: "Con un índice único parcial sobre socio, plan y período, que aplica solo cuando los dos últimos no son nulos. La inserción con conflicto ignorado hace que repetir la generación del período no duplique nada. Y solo cuenta como creada la cuota que efectivamente devolvió una fila."
    },
    en: {
      q: "How do you avoid duplicate charge generation?",
      a: "With a partial unique index over member, plan and period, which only applies when the last two are not null. The insert with conflict ignored means repeating the period generation duplicates nothing. And only the charge that actually returned a row is counted as created."
    }
  },

  /* ---------------------------------------------------------------------
     PROCESO
     --------------------------------------------------------------------- */
  {
    area: "arquitectura",
    areaTema: "proceso",
    nivel: "medio",
    es: {
      q: "¿Cómo generás las cuotas del mes?",
      a: "Un endpoint que toma plan y período, bloquea el plan, calcula la fecha de vencimiento según el día de cobro del plan, y genera cuota para cada socio activo: los inscriptos al deporte si el plan es por deporte, o todos si es general. Todo en una transacción con la inserción idempotente que evita duplicar."
    },
    en: {
      q: "How do you generate the monthly charges?",
      a: "An endpoint that takes a plan and a period, locks the plan, calculates the due date from the plan's billing day, and generates a charge for each active member: those enrolled in the sport if the plan is sport-based, or everyone if it is general. All inside a transaction with the idempotent insert that prevents duplicates."
    }
  },
  {
    area: "arquitectura",
    areaTema: "proceso",
    nivel: "avanzado",
    es: {
      q: "¿Cómo es idempotente la generación?",
      a: "Por el índice único parcial sobre socio, plan y período. Si la cuota ya existe, la inserción no hace nada y no la cuenta como creada. Así podés correr la generación las veces que quieras: la primera crea, las siguientes no. Y devuelve cuántas creó, que sirve de control."
    },
    en: {
      q: "How is the generation idempotent?",
      a: "Through the partial unique index over member, plan and period. If the charge already exists, the insert does nothing and it is not counted as created. So you can run the generation as many times as you want: the first one creates, the rest do not. And it returns how many it created, which serves as a control."
    }
  },
  {
    area: "it-general",
    areaTema: "proceso",
    nivel: "basico",
    es: {
      q: "¿Qué es la cuenta corriente del socio?",
      a: "Un libro de movimientos, no un saldo guardado. Cada cobro, cada cuota generada, cada devolución queda registrado. El saldo es la suma de eso. El beneficio es que podés mostrar la historia completa: de dónde vino cada peso, no solo cuánto debe."
    },
    en: {
      q: "What is the member's current account?",
      a: "A ledger of movements, not a stored balance. Every payment, every charge generated, every refund is recorded. The balance is the sum of that. The benefit is that you can show the full history: where each peso came from, not just how much is owed."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "proceso",
    nivel: "medio",
    es: {
      q: "¿Cómo funciona la invitación al socio?",
      a: "El club genera un token aleatorio, guarda su hash, y el socio lo canjea en 72 horas. Al aceptarlo se le crea su usuario con rol de socio y se vincula al perfil. El token es de un solo uso: al canjearlo queda marcado como usado, y un canje anterior se invalida."
    },
    en: {
      q: "How does the member invitation work?",
      a: "The club generates a random token, stores its hash, and the member redeems it within 72 hours. On acceptance their user is created with the member role and linked to the profile. The token is single use: redeeming marks it used, and any previous redemption is invalidated."
    }
  },
  {
    area: "it-general",
    areaTema: "proceso",
    nivel: "avanzado",
    es: {
      q: "¿Por qué un autoregistro abierto sin verificación de correo es aceptable en una demostración y no en producción?",
      a: "Porque en una demostración es directo, y eso es una decisión consciente de demo, no de producción. El alta abierta crea un usuario activo sin verificar la titularidad del correo ni pedir aprobación. El circuito tiene que definirse antes de abrir a reales, porque cualquiera podría dar de alta a otro con su correo. Lo que hace el código es dejar constancia: el modo abierto está disponible solo con la verificación desactivada de forma explícita, y activar el circuito verificado es un cambio de configuración que deja rastro. Así la diferencia entre demo y producción no depende de que alguien se acuerde."
    },
    en: {
      q: "Why is open self-registration without email verification acceptable in a demo but not in production?",
      a: "Because in a demo it is direct, and that is a conscious demo decision, not a production one. Open sign-up creates an active user without verifying email ownership or requesting approval. The circuit has to be defined before opening to real people, because anyone could register someone else with their email. What the code does is leave a record: the open mode is available only with verification explicitly disabled, and switching on the verified circuit is a configuration change that shows up. That way the difference between demo and production does not depend on someone remembering."
    }
  },
  {
    area: "it-general",
    areaTema: "proceso",
    nivel: "medio",
    es: {
      q: "¿Qué es el libro de movimientos?",
      a: "Un registro al que solo se le agregan entradas de todo lo que le pasa a un socio: alta, cobro, cuota, factura, traslado. Se escribe en la misma transacción que la operación de negocio, así que o queda el movimiento y el efecto, o ninguno. Nunca se modifica una entrada previa."
    },
    en: {
      q: "What is the movement ledger?",
      a: "An append-only record of everything that happens to a member: registration, payment, charge, invoice, transfer. It is written in the same transaction as the business operation, so either both the entry and the effect exist, or neither. A previous entry is never modified."
    }
  },
  {
    area: "it-general",
    areaTema: "proceso",
    nivel: "basico",
    es: {
      q: "¿Qué pasa si el socio se va?",
      a: "El perfil se desactiva, no se borra. Toda su historia queda: movimientos, cuotas, pagos. Un socio que deja de estar en el club tiene historia que importa para el balance del club."
    },
    en: {
      q: "What happens if a member leaves?",
      a: "The profile is deactivated, not deleted. Their whole history remains: movements, charges, payments. A member who stops being at the club has history that matters for the club's balance."
    }
  },
  {
    area: "arquitectura",
    areaTema: "proceso",
    nivel: "avanzado",
    es: {
      q: "¿Cómo generás la mensualidad sin duplicar?",
      a: "Corro la generación dentro de una transacción, y cada cuota usa inserción idempotente contra el índice único de socio, plan y período. Repetir el proceso en el mismo período no crea nada nuevo. Además, si la cuota ya estaba pagada se conserva: no la pisa."
    },
    en: {
      q: "How do you generate the monthly fee without duplicating?",
      a: "I run the generation inside a transaction, and each charge uses an idempotent insert against the unique index over member, plan and period. Repeating the process in the same period creates nothing new. And if the charge was already paid it is kept: it is not overwritten."
    }
  },

  /* ---------------------------------------------------------------------
     DISEÑO DDD
     --------------------------------------------------------------------- */
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "medio",
    es: {
      q: "¿Cómo separaste los contextos?",
      a: "Por lo que cambia junto. El de socios maneja la identidad del socio. El de cobros maneja el saldo y su historia. El de pagos maneja la integración con el proveedor, que es lo que más cambia y más afuera está. El de fiscal maneja la emisión a ARCA. El de deportes maneja inscripción y categorías. Acoplamiento bajo, y los datos que cruzan se duplican en cada contexto."
    },
    en: {
      q: "How did you separate the contexts?",
      a: "By what changes together. Members handles the member's identity. Collections handles the balance and its history. Payments handles the provider integration, which is what changes most and sits most external. Fiscal handles ARCA issuance. Sports handles enrolment and categories. Low coupling, and the data that crosses is duplicated in each context."
    }
  },
  {
    area: "arquitectura",
    areaTema: "ddd",
    nivel: "avanzado",
    es: {
      q: "¿Qué contexto consideraste el más difícil?",
      a: "Pagos. Tiene que manejar idempotencia, reintentos, reversiones, reintegros y reconciliación, y cruza con el saldo del socio. Es el único que toca dinero real de terceros, y el único donde un error se traduce en plata mal cobrada o perdida."
    },
    en: {
      q: "Which context did you find hardest?",
      a: "Payments. It has to handle idempotency, retries, reversals, refunds and reconciliation, and it crosses with the member's balance. It is the only one that touches real third-party money, and the only one where a mistake turns into money wrongly taken or lost."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "medio",
    es: {
      q: "¿Por qué el saldo es cálculo y no campo?",
      a: "Porque un saldo guardado es un segundo dato que puede contradecir al primero. Si guardo saldo y también los cargos, hay que reconciliar. Si solo hay cargos, el saldo siempre es consistente por construcción. Es la diferencia entre tener un estado que puede corromperse y tener una verdad que no puede."
    },
    en: {
      q: "Why is the balance computed rather than a field?",
      a: "Because a stored balance is a second piece of data that can contradict the first. If I store the balance and also the charges, they have to be reconciled. If there are only charges, the balance is always consistent by construction. It is the difference between having a state that can corrupt and having a truth that cannot."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "basico",
    es: {
      q: "¿Qué aporta DDD en un proyecto CRUD?",
      a: "Que el CRUD no es todo. El saldo, la idempotencia y la reversión de pagos no son CRUD. DDD pone esas reglas en un lugar con nombre y con pruebas propias, en vez de repartirlas como condicionales por los controladores. Cuando llega el caso raro, sabés dónde está la regla."
    },
    en: {
      q: "What does DDD bring to a CRUD project?",
      a: "That CRUD is not everything. The balance, idempotency and payment reversal are not CRUD. DDD puts those rules in one named place with their own tests, instead of spreading them as conditionals across controllers. When the odd case arrives, you know where the rule is."
    }
  },
  {
    area: "ddd",
    areaTema: "ddd",
    nivel: "avanzado",
    es: {
      q: "¿Qué es un agregado y qué negocio?",
      a: "Un conjunto de objetos que se cargan y guardan juntos, con una raíz que es la única puerta. En el contexto de socios, el socio es la raíz y sus datos personales son parte de su identidad. En cobros, la cuenta corriente es la raíz. Un pago de Mercado Pago no entra en ninguno: es otro contexto."
    },
    en: {
      q: "What is an aggregate and what would you put in one?",
      a: "A set of objects loaded and saved together, with a root that is the only entry point. In the members context, the member is the root and their personal data is part of their identity. In collections, the current account is the root. A Mercado Pago payment belongs to neither: it is another context."
    }
  },

  /* ---------------------------------------------------------------------
     CIBERSEGURIDAD
     --------------------------------------------------------------------- */
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Por qué guardás el token hasheado?",
      a: "Porque si alguien lee la base, no debe poder autenticarse. El token que viaja al cliente es aleatorio de 32 bytes; en la base solo queda su SHA-256. Como el hash no es reversible, no se puede reconstruir el token y por lo tanto no se puede suplantar la sesión. Es el mismo criterio que uso en todos los sistemas donde manejo sesiones."
    },
    en: {
      q: "Why do you store the token hashed?",
      a: "Because if someone reads the database they should not be able to authenticate. The token sent to the client is 32 random bytes; only its SHA-256 stays in the database. Since the hash is not reversible, nobody can reconstruct the token and therefore cannot impersonate the session. It is the same criterion I use across every system where I handle sessions."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Cómo evitás la enumeración de usuarios?",
      a: "Con un hash señuelo: cuando el usuario no existe, calculo igualmente el hash de la contraseña contra un valor ficticio, para que el tiempo de respuesta sea el mismo. Y el mensaje de error es idéntico en todos los casos de fallo: usuario inexistente, inactivo, bloqueado o contraseña incorrecta, todos dicen lo mismo."
    },
    en: {
      q: "How do you prevent user enumeration?",
      a: "With a decoy hash: when the user does not exist, I still compute the password hash against a fake value, so the response time is the same. And the error message is identical in every failure case: non-existent user, inactive, locked, or wrong password, they all say the same thing."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "medio",
    es: {
      q: "¿Qué es la versión de contraseña?",
      a: "Un número en la tabla de usuarios que se incrementa cuando se cambia la contraseña. Las sesiones guardan la versión con la que se crearon, y en cada petición se compara con la actual. Si no coinciden, la sesión se cae. Así el cambio de contraseña invalida todas las sesiones anteriores de esa persona, en la misma transacción que la cambia."
    },
    en: {
      q: "What is the password version?",
      a: "A number in the users table that increments when the password changes. Sessions store the version they were created with, and on every request it is compared with the current one. If they do not match, the session dies. That way the password change invalidates all previous sessions for that person, in the same transaction that changes it."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Qué es un hash señuelo?",
      a: "Un hash de una contraseña que nadie tiene, verificado cuando el usuario no existe. Sirve para que el tiempo de respuesta del acceso sea el mismo exista o no la cuenta. Sin eso, un atacante podría enumerar usuarios mirando cuánto tarda la respuesta. Es una defensa temporal contra un ataque clásico."
    },
    en: {
      q: "What is a decoy hash?",
      a: "A hash of a password nobody has, verified when the user does not exist. It makes the login response time the same whether or not the account exists. Without it, an attacker could enumerate users by timing the response. It is a temporary defence against a classic attack."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "basico",
    es: {
      q: "¿Qué indicadores tiene la cookie de sesión?",
      a: "Marcador de solo HTTP, para que JavaScript no pueda leerla; SameSite en modo estricto, que previene el secuestro de sesión entre sitios; vigencia igual a la duración de la sesión; y marca de conexión segura solo en producción. Ese último punto es un problema conocido: la cookie viaja en claro sobre HTTP en red local, y con producción sin HTTPS el acceso falla."
    },
    en: {
      q: "What flags does the session cookie have?",
      a: "HttpOnly, so JavaScript cannot read it; SameSite strict, which prevents cross-site session riding; max age equal to the session duration; and Secure only in production. That last one is a known problem: the cookie travels in clear over HTTP on the local network, and with production over plain HTTP the login fails."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Cómo protegés el acceso contra la fuerza bruta?",
      a: "Con tres límites: 20 intentos por minuto y por origen de red, 60 por minuto globales, y 2 operaciones de acceso concurrentes. Los tres viven en un mapa en memoria, que es correcto porque corre un solo proceso. Si el sistema escalara a varias instancias, habría que moverlos a la base de datos, porque en memoria el límite se reinicia con cada proceso."
    },
    en: {
      q: "How do you protect login against brute force?",
      a: "With three limits: 20 attempts per minute per network origin, 60 per minute globally, and 2 concurrent login operations. All three live in an in-memory map, which is correct because a single process runs. If the system scaled to several instances you would have to move them to the database, because in memory the limit resets with every process."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "medio",
    es: {
      q: "¿Qué es la comparación en tiempo constante y para qué la usás?",
      a: "Comparar sin que el tiempo dependa de dónde difieren. Con el operador de igualdad, si el primer carácter distinto está al principio la comparación termina rápido, y si está al final tarda más. Eso filtra información. Con la comparación en tiempo constante el tiempo es siempre el mismo. Lo uso para comparar hashes de contraseñas."
    },
    en: {
      q: "What is constant-time comparison and what do you use it for?",
      a: "Comparing without the time depending on where the values differ. With the equality operator, if the first differing character is at the start the comparison finishes fast, and if it is at the end it takes longer. That leaks information. With constant-time comparison the time is always the same. I use it to compare password hashes."
    }
  },
  {
    area: "ciberseguridad",
    areaTema: "seguridad",
    nivel: "avanzado",
    es: {
      q: "¿Qué limita el máximo de accesos concurrentes?",
      a: "Un límite de operaciones de acceso simultáneas, 2 por defecto. No limita cuántos intentos por minuto, sino cuántos pueden estar corriendo al mismo tiempo. Protege contra un escenario distinto: un atacante que abre muchas conexiones lentas para agotar los recursos del servidor. Y el cupo se libera en el bloque de limpieza, así que también se libera si el cliente se desconecta."
    },
    en: {
      q: "What does the max concurrent limit do?",
      a: "It limits simultaneous login operations, 2 by default. It does not limit how many attempts per minute, but how many can be running at the same time. It protects against a different scenario: an attacker opening many slow connections to exhaust server resources. And the slot is released in the cleanup block, so it is released even if the client disconnects."
    }
  },

  /* ---------------------------------------------------------------------
     ARQUITECTURA
     --------------------------------------------------------------------- */
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "basico",
    es: {
      q: "¿Cómo estructuraste el proyecto?",
      a: "Por módulos: autenticación, autores, libros, socios, préstamos y usuarios. Cada módulo tiene su router, controlador, servicio y repositorio, que separan el HTTP de las reglas de negocio del SQL. Es una separación clásica por capas, y funciona bien para este tamaño."
    },
    en: {
      q: "How did you structure the project?",
      a: "By modules: authentication, authors, books, members, loans and users. Each module has its router, controller, service and repository, which separate HTTP from business rules from SQL. It is classic layered separation, and it works well at this size."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "medio",
    es: {
      q: "¿Por qué una capa de servicio?",
      a: "Para que las reglas de negocio no dependan de HTTP. El servicio valida identificadores, fechas y observaciones, y devuelve errores de dominio con código de estado. El controlador traduce eso a respuesta HTTP. Así las reglas son comprobables sin levantar un servidor, y una futura CLI o API móvil reutilizaría el mismo servicio."
    },
    en: {
      q: "Why a service layer?",
      a: "So business rules do not depend on HTTP. The service validates identifiers, dates and observations, and returns domain errors with a status code. The controller translates that into an HTTP response. That way the rules are testable without starting a server, and a future CLI or mobile API would reuse the same service."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Por qué bloqueás al socio en los préstamos?",
      a: "Para que el cupo de tres no se supere por concurrencia. Si dos operadores prestan al mismo socio al mismo tiempo, ambos leerían que tiene dos préstamos y ambos prestarían, llegando a cuatro. Al bloquear al socio, el segundo espera, y cuando obtiene el bloqueo ya ve el estado actualizado y rechaza. El orden es siempre socio antes que ejemplar, que evita el interbloqueo con las otras operaciones."
    },
    en: {
      q: "Why do you lock the member during loans?",
      a: "So the limit of three cannot be exceeded by concurrency. If two operators loan to the same member at the same time, both would read that they have two loans and both would lend, reaching four. By locking the member, the second waits, and when it gets the lock it already sees the updated state and rejects. The order is always member before copy, which avoids deadlock with the other operations."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Qué pasa si dos personas prestan el mismo ejemplar?",
      a: "Hay dos barreras. En la aplicación, el ejemplar se bloquea y se verifica que no tenga préstamo activo. Y en la base hay un índice único parcial sobre el ejemplar donde la devolución es nula. Aunque la aplicación fallara, la base impide el doble préstamo activo."
    },
    en: {
      q: "What happens if two people borrow the same copy?",
      a: "There are two barriers. In the application, the copy is locked and checked to have no active loan. And in the database there is a partial unique index on the copy where the return is null. Even if the application failed, the database prevents the double active loan."
    }
  },
  {
    area: "arquitectura",
    areaTema: "arquitectura",
    nivel: "medio",
    es: {
      q: "¿Qué aporta la capa de repositorio?",
      a: "Que el servicio no sabe SQL. El servicio pide insertar un préstamo y el repositorio lo resuelve. Eso permite cambiar la base, o tener una implementación en memoria para pruebas, sin tocar reglas de negocio. El beneficio real aparece cuando querés testear la lógica sin levantar la base; si no vas a hacerlo, la capa es sobreingeniería."
    },
    en: {
      q: "What does the repository layer contribute?",
      a: "That the service does not know SQL. The service asks to insert a loan and the repository resolves it. That allows changing the database, or having an in-memory implementation for tests, without touching business rules. The real benefit shows up when you want to test logic without standing up a database; if you are not going to do that, the layer is over-engineering."
    }
  },
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "avanzado",
    es: {
      q: "¿Por qué el repositorio devuelve entidades y no filas?",
      a: "Porque las filas de PostgreSQL traen las fechas como objetos y los nombres como los puso la consulta. Una función centraliza esa traducción y agrega los campos calculados, como activo y vencido. Si la forma cambia, cambia un solo lugar."
    },
    en: {
      q: "Why does the repository return entities rather than rows?",
      a: "Because PostgreSQL rows come with dates as objects and names as the query aliased them. One function centralises that translation and adds the computed fields, like active and overdue. If the shape changes, it changes in one place."
    }
  },
  {
    area: "lenguajes",
    areaTema: "arquitectura",
    nivel: "basico",
    es: {
      q: "¿Por qué no usaste un ORM?",
      a: "Porque las consultas tienen semántica de negocio: bloqueos, restricciones únicas parciales, agregados de saldo. Un ORM las volvería opacas o habría que pelearlas. Con SQL explícito se ve exactamente qué pasa y por qué. Con tres dependencias, tampoco hay mucho que ganar."
    },
    en: {
      q: "Why did you not use an ORM?",
      a: "Because the queries carry business meaning: locks, partial unique constraints, balance aggregates. An ORM would make them opaque or I would have to fight it. With explicit SQL you see exactly what happens and why. With three dependencies there is not much to gain either."
    }
  },

  /* ---------------------------------------------------------------------
     DATOS
     --------------------------------------------------------------------- */
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "avanzado",
    es: {
      q: "¿Por qué las restricciones están en la base y no solo en el código?",
      a: "Porque la base es la última línea. Si alguien hace una inserción a mano o hay un error en otro camino de código, la restricción sigue sosteniendo la regla. El índice único parcial impide dos préstamos activos del mismo ejemplar, y las restricciones de validación impiden observaciones vacías o vencimientos inválidos. El código da el mensaje lindo, la base da la garantía."
    },
    en: {
      q: "Why are the constraints in the database and not only in the code?",
      a: "Because the database is the last line. If someone inserts by hand or there is a bug in another code path, the constraint still holds the rule. The partial unique index prevents two active loans on the same copy, and the check constraints prevent empty notes or invalid due dates. The code gives the friendly message, the database gives the guarantee."
    }
  },
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "medio",
    es: {
      q: "¿Qué es una migración y por qué no se modifica una ya aplicada?",
      a: "Una migración es un cambio de esquema versionado. Una vez aplicada, no se modifica: se agrega una nueva. Si modificás una que ya corrió, las bases que ya la aplicaron quedan con un esquema distinto del que espera el código. Es el mismo criterio en todos los proyectos: una migración aplicada es historia, no una borrador."
    },
    en: {
      q: "What is a migration, and why do you not modify one already applied?",
      a: "A migration is a versioned schema change. Once applied it is not modified: a new one is added. If you modify one that already ran, the databases that applied it are left with a schema different from what the code expects. It is the same criterion across projects: an applied migration is history, not a draft."
    }
  },
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "basico",
    es: {
      q: "¿Qué índices tenés y para qué?",
      a: "Un índice único parcial sobre préstamos activos, para impedir el doble préstamo. Índices sobre las claves foráneas más consultadas, como socio y ejemplar. Y en auditoría, índices por entidad y por usuario, porque las consultas son siempre de un club o de un usuario. Los índices siguen a las consultas reales, no a lo que parece importante."
    },
    en: {
      q: "Which indexes do you have and what are they for?",
      a: "A partial unique index over active loans, to prevent double borrowing. Indexes on the most queried foreign keys, like member and copy. And on the audit table, indexes by entity and by user, because queries are always for one club or one user. Indexes follow the real queries, not what seems important."
    }
  },
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "avanzado",
    es: {
      q: "¿Cómo calculás el saldo y los vencimientos?",
      a: "Con la fecha actual de PostgreSQL, no con la del servidor de la aplicación. Así el cálculo no depende del reloj de la máquina que corre la API. Para el saldo, sumo los cargos no pagados; para los vencidos, los que tienen fecha anterior a la actual."
    },
    en: {
      q: "How do you compute the balance and the overdue amounts?",
      a: "With PostgreSQL's current date, not the application server's. That way the calculation does not depend on the clock of the machine running the API. For the balance I sum unpaid charges; for overdue, those whose date is before today."
    }
  },
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "avanzado",
    es: {
      q: "¿Por qué las fechas de vencimiento se calculan en la base?",
      a: "Porque el vencimiento depende de la fecha del negocio, no de la de la máquina que ejecuta la consulta. Si el servidor de la aplicación tiene el reloj corrido, prestaría con vencimientos equivocados. Además, al calcular en la base, todos los nodos coinciden. Los catorce días se aplican en la inserción, no en el servicio."
    },
    en: {
      q: "Why are due dates computed in the database?",
      a: "Because the due date depends on the business date, not on the machine running the query. If the application server clock is off, it would lend with wrong due dates. Also, computing in the database means every node agrees. The fourteen days are applied at insert time, not in the service."
    }
  },
  {
    area: "lenguajes",
    areaTema: "datos",
    nivel: "avanzado",
    es: {
      q: "¿Cómo manejas las fechas de PostgreSQL en JavaScript?",
      a: "Hay un detalle real: el controlador devuelve las fechas como objetos en zona local, y convertir a cadena ISO las pasa a UTC. En un servidor en Argentina, la fecha actual puede terminar apareciendo como el día anterior. La solución es reconstruir la fecha con los getters locales en lugar de la conversión ISO. Es un tipo de error que no aparece en el desarrollo local y sí en producción."
    },
    en: {
      q: "How do you handle PostgreSQL dates in JavaScript?",
      a: "There is a real subtlety: the driver returns dates as objects in local time, and converting to an ISO string moves them to UTC. On a server in Argentina, today's date can end up showing as the previous day. The fix is to rebuild the date from the local getters instead of the ISO conversion. It is a kind of bug that does not appear in local development but does in production."
    }
  },

  /* ---------------------------------------------------------------------
     CONCURRENCIA
     --------------------------------------------------------------------- */
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "avanzado",
    es: {
      q: "¿Cómo evitas el interbloqueo entre las operaciones de préstamo?",
      a: "Con un orden estable de bloqueo. Las tres operaciones que toman más de un bloqueo siguen el mismo patrón: primero el socio, después el ejemplar o el préstamo. Cuando todas toman los recursos en el mismo orden, no se puede formar el ciclo que produce el interbloqueo. Es la solución clásica: no evitar el interbloqueo, sino hacer imposible que ocurra."
    },
    en: {
      q: "How do you avoid deadlock between the loan operations?",
      a: "With a stable lock order. The three operations that take more than one lock follow the same pattern: first the member, then the copy or the loan. When all of them take resources in the same order, the cycle that causes deadlock cannot form. It is the classic solution: not avoiding deadlock, but making it impossible."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "medio",
    es: {
      q: "¿Qué es el versionado optimista?",
      a: "En vez de bloquear, se lee con un número de versión y al escribir se exige que la versión siga siendo la misma. Si alguien escribió en el medio, la fila no se actualiza y la transacción falla. Lo uso en el módulo de socios para que dos ediciones simultáneas no se pisen. Más concurrencia que un bloqueo, a cambio de manejar el conflicto."
    },
    en: {
      q: "What is optimistic versioning?",
      a: "Instead of locking, you read with a version number and on write you require the version to still match. If someone wrote in between, the row does not update and the transaction fails. I use it in the members module so two simultaneous edits do not overwrite each other. More concurrency than a lock, at the cost of handling the conflict."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "avanzado",
    es: {
      q: "¿Por qué las pruebas no detectan un interbloqueo?",
      a: "Porque las pruebas de integración corren secuencialmente. El interbloqueo necesita concurrencia real, dos transacciones que se pisan. Para detectarlo hace falta una prueba que lance dos operaciones simultáneas con una barrera, de modo que las dos se queden esperando en el punto que dispara el ciclo. Es un hueco conocido de la suite, y la forma de cubrirlo es una prueba de concurrencia con barrera, no más casos secuenciales."
    },
    en: {
      q: "Why do the tests not detect a deadlock?",
      a: "Because the integration tests run sequentially. A deadlock needs real concurrency, two transactions colliding. Detecting it requires a test that launches two simultaneous operations behind a barrier, so both end up waiting at the point that triggers the cycle. It is a known gap in the suite, and the way to cover it is a barrier-based concurrency test, not more sequential cases."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "basico",
    es: {
      q: "¿Qué es una transacción?",
      a: "Un grupo de operaciones que se aplica todo o nada. En los préstamos envuelvo la lectura con bloqueo, la validación y la inserción. Si algo falla, se revierte y no queda nada a medias. Sin transacción, un fallo entre validar y guardar deja un estado inconsistente."
    },
    en: {
      q: "What is a transaction?",
      a: "A group of operations applied all or nothing. In loans I wrap the locked read, the validation and the insert. If anything fails it rolls back and nothing is left half-done. Without a transaction, a failure between validating and saving leaves an inconsistent state."
    }
  },
  {
    area: "lenguajes",
    areaTema: "concurrencia",
    nivel: "avanzado",
    es: {
      q: "¿Qué pasa si la aplicación cae a mitad de un préstamo?",
      a: "La transacción abierta se revierte sola cuando la conexión se pierde. No queda préstamo a medias. Por eso la inserción y sus validaciones van en la misma transacción, y no en llamadas sueltas que pudieran quedar la mitad."
    },
    en: {
      q: "What happens if the application crashes mid-loan?",
      a: "The open transaction rolls back on its own when the connection is lost. No half-finished loan remains. That is why the insert and its validations are in the same transaction, and not in separate calls that could end up half applied."
    }
  },

  /* ---------------------------------------------------------------------
     PROCESO Y CULTURA
     --------------------------------------------------------------------- */
  {
    area: "lenguajes",
    areaTema: "proceso",
    nivel: "basico",
    es: {
      q: "Contame sobre un proyecto del que estés orgulloso.",
      a: "Un sistema de trazabilidad de producción, modelado con contextos acotados. Lo que más me gusta no es el volumen sino una decisión de diseño: la condición de salida a producción está fijada en falso en el código, de forma permanente. No es una lista de verificación que alguien pueda completar por error. Escribí el sistema para que no pueda mentir sobre su propio estado."
    },
    en: {
      q: "Tell me about a project you are proud of.",
      a: "A production traceability system, modelled with bounded contexts. What I like most is not the volume but a design decision: the production release condition is permanently set to false in the code. It is not a checklist someone could complete by mistake. I wrote the system so that it cannot lie about its own state."
    }
  },
  {
    area: "it-general",
    areaTema: "proceso",
    nivel: "medio",
    es: {
      q: "¿Cómo aprendiste a diseñar así?",
      a: "Leyendo código de sistemas que manejan dinero y que fallaron. Lo que más me influyó fue entender que casi todos los errores graves en pagos son de idempotencia y de concurrencia, no de lógica de negocio. Eso me hizo mirar esas dos cosas primero en cada proyecto, antes de escribir la funcionalidad."
    },
    en: {
      q: "How did you learn to design this way?",
      a: "Reading code from systems that handle money and that failed. What influenced me most was understanding that almost all serious payment errors are idempotency and concurrency errors, not business logic errors. That made me look at those two things first in every project, before writing the feature."
    }
  },
  {
    area: "it-general",
    areaTema: "proceso",
    nivel: "avanzado",
    es: {
      q: "¿Qué decisión técnica tomaste hoy y te parece la más difícil?",
      a: "En un sistema de gestión de préstamos que audité: los roles eran inmutables. Un administrador podía crear bibliotecarios pero no promoverlos, y nada impedía desactivar al último administrador. Es un error real. Si lo arreglara, agregaría un endpoint de cambio de rol y una comprobación que impida quedarse sin administradores. Lo interesante del caso es que el bug era de diseño, no de implementación."
    },
    en: {
      q: "What technical decision would you make today and find hardest?",
      a: "In a loan management system I audited: the roles were immutable. An administrator could create librarians but not promote them, and nothing prevented deactivating the last administrator. It is a real bug. If I fixed it, I would add a role-change endpoint and a check that prevents having no administrators. What is interesting about the case is that the bug was in the design, not in the implementation."
    }
  },
  {
    area: "it-general",
    areaTema: "proceso",
    nivel: "avanzado",
    es: {
      q: "¿Qué harías distinto si lo empezaras de nuevo?",
      a: "Escribir las pruebas de concurrencia desde el principio. Es un hueco consistente: sé que el diseño es correcto, pero las pruebas suelen ser secuenciales. Una prueba que lance dos transacciones concurrentes con una barrera habría detectado antes algún problema de bloqueo. Y en un sistema de préstamos, habría decidido antes si la fecha de vencimiento era configurable, en vez de descubrir después que el campo era engañoso."
    },
    en: {
      q: "What would you do differently starting over?",
      a: "Write the concurrency tests from the start. It is a consistent gap: I know the design is correct, but the tests tend to be sequential. A test that launches two concurrent transactions behind a barrier would have found locking problems earlier. And in a loan system, I would have decided up front whether the due date was configurable, instead of finding out later that the field was misleading."
    }
  },
  {
    area: "it-general",
    areaTema: "proceso",
    nivel: "basico",
    es: {
      q: "¿Cómo verificás que un cambio no rompió nada?",
      a: "Con pruebas de integración contra PostgreSQL real, no con simulaciones. Los escenarios que crean registros los revierten con transacciones, así que puedo correr la suite contra la base de desarrollo sin ensuciarla. Y reviso el diff antes de commitear, que es donde he encontrado la mayoría de los errores propios."
    },
    en: {
      q: "How do you verify a change did not break anything?",
      a: "With integration tests against real PostgreSQL, not mocks. The scenarios that create records roll them back with transactions, so I can run the suite against the development database without dirtying it. And I review the diff before committing, which is where I have found most of my own mistakes."
    }
  },
  {
    area: "it-general",
    areaTema: "proceso",
    nivel: "avanzado",
    es: {
      q: "¿Qué usaste de asistencia de IA?",
      a: "Escribí la base del código, pero el diseño de arquitectura es mío: la verificación de que el identificador de club viniera del token, la decisión de importes enteros, el orden de los bloqueos. Y verifiqué todo ejecutándolo localmente, no leyendo. Un modelo puede proponer un patrón, pero no sabe si tu base tiene esa restricción ni si tu flujo real necesita eso."
    },
    en: {
      q: "What did you use AI assistance for?",
      a: "I wrote the base of the code, but the architectural design is mine: the verification that the club id comes from the token, the decision to use integer amounts, the lock ordering. And I verified everything by running it locally, not by reading. A model can suggest a pattern, but it does not know whether your database has that constraint or whether your actual flow needs it."
    }
  },
  {
    area: "lenguajes",
    areaTema: "proceso",
    nivel: "basico",
    es: {
      q: "¿Qué parte de estos proyectos te gusta más?",
      a: "La parte donde el dominio obliga. En un sistema de préstamos, cuando un socio tiene un préstamo vencido, la regla tiene que vivir en el servicio y no en el formulario. Eso no se negocia. Y en el despacho fiscal, la historia de una autorización de la que no se sabe si salió es el problema interesante, no la generación del PDF."
    },
    en: {
      q: "Which part of these projects do you enjoy most?",
      a: "The part where the domain pushes back. In a loan system, when a member has an overdue loan, the rule has to live in the service and not in the form. That is not negotiable. And in the fiscal dispatch, the story of an authorisation whose outcome is unknown is the interesting problem, not generating the PDF."
    }
  },
  {
    area: "ddd",
    areaTema: "proceso",
    nivel: "avanzado",
    es: {
      q: "¿Cómo aprendiste a pensar en el dominio?",
      a: "Empezando por las invariantes: qué tiene que ser verdad sí o sí. Si un material declarado no puede sobre-recibirse, esa regla no pertenece al formulario ni al endpoint, sino al modelo. Cuando la regla vive con el dato, un cambio de interfaz no puede romperla. Es un cambio de orden: primero las reglas, después el flujo."
    },
    en: {
      q: "How did you learn to think about the domain?",
      a: "Starting from the invariants: what has to be true no matter what. If declared material cannot be over-received, that rule does not belong to the form or the endpoint, but to the model. When the rule lives with the data, an interface change cannot break it. It is a change of order: first the rules, then the flow."
    }
  },
  {
    area: "it-general",
    areaTema: "cultura",
    nivel: "basico",
    es: {
      q: "¿Cómo trabajás en equipo?",
      a: "Con commits que explican el porqué, no el qué. Cuando subí los repositorios, los mensajes iniciales no listan funcionalidades: explican por qué la idempotencia va antes que la funcionalidad, por qué el motor falla cerrado, por qué el orden de bloqueos es ese. Si alguien tiene que mantenerlo dentro de un año, lo que importa es la razón."
    },
    en: {
      q: "How do you work in a team?",
      a: "With commits that explain the why, not the what. When I uploaded the repositories, the initial messages do not list features: they explain why idempotency comes before the feature, why the engine fails closed, why the lock order is that one. If someone has to maintain it a year from now, the reason is what matters."
    }
  },
  {
    area: "it-general",
    areaTema: "cultura",
    nivel: "medio",
    es: {
      q: "¿Qué te diferencia como desarrollador?",
      a: "Me preocupo por el modo de fallo antes que por el camino feliz. En pagos, lo primero que miro es qué pasa si esto se repite, si esto falla a mitad, si esto se ejecuta dos veces. Esa preocupación no es un detalle de calidad, es la diferencia entre un sistema que funciona en una demo y uno que aguanta producción."
    },
    en: {
      q: "What sets you apart as a developer?",
      a: "I worry about the failure mode before the happy path. In payments, the first thing I look at is what happens if this repeats, if this fails halfway, if this runs twice. That concern is not a quality detail, it is the difference between a system that works in a demo and one that survives production."
    }
  },
  {
    area: "it-general",
    areaTema: "cultura",
    nivel: "avanzado",
    es: {
      q: "¿Qué opinás de la documentación?",
      a: "Que es código que hay que mantener, y que se pudre si no la actualizás. En la auditoría encontré documentación que describía validaciones que ya eran código muerto. Mi regla es: si un documento contradice al código, es un error del documento. Y cuando actualizo, no reescribo la historia del documento, agrego la capa nueva y marco qué cambió."
    },
    en: {
      q: "What do you think about documentation?",
      a: "That it is code you have to maintain, and it rots if you do not update it. During the audit I found documentation describing validations that were already dead code. My rule is: if a document contradicts the code, that is a document bug. And when I update, I do not rewrite the document's history, I add the new layer and mark what changed."
    }
  },
  {
    area: "it-general",
    areaTema: "cultura",
    nivel: "basico",
    es: {
      q: "¿Qué buscás en el próximo trabajo?",
      a: "Un equipo donde el código se revise con criterio y las pruebas se tomen en serio, y un producto donde la corrección importa. De los proyectos que hice, los que más aprendí fueron los que manejan plata o datos reales, porque ahí los errores tienen consecuencias y no se pueden esconder."
    },
    en: {
      q: "What are you looking for in your next job?",
      a: "A team where code is reviewed with judgement and tests are taken seriously, and a product where correctness matters. Of the projects I have done, the ones I learned most from were those handling money or real data, because there mistakes have consequences and cannot be hidden."
    }
  },
  {
    area: "it-general",
    areaTema: "cultura",
    nivel: "avanzado",
    es: {
      q: "¿Cómo manejas la presión de los plazos?",
      a: "Prefiero recortar alcance a recortar calidad. En una aplicación que maneja plata, un pago duplicado o una sesión mal revocada es peor que una funcionalidad faltante. Así que cuando aprieta el tiempo, recortamos funcionalidad y mantenemos intacta la lógica de pagos y de sesiones. Es la negociación que suelo proponer."
    },
    en: {
      q: "How do you handle schedule pressure?",
      a: "I prefer cutting scope over cutting quality. In an application that handles money, a duplicated payment or a badly revoked session is worse than a missing feature. So when time is tight, we cut functionality and keep the payment and session logic intact. That is the trade-off I usually propose."
    }
  },
  {
    area: "it-general",
    areaTema: "cultura",
    nivel: "avanzado",
    es: {
      q: "¿Qué pregunta te cuesta más responder?",
      a: "Por qué tomé una decisión y no la alternativa, cuando la alternativa también era razonable. A veces la respuesta honesta es que no lo pensé y lo elegí por costumbre, y eso no es una respuesta fuerte. Pero prefiero eso a inventar una justificación que no tenía."
    },
    en: {
      q: "Which question is hardest for you to answer?",
      a: "Why I made one decision instead of the alternative, when the alternative was also reasonable. Sometimes the honest answer is that I did not think about it and chose out of habit, and that is not a strong answer. But I prefer that to inventing a justification I did not have."
    }
  },
  {
    area: "it-general",
    areaTema: "cultura",
    nivel: "basico",
    es: {
      q: "¿Tenés alguna pregunta para nosotros?",
      a: "Sí: ¿cómo se manejan las migraciones de esquema en producción? Quiero saber si hay disciplina de versionado y si los cambios de datos y los de código van juntos. Y en qué se diferencia este equipo del anterior en la forma de revisar código."
    },
    en: {
      q: "Do you have any questions for us?",
      a: "Yes: how are schema migrations handled in production? I want to know whether there is versioning discipline and whether data changes and code changes go together. And how this team differs from the previous one in the way it reviews code."
    }
  },
  {
    area: "it-general",
    areaTema: "cultura",
    nivel: "medio",
    es: {
      q: "¿Qué te frustra de trabajar con IA?",
      a: "Que produce código más rápido de lo que uno puede verificar. Ese es el riesgo real: código correcto en apariencia, sin pruebas, que compila y no hace lo que uno cree. Mi regla fue no aceptar nada sin ejecutarlo, y eso duplica el trabajo de verificación. Es el precio de la velocidad."
    },
    en: {
      q: "What frustrates you about working with AI?",
      a: "It produces code faster than a person can verify it. That is the real risk: code that looks correct, untested, that compiles and does not do what you think. My rule was to accept nothing without running it, and that doubles the verification work. It is the price of the speed."
    }
  },

  /* ---------------------------------------------------------------------
     GENERAL — límites (responder con honestidad)
     --------------------------------------------------------------------- */
  {
    area: "it-general",
    areaTema: "limites",
    nivel: "basico",
    es: {
      q: "¿Cuál es la mayor debilidad de tus proyectos?",
      a: "La cobertura de pruebas no acompaña. En un sistema de cobros que construí había 3 archivos de prueba para casi 3.000 líneas, y pagos y webhook no tenían regresión permanente. La verificación la hice con scripts de integración que se limpian solos, que alcanzan para validar pero no quedan como regresión. Es lo primero que arreglaría."
    },
    en: {
      q: "What is the biggest weakness of your projects?",
      a: "Test coverage does not keep up. In a payment system I built there were 3 test files for almost 3,000 lines, and payments and the webhook had no permanent regression coverage. I verified with integration scripts that clean up after themselves, which is enough to validate but does not stay as regression. It is the first thing I would fix."
    }
  },
  {
    area: "it-general",
    areaTema: "limites",
    nivel: "avanzado",
    es: {
      q: "¿Qué parte de un sistema no pondrías en producción hasta haberla ejercido completa, y por qué?",
      a: "No tocaría pagos reales ni facturación hasta haber corrido el circuito completo con credenciales de prueba, porque el código del webhook nunca se ejecutó contra el servicio real, y un webhook sin ejercitar es una teoría con forma de código. Y en un sistema con emisión fiscal, no habilitaría producción si el único adaptador disponible es el de homologación: el bloqueo tiene que ser estructural, por diseño, no una casilla de un checklist."
    },
    en: {
      q: "Which part of a system would you keep out of production until you had exercised it end to end, and why?",
      a: "I would not touch real payments or invoicing until the full circuit had run with test credentials, because the webhook code has never executed against the real service, and an unexercised webhook is a theory shaped like code, not code. And in a system with tax issuance, I would not enable production if the only adapter available is the test one: the block has to be structural, by design, not a checkbox on a list."
    }
  },
  {
    area: "it-general",
    areaTema: "limites",
    nivel: "avanzado",
    es: {
      q: "¿Qué te da más miedo de estos sistemas?",
      a: "Un error silencioso. Un pago que se duplica, un socio que ve la deuda de otro, una sesión que sobrevive a un cambio de contraseña. Son errores que no se ven en el desarrollo y aparecen en producción, cuando ya hay plata y datos reales. Por eso los verifiqué con casos de concurrencia y no solo con el flujo feliz."
    },
    en: {
      q: "What worries you most about these systems?",
      a: "A silent error. A duplicated payment, a member seeing another member's debt, a session surviving a password change. They are errors you do not see in development and that appear in production, when there is already money and real data. That is why I verified them with concurrency cases and not only the happy path."
    }
  },
  {
    area: "it-general",
    areaTema: "limites",
    nivel: "medio",
    es: {
      q: "¿Qué falta para que esto esté listo?",
      a: "Depende del módulo. En el de préstamos: pruebas de la renovación y del registro de auditoría, que es la función más delicada y la única sin cobertura. En el de cobros: más de un tenant por instalación, y pruebas permanentes del flujo de pagos. En el fiscal: el adaptador real del proveedor, que es un proyecto en sí mismo, y un panel decente para operar a diario."
    },
    en: {
      q: "What is missing for this to be ready?",
      a: "It depends on the module. In the loan module: tests for the renewal and the audit log, which is the most delicate feature and the only one without coverage. In the payments module: more than one tenant per installation, and permanent tests for the payment flow. In the fiscal one: the real provider adapter, which is a project in itself, and a decent admin panel to operate daily."
    }
  },
  {
    area: "lenguajes",
    areaTema: "limites",
    nivel: "avanzado",
    es: {
      q: "¿Qué decisión tuya fue una mala idea?",
      a: "Aceptar un campo de fecha de vencimiento configurable en un préstamo. Resulta que la regla era siempre la misma, así que el campo era engañoso: el formulario lo muestra editable pero cualquier fecha que no fuera la correcta daba error. Lo mejor era no exponerlo. No lo quité porque implicaba romper el contrato de la API, y ahí la decisión correcta habría sido aceptar el costo de romperlo."
    },
    en: {
      q: "Which of your decisions was a bad idea?",
      a: "Accepting a configurable due date field on a loan. It turns out the rule was always the same, so the field was misleading: the form shows it editable but any date other than the right one errored out. The best move was not to expose it. I did not remove it because it meant breaking the API contract, and there the correct decision would have been to accept the cost of breaking it."
    }
  },
  {
    area: "lenguajes",
    areaTema: "limites",
    nivel: "avanzado",
    es: {
      q: "¿Qué no harías de nuevo?",
      a: "Aceptar la fecha de vencimiento como parámetro, y poner todos los estados del préstamo en el mismo servicio. La segunda la identifiqué en la auditoría: el flujo de alta, devolución y renovación viven en un controlador de 57 líneas, y la renovación quedó con una forma de respuesta distinta a las otras dos. Un servicio por caso de uso habría evitado esa inconsistencia."
    },
    en: {
      q: "What would you not do again?",
      a: "Accepting the due date as a parameter, and putting all the loan states in the same service. The second one I found during the audit: the create, return and renewal flows live in a 57-line controller, and the renewal ended up with a response shape different from the other two. One service per use case would have avoided that inconsistency."
    }
  },
  {
    area: "it-general",
    areaTema: "limites",
    nivel: "basico",
    es: {
      q: "¿Qué es lo mejor que aprendiste haciendo estos proyectos?",
      a: "Que el código que más importa es el que maneja el error. El camino feliz es la parte fácil y la que todos ven. Lo que separa un sistema funcional de uno confiable es qué pasa cuando se corta la conexión, cuando dos personas hacen lo mismo a la vez, o cuando el proveedor responde dos veces. Ahí es donde se ve la experiencia."
    },
    en: {
      q: "What is the most important thing you learned building these projects?",
      a: "That the code that matters most is the code that handles errors. The happy path is the easy part and the one everyone sees. What separates a working system from a reliable one is what happens when the connection drops, when two people do the same thing at once, or when the provider answers twice. That is where experience shows."
    }
  }

];


/* =========================================================================
   2. DICCIONARIOS
   -------------------------------------------------------------------------
   Los textos de la interfaz, en los dos idiomas.
   ========================================================================= */

const IDIOMAS = {
  es: {
    titulo:      "Preparador de entrevistas técnicas",
    subtitulo:   "144 preguntas en español e inglés · arquitectura, DDD, ciberseguridad, lenguajes e ingeniería",
    area:        "Temática",
    dificultad:  "Dificultad",
    todos:       "Todos",
    iniciar:     "Iniciar →",
    cambiar:     "Cambiar filtros",
    siguiente:   "Siguiente pregunta →",
    respuesta:   "Ver respuesta",
    favorita:    "Marcar favorita",
    favoritaQuitar: "Quitar favorita",
    reiniciar:   "Reiniciar",
    disponibles: "Disponibles",
    vistas:      "Vistas",
    total:       "Total",
    favoritas:   "Favoritas",
    comoUsar:    "Cómo usarlo:",
    ayuda:       "elegí temática y dificultad, y pulsá Iniciar. Después, Siguiente o Espacio para otra pregunta. Las preguntas no se repiten hasta agotar el banco; después se baraja de nuevo. R reinicia todo. Guardá en favoritas las que te cuesten: se marcan con un punto.",
    vacio:       "No hay preguntas para ese filtro. Probá con otra combinación.",
    puntoClave:  "Punto clave — respondé con honestidad",

    /* Sección de respuesta propia */
    tuRespuesta: "Tu respuesta",
    placeholder: "Escribí lo que responderías en una entrevista real, como si nadie pudiera ver esta pantalla. No hace falta que sea perfecto: el objetivo es ver qué conceptos te faltan.",
    comprobar:   "Comprobar mi respuesta",
    limpiar:     "Borrar",
    metCobertura: "Conceptos",
    metSimilitud: "Similitud",
    metPalabras:  "Palabras",
    faltantes:   "Conceptos que te faltaron",
    hallados:    "Conceptos que mencionaste",
    sobrantes:   "Términos tuyos que no están en la referencia",

    /* Evaluación con IA */
    iaTitulo:    "Evaluación con IA (opcional)",
    iaNota:      "El análisis de arriba compara contenido sin conexión. Esta opción consulta un modelo de OpenAI para juzgar si tu respuesta EXPRESA LO MISMO que la de referencia, aunque uses otras palabras. Requiere tu propia clave de API y envía lo que escribas a OpenAI.",
    iaClave:     "Clave de API de OpenAI",
    iaBoton:     "Evaluar con IA",
    consultando: "Consultando…",
    sinRespuesta: "Primero escribí tu respuesta.",
    errorIA:     "No se pudo evaluar con IA",
    resultadoIA: "Evaluación del modelo",
    resumen:     "Resumen",
    cubiertos:   "Conceptos que cubre",
    faltantesIA: "Conceptos que le faltan",
    errores:     "Afirmaciones que no coinciden con la referencia",
    ninguno:     "Ninguno.",
  },

  en: {
    titulo:      "Technical interview preparation tool",
    subtitulo:   "144 questions in Spanish and English · architecture, DDD, security, languages and engineering",
    area:        "Topic",
    dificultad:  "Difficulty",
    todos:       "All",
    iniciar:     "Start →",
    cambiar:     "Change filters",
    siguiente:   "Next question →",
    respuesta:   "Show answer",
    favorita:    "Mark as favourite",
    favoritaQuitar: "Remove favourite",
    reiniciar:   "Reset",
    disponibles: "Available",
    vistas:      "Seen",
    total:       "Total",
    favoritas:   "Favourites",
    comoUsar:    "How to use:",
    ayuda:       "choose a topic and difficulty, then press Start. After that, Next or Space for another question. Questions do not repeat until the pool is exhausted; then everything is shuffled again. R resets. Mark as favourite the ones you find hard: they get a dot.",
    vacio:       "No questions for that filter. Try another combination.",
    puntoClave:  "Key point — answer honestly",

    /* Own answer section */
    tuRespuesta: "Your answer",
    placeholder: "Write what you would say in a real interview, as if nobody could see this screen. It does not have to be perfect: the goal is to see which concepts you are missing.",
    comprobar:   "Check my answer",
    limpiar:     "Clear",
    metCobertura: "Concepts",
    metSimilitud: "Similarity",
    metPalabras:  "Words",
    faltantes:   "Concepts you missed",
    hallados:    "Concepts you mentioned",
    sobrantes:   "Your terms not in the reference",

    /* AI evaluation */
    iaTitulo:    "AI evaluation (optional)",
    iaNota:      "The analysis above compares content offline. This option queries an OpenAI model to judge whether your answer SAYS THE SAME THING as the reference, even in different words. It requires your own API key and sends what you write to OpenAI.",
    iaClave:     "OpenAI API key",
    iaBoton:     "Evaluate with AI",
    consultando: "Asking…",
    sinRespuesta: "Write your answer first.",
    errorIA:     "Could not evaluate with AI",
    resultadoIA: "Model evaluation",
    resumen:     "Summary",
    cubiertos:   "Concepts covered",
    faltantesIA: "Concepts missing",
    errores:     "Claims that do not match the reference",
    ninguno:     "None.",
  }
};

/* Nombres de area, sub-tema y dificultad, en los dos idiomas. */
const NOMBRES = {
  area: {
    lenguajes:      { es: "Lenguajes y datos",        en: "Languages and data" },
    arquitectura:   { es: "Arquitectura",             en: "Architecture" },
    ciberseguridad:{ es: "Ciberseguridad",          en: "Cybersecurity" },
    ddd:            { es: "Diseño DDD",               en: "DDD design" },
    "it-general":   { es: "Ingeniería general",       en: "General engineering" }
  },
  nivel: {
    basico:   { es: "Básico",    en: "Basic" },
    medio:    { es: "Medio",     en: "Medium" },
    avanzado: { es: "Avanzado",  en: "Advanced" }
  }
};

/* Sub-temas, que salen como etiqueta en la tarjeta. */
const TEMAS = [
  { id: "arquitectura", es: "Arquitectura", en: "Architecture" },
  { id: "seguridad",    es: "Seguridad",    en: "Security" },
  { id: "concurrencia", es: "Concurrencia", en: "Concurrency" },
  { id: "datos",        es: "Datos",        en: "Data" },
  { id: "fiscal",       es: "Integraciones",en: "Integrations" },
  { id: "ddd",          es: "DDD",          en: "DDD" },
  { id: "proceso",      es: "Proceso",      en: "Process" },
  { id: "cultura",      es: "Cultura",      en: "Culture" },
  { id: "limites",      es: "Límites",      en: "Limits" }
];


/* =========================================================================
   3. ESTADO
   -------------------------------------------------------------------------
   Lo único que hay que recordar entre llamadas. Todo lo demás se deduce.
   ========================================================================= */

const estado = {
  idioma: "es",       // "es" o "en"
  iniciado: false,    // ¿se pulsó Iniciar y se abrió el panel de preguntas?
  actual: null,       // índice de la pregunta que se está mostrando
  vistas: [],         // preguntas ya mostradas en esta vuelta
  favoritas: new Set() // índices de las preguntas marcadas
};


/* =========================================================================
   4. APLICACIÓN
   -------------------------------------------------------------------------
   Los controles de la interfaz. Cada función hace una sola cosa.
   ========================================================================= */

const app = {

  /* --- Arranque de la aplicación ----------------------------------------- */
  arrancar() {
    this.detectarIdioma();
    this.cargarOpciones();
    this.marcarBotonIdioma();
    this.pintar();
    this.escribirAtajos();
    this.escribirAtajoIniciar();
  },

  /* Enter arranca la sesión de repaso, con la misma salvedad: si el foco está
     en un campo de escritura, el Enter es un salto de línea, no un comando. */
  escribirAtajoIniciar() {
    document.addEventListener("keydown", (evento) => {
      if (this.escribiendo()) return;
      if (evento.key === "Enter" && !estado.iniciado) {
        evento.preventDefault();
        this.iniciar();
      }
    });
  },

  /* El idioma inicial sale del navegador, con español como respaldo. */
  detectarIdioma() {
    const navegador = (navigator.language || "es").toLowerCase();
    estado.idioma = navegador.startsWith("en") ? "en" : "es";
  },

  /* Llena el desplegable de tematicas con las areas que existen en el banco,
     y el de dificultad. El nombre de cada area sale de NOMBRES, y el
     sub-tema queda como etiqueta en la tarjeta. */
  cargarOpciones() {
    const t = this.texto();
    const idioma = estado.idioma;

    /* Solo las areas que tienen al menos una pregunta. */
    const areasUsadas = [...new Set(BANCO.map(p => p.area))];

    const selArea = document.getElementById("filtro-area");
    selArea.innerHTML = `<option value="">${t.todos}</option>`;
    for (const area of areasUsadas) {
      const opcion = document.createElement("option");
      opcion.value = area;
      opcion.textContent = NOMBRES.area[area][idioma];
      selArea.appendChild(opcion);
    }

    const selNivel = document.getElementById("filtro-dificultad");
    selNivel.innerHTML = `<option value="">${t.todos}</option>`;
    for (const nivel of ["basico", "medio", "avanzado"]) {
      const opcion = document.createElement("option");
      opcion.value = nivel;
      opcion.textContent = NOMBRES.nivel[nivel][idioma];
      selNivel.appendChild(opcion);
    }
  },

  /* --- Traducción de la interfaz ----------------------------------------- */
  texto() {
    return IDIOMAS[estado.idioma];
  },

  /* Cambia de idioma y vuelve a pintar todo. */
  cambiarIdioma(idioma) {
    estado.idioma = idioma;
    document.documentElement.lang = idioma;
    this.cargarOpciones();
    this.marcarBotonIdioma();
    this.pintar();
  },

  /* Resalta el botón del idioma activo. */
  marcarBotonIdioma() {
    for (const codigo of ["es", "en"]) {
      document.getElementById("btn-" + codigo).className =
        (codigo === estado.idioma) ? "activo" : "";
    }
  },

  /* --- Filtrado ---------------------------------------------------------- */
  filtroActual() {
    return {
      area:  document.getElementById("filtro-area").value,
      nivel: document.getElementById("filtro-dificultad").value
    };
  },

  /* Devuelve las preguntas que pasan el filtro y todavia no se vieron. */
  preguntasDisponibles() {
    const f = this.filtroActual();
    return BANCO.filter(p =>
      (!f.area  || p.area  === f.area) &&
      (!f.nivel || p.nivel === f.nivel) &&
      !estado.vistas.includes(p)
    );
  },

  /* --- Inicio y cierre de la sesión de repaso ---------------------------- */

  /* Abre el panel de preguntas y muestra la primera del filtro elegido. */
  iniciar() {
    estado.iniciado = true;
    estado.vistas = [];
    this.siguiente();
  },

  /* Cierra el panel para volver a cambiar los filtros. */
  cerrar() {
    estado.iniciado = false;
    estado.actual = null;
    estado.vistas = [];
    this.pintar();
  },

  /* --- Siguiente pregunta ------------------------------------------------ */
  siguiente() {
    if (!estado.iniciado) return;

    let disponibles = this.preguntasDisponibles();

    /* Si no queda ninguna, se baraja de nuevo el conjunto filtrado. */
    if (disponibles.length === 0) {
      estado.vistas = [];
      disponibles = this.preguntasDisponibles();
    }

    if (disponibles.length === 0) {
      estado.actual = null;
      this.pintar();
      return;
    }

    const elegida = disponibles[Math.floor(Math.random() * disponibles.length)];
    estado.actual = BANCO.indexOf(elegida);
    estado.vistas.push(elegida);
    this.pintar();
  },

  /* --- Acciones sobre la pregunta actual --------------------------------- */
  mostrarRespuesta() {
    if (!estado.iniciado || estado.actual === null) return;
    const caja = document.getElementById("caja-respuesta");
    if (!caja || caja.innerHTML !== "") return;   // no la escribe dos veces

    const p = BANCO[estado.actual];
    const destacada = p.nivel === "avanzado" || p.tema === "limites";
    const rotulo = destacada ? this.texto().puntoClave : this.texto().respuesta;
    const clase = destacada ? "respuesta destacada" : "respuesta";

    caja.className = clase;
    caja.innerHTML =
      `<span class="rotulo">${rotulo}</span>${p[estado.idioma].a}`;
  },

  alternarFavorita() {
    if (estado.actual === null) return;
    estado.favoritas.has(estado.actual)
      ? estado.favoritas.delete(estado.actual)
      : estado.favoritas.add(estado.actual);
    this.pintar();
  },

  /* Baraja de nuevo las preguntas del filtro, sin cerrar el panel. */
  reiniciar() {
    estado.vistas = [];
    this.siguiente();
  },

  /* --- Evaluación de la respuesta propia -------------------------------- */

  /* Dibuja el área para escribir y el botón de comprobar. Se muestra debajo
     de la respuesta de referencia, así se lee: pregunta, referencia, lo tuyo. */
  pintarEvaluacion() {
    const t = this.texto();
    const caja = document.getElementById("seccion-evaluacion");
    if (!caja) return;

    caja.className = "evaluacion";
    caja.innerHTML = `
      <span class="rotulo-seccion">${t.tuRespuesta}</span>
      <textarea id="mi-respuesta" placeholder="${t.placeholder}"></textarea>
      <div class="navegacion">
        <button class="principal" onclick="app.evaluar()">${t.comprobar}</button>
        <button onclick="app.limpiarEvaluacion()">${t.limpiar}</button>
        <span id="estado-ia"></span>
      </div>
      <div id="resultado-evaluacion"></div>
      <div class="ia-opcional">
        <span class="rotulo-seccion">${t.iaTitulo}</span>
        <p class="nota-metodo">${t.iaNota}</p>
        <div class="navegacion">
          <input type="password" id="clave-ia" placeholder="${t.iaClave}" autocomplete="off">
          <button onclick="app.evaluarConIA()">${t.iaBoton}</button>
        </div>
        <div id="resultado-ia"></div>
      </div>`;
  },

  /* Compara lo escrito con la respuesta de referencia. */
  evaluar() {
    if (estado.actual === null) return;
    const mio = document.getElementById("mi-respuesta").value;
    const informe = evaluarLocal(mio, estado.actual, estado.idioma);
    this.pintarResultado(informe);
  },

  /* Limpia el texto escrito y el resultado. */
  limpiarEvaluacion() {
    const area = document.getElementById("mi-respuesta");
    if (area) area.value = "";
    document.getElementById("resultado-evaluacion").innerHTML = "";
  },

  /* Dibuja el informe: nota, medidores, conceptos que faltan y los que sobra. */
  pintarResultado(informe) {
    const t = this.texto();
    const destino = document.getElementById("resultado-evaluacion");
    if (!destino || !informe) return;

    if (informe.vacia) {
      destino.innerHTML =
        `<div class="resultado sin-intentar">
           <div class="titulo-resultado">${informe.titulo}</div>
           <ul class="lista-resultado">${informe.detalle.map(d => `<li>${d}</li>`).join("")}</ul>
         </div>`;
      return;
    }

    const conceptos = (lista, clase) => lista
      .map(c => `<span class="etiqueta-concepto ${clase}">${c}</span>`)
      .join("");

    destino.innerHTML = `
      <div class="resultado ${informe.nivel}">
        <div class="titulo-resultado">${informe.titulo} · ${informe.nota}/100</div>

        <div class="medidores">
          <div class="medidor">
            <div class="valor">${informe.cobertura}%</div>
            <div class="nombre">${t.metCobertura}</div>
            <div class="barra"><span style="width:${informe.cobertura}%"></span></div>
          </div>
          <div class="medidor">
            <div class="valor">${informe.similitud}%</div>
            <div class="nombre">${t.metSimilitud}</div>
            <div class="barra"><span style="width:${informe.similitud}%"></span></div>
          </div>
          <div class="medidor">
            <div class="valor">${informe.palabras}</div>
            <div class="nombre">${t.metPalabras}</div>
          </div>
        </div>

        ${informe.detalle.map(d => `<p class="nota-metodo">${d}</p>`).join("")}

        ${informe.faltantes.length ? `
          <p class="rotulo-seccion" style="margin-top:12px">${t.faltantes}</p>
          <div>${conceptos(informe.faltantes, "falta")}</div>` : ""}

        ${informe.hallados.length ? `
          <p class="rotulo-seccion" style="margin-top:12px">${t.hallados}</p>
          <div>${conceptos(informe.hallados, "")}</div>` : ""}

        ${informe.sobrantes.length ? `
          <p class="rotulo-seccion" style="margin-top:12px">${t.sobrantes}</p>
          <div>${conceptos(informe.sobrantes, "sobra")}</div>` : ""}
      </div>`;
  },

  /* Evaluación con IA. Opcional: requiere una clave propia de OpenAI. */
  async evaluarConIA() {
    if (estado.actual === null) return;
    const t = this.texto();
    const mio = document.getElementById("mi-respuesta").value;
    const campo = document.getElementById("clave-ia");
    const destino = document.getElementById("resultado-ia");
    const aviso = document.getElementById("estado-ia");

    if (!mio.trim()) {
      destino.innerHTML = `<div class="resultado sin-intentar">
        <div class="titulo-resultado">${t.sinRespuesta}</div></div>`;
      return;
    }

    aviso.textContent = t.consultando;
    destino.innerHTML = "";

    try {
      const r = await EvaluadorIA.evaluar(mio, estado.actual, estado.idioma, campo.value);
      this.pintarResultadoIA(r);
      aviso.textContent = "";
      campo.value = "";
    } catch (error) {
      aviso.textContent = "";
      destino.innerHTML = `<div class="resultado muy-baja">
        <div class="titulo-resultado">${t.errorIA}</div>
        <ul class="lista-resultado"><li>${error.message}</li></ul>
      </div>`;
    }
  },

  /* Dibuja el resultado de la evaluación con IA. */
  pintarResultadoIA(r) {
    const t = this.texto();
    const destino = document.getElementById("resultado-ia");
    const lista = (arr) => arr && arr.length
      ? `<ul class="lista-resultado">${arr.map(x => `<li>${x}</li>`).join("")}</ul>`
      : `<p class="nota-metodo">${t.ninguno}</p>`;

    const nota = Math.round((r.clarity + r.depth + r.fit) / 3);

    destino.innerHTML = `
      <div class="resultado ${nota >= 70 ? "solida" : nota >= 45 ? "parcial" : "baja"}">
        <div class="titulo-resultado">${t.resultadoIA} · ${nota}/100</div>

        <div class="medidores">
          <div class="medidor"><div class="valor">${r.clarity}</div><div class="nombre">${t.metClaridad}</div></div>
          <div class="medidor"><div class="valor">${r.depth}</div><div class="nombre">${t.metProfundidad}</div></div>
          <div class="medidor"><div class="valor">${r.fit}</div><div class="nombre">${t.metAjuste}</div></div>
        </div>

        <p class="rotulo-seccion">${t.resumen}</p>
        <p class="nota-metodo">${r.summary}</p>

        <p class="rotulo-seccion" style="margin-top:12px">${t.cubiertos}</p>
        ${lista(r.coveredConcepts || r.conceptosCubiertos)}

        <p class="rotulo-seccion" style="margin-top:12px">${t.faltantesIA}</p>
        ${lista(r.missingConcepts || r.conceptosFaltantes)}

        ${(r.errors || r.errores || []).length ? `
          <p class="rotulo-seccion" style="margin-top:12px">${t.errores}</p>
          ${lista(r.errors || r.errores)}` : ""}
      </div>`;
  },

  /* --- Dibujo de la pantalla --------------------------------------------- */
  pintar() {
    const t = this.texto();

    /* Textos que existen en los dos pasos. */
    document.getElementById("titulo").textContent = t.titulo;
    document.getElementById("subtitulo").textContent = t.subtitulo;
    document.getElementById("etiqueta-idioma").textContent =
      estado.idioma === "es" ? "Idioma" : "Language";
    document.getElementById("etiqueta-area").textContent = t.area;
    document.getElementById("etiqueta-dificultad").textContent = t.dificultad;
    document.getElementById("btn-iniciar").textContent = t.iniciar;
    document.getElementById("titulo-ayuda").textContent = t.comoUsar;
    document.getElementById("texto-ayuda").textContent = t.ayuda;

    /* El panel de preguntas solo existe después de pulsar Iniciar. */
    document.getElementById("panel-preguntas").className =
      estado.iniciado ? "" : "oculto";

    if (!estado.iniciado) {
      document.getElementById("tarjeta").innerHTML = "";
      return;
    }

    /* Textos del paso de repaso. */
    document.getElementById("btn-siguiente").textContent = t.siguiente;
    document.getElementById("btn-respuesta").textContent = t.respuesta;
    document.getElementById("btn-reiniciar").textContent = t.reiniciar;
    document.getElementById("btn-cambiar").textContent = t.cambiar;
    document.getElementById("etiqueta-disponibles").textContent = t.disponibles;
    document.getElementById("etiqueta-vistas").textContent = t.vistas;
    document.getElementById("etiqueta-total").textContent = t.total;
    document.getElementById("etiqueta-favoritas").textContent = t.favoritas;

    document.getElementById("stat-disponibles").textContent = this.preguntasDisponibles().length;
    document.getElementById("stat-vistas").textContent = estado.vistas.length;
    document.getElementById("stat-total").textContent = BANCO.length;
    document.getElementById("stat-favoritas").textContent = estado.favoritas.size;

    document.getElementById("btn-favorita").textContent =
      (estado.actual !== null && estado.favoritas.has(estado.actual))
        ? t.favoritaQuitar
        : t.favorita;

    this.pintarTarjeta();
  },

  /* Dibuja la tarjeta con la pregunta actual, o el mensaje de vacío. */
  pintarTarjeta() {
    const contenedor = document.getElementById("tarjeta");
    const t = this.texto();

    if (estado.actual === null) {
      contenedor.innerHTML = `<div class="panel vacio">${t.vacio}</div>`;
      return;
    }

    const p = BANCO[estado.actual];
    const nombreArea = NOMBRES.area[p.area][estado.idioma];
    const nombreNivel = NOMBRES.nivel[p.nivel][estado.idioma];
    const esFavorita = estado.favoritas.has(estado.actual);
    const tema = (TEMAS.find(x => x.id === p.areaTema) || {})[estado.idioma] || p.areaTema;

    contenedor.innerHTML = `
      <div class="panel tarjeta">
        <div class="meta">
          <span class="distintivo area-${p.area}">${nombreArea}</span>
          <span class="distintivo nivel-${p.nivel}">${nombreNivel}</span>
          <span class="etiqueta-tema">${tema}</span>
          ${esFavorita ? '<span class="etiqueta-tema">★</span>' : ''}
        </div>
        <p class="pregunta">${p[estado.idioma].q}</p>
        <div id="caja-respuesta"></div>
        <div id="seccion-evaluacion"></div>
        <div class="navegacion">
          <button class="principal" onclick="app.siguiente()">${t.siguiente}</button>
          <button onclick="app.mostrarRespuesta()">${t.respuesta}</button>
          <button onclick="app.alternarFavorita()">${esFavorita ? t.favoritaQuitar : t.favorita}</button>
        </div>
      </div>`;

    /* Debajo de la tarjeta va el área para escribir la respuesta propia. */
    this.pintarEvaluacion();
  },

  /* --- Atajos de teclado ------------------------------------------------- */

  /* Un atajo no debe disparar cuando el foco está en un campo de escritura:
     la barra espaciadora tiene que escribir un espacio, y la R tiene que
     ser una letra más de la palabra que estás escribiendo. */
  escribiendo() {
    const el = document.activeElement;
    if (!el) return false;
    if (el.isContentEditable) return true;
    return ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(el.tagName);
  },

  escribirAtajos() {
    document.addEventListener("keydown", (evento) => {
      if (this.escribiendo()) return;

      if (evento.key === " ") {
        evento.preventDefault();
        this.siguiente();
      }
      if (evento.key === "r" || evento.key === "R") {
        this.reiniciar();
      }
    });
  }
};


/* Arranque */
app.arrancar();
