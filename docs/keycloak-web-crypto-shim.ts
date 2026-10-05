import { sha256 } from '@noble/hashes/sha2.js'

export function installKeycloakWebCryptoShim(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (typeof crypto === 'undefined') {
    throw new Error('Crypto API is not available.')
  }

  if (typeof crypto.getRandomValues === 'undefined') {
    // Math.random() にはフォールバックしない
    throw new Error('crypto.getRandomValues() is not available.')
  }

  if (typeof crypto.subtle === 'undefined') {
    Object.defineProperty(crypto, 'subtle', {
      value: {
        digest: async (
          algorithm: string,
          data: BufferSource,
        ): Promise<ArrayBuffer> => {
          if (algorithm !== 'SHA-256') {
            throw new Error(`Unsupported algorithm: ${algorithm}`)
          }

          const input =
            data instanceof ArrayBuffer
              ? new Uint8Array(data)
              : new Uint8Array(
                  data.buffer,
                  data.byteOffset,
                  data.byteLength,
                )

          const result = sha256(input)

          return result.buffer.slice(
            result.byteOffset,
            result.byteOffset + result.byteLength,
          ) as ArrayBuffer
        },
      },
    })
  }

  if (typeof crypto.randomUUID === 'undefined') {
    Object.defineProperty(crypto, 'randomUUID', {
      value: (): `${string}-${string}-${string}-${string}-${string}` => {
        const bytes = crypto.getRandomValues(new Uint8Array(16))

        // UUID v4
        bytes[6] = (bytes[6] & 0x0f) | 0x40
        bytes[8] = (bytes[8] & 0x3f) | 0x80

        const hex = Array.from(
          bytes,
          (value) => value.toString(16).padStart(2, '0'),
        ).join('')

        return [
          hex.slice(0, 8),
          hex.slice(8, 12),
          hex.slice(12, 16),
          hex.slice(16, 20),
          hex.slice(20),
        ].join('-') as `${string}-${string}-${string}-${string}-${string}`
      },
    })
  }
}
