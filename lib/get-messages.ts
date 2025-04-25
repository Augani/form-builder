export async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Error loading messages for locale "${locale}":`, error);
    // Fall back to English if the requested locale isn't available
    return (await import("@/messages/en.json")).default;
  }
}
