#!/usr/bin/env python3
"""Seeds the throwaway GreenMail mailbox used by mail-pdf.mjs over plain IMAP
APPEND. Python stdlib only (imaplib/email for the messages, zlib/struct for a
tiny inline PNG) - no extra pip install for a one-shot E2E fixture.

Writes two messages, both carrying the RUN marker in their subject so the
test can find them regardless of what else is sitting in a long-lived
GreenMail container:

- Message A -> INBOX, left unread: HTML-only body (multipart/related with an
  inline cid: image) plus a text/plain attachment, and a battery of
  SSRF/XSS probes (remote image, remote CSS url(), remote stylesheet link,
  two file:// references, a <script>) that EmailPdfHtml/wkhtmltopdf must all
  neutralise.
- Message B -> Sent (created if missing), marked \\Seen: plain text only, no
  attachments, no Cc - the opposite shape, to prove those rows are omitted
  rather than printed empty.
"""
import argparse
import imaplib
import struct
import zlib
from email.header import Header
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def tiny_png(width: int, height: int, rgb: tuple[int, int, int]) -> bytes:
    """A minimal, valid solid-colour PNG - no Pillow dependency."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    signature = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # 8-bit depth, colour type 2 = RGB
    row = bytes([0]) + bytes(rgb) * width  # filter byte 0 (none) + one scanline
    raw = row * height
    idat = zlib.compress(raw)
    return signature + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')


def build_message_a(run: str, canary: str) -> bytes:
    logo_cid = f'logo-{run}@e2e'
    html = f"""<h2>Body marker {run}</h2>
<table><tr><td>Cell A1</td><td>Cell B1</td></tr></table>
<img src="cid:{logo_cid}">
<img src="http://{canary}/img-{run}.png">
<div style="background-image:url(http://{canary}/css-{run}.png)">Styled block</div>
<link rel="stylesheet" href="http://{canary}/link-{run}.css">
<iframe src="file:///etc/hostname"></iframe>
<img src="file:///etc/hostname">
<script>document.write('SCRIPT-RAN-{run}')</script>
<a href="https://example.com/e2e">A safe link</a>
"""

    related = MIMEMultipart('related')
    related.attach(MIMEText(html, 'html', 'utf-8'))

    image = MIMEImage(tiny_png(40, 40, (220, 20, 20)), _subtype='png')
    image.add_header('Content-ID', f'<{logo_cid}>')
    image.add_header('Content-Disposition', 'inline')
    related.attach(image)

    attachment = MIMEText(f'Report attachment for {run}', 'plain', 'utf-8')
    attachment.add_header('Content-Disposition', 'attachment', filename=f'report-{run}.txt')

    message = MIMEMultipart('mixed')
    message.attach(related)
    message.attach(attachment)

    message['From'] = '"E2E Sender" <sender@citizenone.test>'
    message['To'] = 'e2e-mailpdf@citizenone.test'
    message['Cc'] = '"E2E Cc" <cc@citizenone.test>'
    message['Date'] = 'Thu, 01 Oct 2026 10:15:00 +0000'
    message['Subject'] = Header(f'E2E Mail PDF {run} Rødgrød Q3/Q4 50%', 'utf-8')

    return message.as_bytes()


def build_message_b(run: str) -> bytes:
    message = MIMEText('Sent line one\nSent line two', 'plain', 'utf-8')
    message['From'] = 'e2e-mailpdf@citizenone.test'
    message['To'] = 'recipient@citizenone.test'
    message['Date'] = 'Thu, 01 Oct 2026 09:00:00 +0000'
    message['Subject'] = Header(f'E2E Sent PDF {run}', 'utf-8')
    return message.as_bytes()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, required=True)
    parser.add_argument('--user', required=True)
    parser.add_argument('--run', required=True)
    parser.add_argument('--canary', required=True, help='host:port of the test-local canary HTTP server')
    args = parser.parse_args()

    imap = imaplib.IMAP4('127.0.0.1', args.port)
    try:
        # GreenMail's auth checks are disabled for this container; any
        # password logs in and, on a first login, creates the mailbox.
        imap.login(args.user, 'e2e')

        imap.append('INBOX', None, None, build_message_a(args.run, args.canary))

        imap.create('Sent')  # fine if it already exists - GreenMail just errors harmlessly
        imap.append('Sent', '(\\Seen)', None, build_message_b(args.run))

        print(f'Seeded INBOX + Sent for {args.user} (run={args.run})')
    finally:
        imap.logout()


if __name__ == '__main__':
    main()
