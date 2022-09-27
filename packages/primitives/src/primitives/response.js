import * as ResponseModule from 'undici/lib/fetch/response'

function emitTypeErrorStream(rs, ws, doneFd) {
  rs.read()
    .then(({ done, value }) => {
      if (done) {
        ws.close()
          .then(() => doneFd())
          .catch(doneFd)
        return
      }
      if (value) {
        const avalue = value
        if (!(avalue.constructor && avalue.constructor.name === 'Uint8Array')) {
          ws.close()
            .then(() =>
              doneFd(new TypeError('This ReadableStream did not return bytes.'))
            )
            .catch(doneFd)
          return
        }
        ws.ready
          .then(() => {
            ws.write(value)
              .then(() => emitTypeErrorStream(rs, ws, doneFd))
              .catch(doneFd)
          })
          .catch(doneFd)
      }
    })
    .catch(doneFd)
}

function fixStream(s) {
  if (s && typeof s.getReader === 'function') {
    const ts = new TransformStream()
    emitTypeErrorStream(s.getReader(), ts.writable.getWriter(), (err) => {
      if (err) {
        throw err
      }
    })
    return ts.readable
  }
  return s
}

export class Response extends ResponseModule.Response {
  constructor(...[stream, init]) {
    super(fixStream(stream), init)
  }
}
