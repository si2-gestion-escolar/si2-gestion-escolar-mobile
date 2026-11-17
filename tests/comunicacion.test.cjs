const assert = require('node:assert/strict')
const { readFileSync, existsSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { test } = require('node:test')
const ts = require('typescript')
const axios = require('axios')

// Compile only our TS modules. Native SecureStore is replaced at the HTTP boundary;
// Axios still serializes the real request, without network or real push delivery.
function load(relative, client) {
  const filename = path.join(__dirname, '..', relative)
  if (!existsSync(filename)) return {}
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(source, {
    module, exports: module.exports,
    require: (id) => {
      if (id === './axiosInstance') return { __esModule: true, default: client }
      throw new Error(`Unexpected dependency: ${id}`)
    },
  }, { filename })
  return module.exports
}

test('push references open authenticated detail, prioritizing durable notification', () => {
  const { destinoDesdePush } = load('src/notifications/communicationRouting.ts')
  assert.equal(typeof destinoDesdePush, 'function', 'push routing must be implemented')
  assert.equal(JSON.stringify(destinoDesdePush({ notificacion_id: 31, comunicado_id: 9 })),
    JSON.stringify({ screen: 'NotificacionDetalle', params: { id: 31 } }))
  assert.equal(JSON.stringify(destinoDesdePush({ comunicado_id: '9' })),
    JSON.stringify({ screen: 'ComunicadoDetalle', params: { id: 9 } }))
  assert.equal(destinoDesdePush({ url: 'https://outside.invalid', cuerpo: 'private' }), null)
  for (const id of [0, -1, 1.5, NaN, Infinity, true, {}, '2/leer', '1e3', '9007199254740992']) {
    assert.equal(destinoDesdePush({ notificacion_id: id }), null)
  }
  assert.equal(destinoDesdePush(null), null)
})

test('communication API uses paginated filters and explicit read commands', async () => {
  const requests = []
  const client = axios.create({ adapter: async (config) => {
    requests.push(config)
    return { config, status: 200, statusText: 'OK', headers: {}, data: { count: 0, next: null, previous: null, results: [] } }
  } })
  const api = load('src/api/comunicacion.ts', client)
  assert.equal(typeof api.listarNotificaciones, 'function', 'communication API must exist')
  await api.listarNotificaciones({ page: 2, no_leidas: true, tipo: 'FALTA' })
  assert.equal(requests[0].url, '/comunicacion/notificaciones/')
  assert.equal(client.getUri(requests[0]), '/comunicacion/notificaciones/?page=2&no_leidas=true&tipo=FALTA')
  await api.obtenerComunicado(9)
  assert.equal(requests[1].method, 'get')
  assert.equal(requests[1].url, '/comunicacion/comunicados/9/')
  await api.confirmarLecturaComunicado(9)
  assert.equal(requests[2].method, 'post')
  assert.equal(requests[2].url, '/comunicacion/comunicados/9/leer/')
  await api.marcarNotificacionLeida(31)
  assert.equal(requests[3].url, '/comunicacion/notificaciones/31/leer/')
  assert.equal(requests[3].method, 'post')
  await api.actualizarPreferencias({ PAGO: false })
  assert.equal(requests[4].method, 'patch')
  assert.equal(requests[4].url, '/comunicacion/preferencias/')
  assert.equal(requests[4].data, '{"PAGO":false}')
  await api.obtenerResumenNotificaciones()
  assert.equal(requests[5].url, '/comunicacion/notificaciones/resumen/')
  await api.listarComunicados(3)
  assert.equal(client.getUri(requests[6]), '/comunicacion/comunicados/?page=3')
  await api.obtenerNotificacion(31)
  assert.equal(requests[7].url, '/comunicacion/notificaciones/31/')
  await api.obtenerPreferencias()
  assert.equal(requests[8].method, 'get')
  assert.equal(requests[8].url, '/comunicacion/preferencias/')
})

test('API preserves rejection so screens can offer retry instead of reporting success', async () => {
  const client = axios.create({ adapter: async () => { throw new Error('sin conexión') } })
  const api = load('src/api/comunicacion.ts', client)
  assert.equal(typeof api.confirmarLecturaComunicado, 'function', 'communication API must exist')
  await assert.rejects(api.confirmarLecturaComunicado(9), /sin conexión/)
})
