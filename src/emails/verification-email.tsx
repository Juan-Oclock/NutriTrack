import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface VerificationEmailProps {
  confirmationUrl: string
  userEmail?: string
}

export default function VerificationEmail({
  confirmationUrl,
  userEmail,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for CalorieCue</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://caloriecue.juan-oclock.com/icons/icon-96x96.png"
              width="48"
              height="48"
              alt="CalorieCue"
              style={logo}
            />
            <Text style={logoText}>CalorieCue</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={heading}>Verify your email address</Heading>
            <Text style={paragraph}>
              Thanks for signing up for CalorieCue! Please verify your email
              address to start tracking your nutrition journey.
            </Text>
            {userEmail && (
              <Text style={emailText}>
                Email: <strong>{userEmail}</strong>
              </Text>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={confirmationUrl}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={paragraph}>
              This link will expire in 24 hours. If you didn&apos;t create an
              account with CalorieCue, you can safely ignore this email.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              If the button doesn&apos;t work, copy and paste this link into
              your browser:
            </Text>
            <Link href={confirmationUrl} style={link}>
              {confirmationUrl}
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              CalorieCue - Your personal nutrition companion
            </Text>
            <Text style={footerSubtext}>
              Track calories, macros, and achieve your health goals
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#0f172a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
}

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
}

const logo = {
  margin: "0 auto",
  borderRadius: "12px",
}

const logoText = {
  color: "#22c55e",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "12px 0 0 0",
}

const content = {
  backgroundColor: "#1e293b",
  borderRadius: "16px",
  padding: "32px",
  border: "1px solid #334155",
}

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
}

const paragraph = {
  color: "#94a3b8",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}

const emailText = {
  color: "#cbd5e1",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "8px 0 24px 0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#22c55e",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
}

const hr = {
  borderColor: "#334155",
  margin: "24px 0",
}

const footer = {
  color: "#64748b",
  fontSize: "12px",
  margin: "16px 0 8px 0",
}

const link = {
  color: "#22c55e",
  fontSize: "12px",
  wordBreak: "break-all" as const,
}

const footerSection = {
  textAlign: "center" as const,
  marginTop: "32px",
}

const footerText = {
  color: "#64748b",
  fontSize: "14px",
  margin: "0",
}

const footerSubtext = {
  color: "#475569",
  fontSize: "12px",
  margin: "4px 0 0 0",
}
