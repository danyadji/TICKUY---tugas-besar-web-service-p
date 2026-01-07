const QRCode = require('qrcode');

class QRCodeService {
  static async generate(ticketId) {
    try {
      const qrData = JSON.stringify({ ticket_id: ticketId });
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      return qrCodeDataURL;
    } catch (error) {
      throw error;
    }
  }

  static async generateToBuffer(ticketId) {
    try {
      const qrData = JSON.stringify({ ticket_id: ticketId });
      const qrBuffer = await QRCode.toBuffer(qrData);
      return qrBuffer;
    } catch (error) {
      throw error;
    }
  }

  static decode(qrData) {
    try {
      return JSON.parse(qrData);
    } catch (error) {
      throw new Error('QR Code data tidak valid');
    }
  }
}

module.exports = QRCodeService;
