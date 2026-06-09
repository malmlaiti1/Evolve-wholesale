/** 15 digits + Luhn checksum (used for the IMEI scanner/lookup and a soft form hint). */
export function isValidImei(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  let double = false;
  for (let i = 14; i >= 0; i--) {
    let d = imei.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}
