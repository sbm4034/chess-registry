export async function safeQuery<T>(promise: Promise<T>) {
  try {
    return { data: await promise, error: null }
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes('fetch')
    ) {
      return {
        data: null,
        error: new Error('Network unavailable'),
      }
    }

    return { data: null, error }
  }
}