import os
import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv(
    "EMAIL_FROM",
    "onboarding@resend.dev",
)

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def send_password_reset_email(
    recipient_email: str,
    reset_url: str,
):
    if not RESEND_API_KEY:
        raise RuntimeError(
            "RESEND_API_KEY is not configured"
        )

    params = {
        "from": EMAIL_FROM,
        "to": [recipient_email],
        "subject": "Reset your ShopAK password",
        "html": f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #2b2825;
        ">

            <h1 style="
                font-family: Georgia, serif;
                font-weight: 400;
                margin-bottom: 10px;
            ">
                Reset Your Password
            </h1>

            <p style="
                color: #5c574d;
                line-height: 1.7;
            ">
                We received a request to reset the password
                for your ShopAK account.
            </p>

            <p style="
                color: #5c574d;
                line-height: 1.7;
            ">
                Click the button below to create a new password.
            </p>

            <div style="margin: 30px 0;">
                <a
                    href="{reset_url}"
                    style="
                        display: inline-block;
                        padding: 14px 28px;
                        background-color: #2b2825;
                        color: #faf7f2;
                        text-decoration: none;
                        border-radius: 30px;
                        font-size: 14px;
                    "
                >
                    Reset Password
                </a>
            </div>

            <p style="
                color: #8a8378;
                font-size: 13px;
                line-height: 1.6;
            ">
                This password reset link will expire in 30 minutes.
                If you did not request a password reset,
                you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #ece6dc;
                margin: 30px 0;
            ">

            <p style="
                color: #a39c8f;
                font-size: 12px;
            ">
                ShopAK
            </p>

        </div>
        """,
    }

    return resend.Emails.send(params)