declare module 'cxa-track/tracking' {
  function updateTrackingCodeInText(
    text: string,
    trackingCode: string,
    locale?: boolean | string,
    extraParams?: Record<string, string>
  ): string;
}
