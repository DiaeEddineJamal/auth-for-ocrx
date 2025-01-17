import { NextApiRequest, NextApiResponse } from "next";
import speakeasy from "speakeasy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token, secret } = req.body;

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
  });

  if (verified) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
}
