import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function generateQRCode(userEmail: string) {
  const secret = speakeasy.generateSecret({ name: `YourApp (${userEmail})` });

  const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url || "");
  return { secret: secret.base32, qrCodeDataURL };
}
