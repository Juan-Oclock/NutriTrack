import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface WelcomeEmailProps {
  userName?: string
}

export default function WelcomeEmail({ userName }: WelcomeEmailProps) {
  const firstName = userName?.split(" ")[0] || "there"

  return (
    <Html>
      <Head />
      <Preview>Welcome to CalorieCue - Start your nutrition journey!</Preview>
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
            <Heading style={heading}>Welcome, {firstName}!</Heading>
            <Text style={paragraph}>
              You&apos;re all set to start tracking your nutrition and achieving
              your health goals. CalorieCue makes it easy to stay on track with
              powerful features designed just for you.
            </Text>

            {/* Features */}
            <Section style={featuresSection}>
              <Section style={featureRow}>
                <Text style={featureIcon}>🍎</Text>
                <Section style={featureContent}>
                  <Text style={featureTitle}>Track Your Meals</Text>
                  <Text style={featureDescription}>
                    Log food from our 500K+ database
                  </Text>
                </Section>
              </Section>

              <Section style={featureRow}>
                <Text style={featureIcon}>📷</Text>
                <Section style={featureContent}>
                  <Text style={featureTitle}>Scan Barcodes</Text>
                  <Text style={featureDescription}>
                    Quick logging with barcode scanner
                  </Text>
                </Section>
              </Section>

              <Section style={featureRow}>
                <Text style={featureIcon}>🤖</Text>
                <Section style={featureContent}>
                  <Text style={featureTitle}>AI Meal Recognition</Text>
                  <Text style={featureDescription}>
                    Snap a photo, get instant nutrition info
                  </Text>
                </Section>
              </Section>

              <Section style={featureRow}>
                <Text style={featureIcon}>📊</Text>
                <Section style={featureContent}>
                  <Text style={featureTitle}>Track Progress</Text>
                  <Text style={featureDescription}>
                    Visualize your nutrition journey
                  </Text>
                </Section>
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Button
                style={button}
                href="https://caloriecue.juan-oclock.com/dashboard"
              >
                Start Tracking Now
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={tipTitle}>Quick Tip</Text>
            <Text style={tipText}>
              Start by logging your first meal! Tap the + button in the app to
              search for foods, scan a barcode, or use AI to recognize your
              meal.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              CalorieCue - Your personal nutrition companion
            </Text>
            <Text style={footerSubtext}>
              Questions? Reply to this email and we&apos;ll help you out!
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
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
}

const paragraph = {
  color: "#94a3b8",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  textAlign: "center" as const,
}

const featuresSection = {
  margin: "24px 0",
}

const featureRow = {
  display: "flex",
  alignItems: "flex-start",
  marginBottom: "16px",
}

const featureIcon = {
  fontSize: "24px",
  margin: "0 12px 0 0",
  width: "32px",
}

const featureContent = {
  flex: "1",
}

const featureTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
}

const featureDescription = {
  color: "#64748b",
  fontSize: "12px",
  margin: "2px 0 0 0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0 24px 0",
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

const tipTitle = {
  color: "#22c55e",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
}

const tipText = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
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
