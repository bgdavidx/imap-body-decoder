// @flow

const utf8 = require('utf8')
const iconv = require('iconv-lite')
const quotedPrintable = require('quoted-printable')
const uuencode = require('./uuencode.js')

const decodeBinary = (input/*: string */, charset/*:?string */) => {
  const decodeCharset = typeof charset === 'string' ? charset.toLowerCase() : 'utf-8'
  return iconv.decode(Buffer.from(input), decodeCharset)
}

const DECODER_TABLE = {
  'base64': (input/*: string */, charset/*:?string */) => Buffer.from(input, 'base64'),
  'quoted-printable': (input/*: string */, charset/*:?string */) => {
    let data = quotedPrintable.decode(input)

    if (charset && charset.toLowerCase() === 'utf-8') {
      data = utf8.decode(data)
    }

    return Buffer.from(data, 'utf8')
  },
  '7bit': (input/*: string */, charset/*:?string */) => Buffer.from(input, 'ascii'),
  '8bit': decodeBinary,
  'binary': decodeBinary,
  'uuencode': (input/*: string */, charset/*:?string */) => uuencode.decode(input.toString().replace(/\n/g, ''))
}

exports.decode = function decode(input/*: string*/, encoding/*: string */, charset/*: ?string */) {
  const decoder = DECODER_TABLE[encoding]

  if (!decoder) {
    throw new Error(`cannot find decoder for encoding: ${encoding}`)
  }

  return decoder(input, charset)
}
