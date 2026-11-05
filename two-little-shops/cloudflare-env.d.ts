declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    EMAILJS_SERVICE_ID?: string;
    EMAILJS_TEMPLATE_ID?: string;
    EMAILJS_PUBLIC_KEY?: string;
    EMAILJS_PRIVATE_KEY?: string;
    ORDER_MAIL_FROM?: string;
    ORDER_MAIL_TUNTUN_TO?: string;
  }
}
