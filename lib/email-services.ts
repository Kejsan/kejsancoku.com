// Email service integrations
export interface EmailServiceConfig {
  provider: "mailchimp" | "convertkit" | "emailoctopus" | "buttondown" | "custom"
  apiKey?: string
  listId?: string
  audienceId?: string
  formId?: string
  customEndpoint?: string
}

export interface SubscribeResponse {
  success: boolean
  message: string
  error?: string
}

class EmailService {
  private config: EmailServiceConfig

  constructor(config: EmailServiceConfig) {
    this.config = config
  }

  async subscribe(email: string, firstName?: string, lastName?: string): Promise<SubscribeResponse> {
    const configValidation = this.validateConfiguration()

    if (!configValidation.valid) {
      const missingConfigMessage = `Missing configuration for provider "${this.config.provider}": ${configValidation.missing.join(", ")}`

      console.warn("[EmailService]", missingConfigMessage)

      return {
        success: false,
        message: "Newsletter subscriptions are temporarily unavailable. Please try again later.",
        error: missingConfigMessage,
      }
    }

    try {
      switch (this.config.provider) {
        case "mailchimp":
          return this.logSubscriptionResult(
            email,
            await this.subscribeMailchimp(email, firstName, lastName),
          )
        case "convertkit":
          return this.logSubscriptionResult(
            email,
            await this.subscribeConvertKit(email, firstName, lastName),
          )
        case "emailoctopus":
          return this.logSubscriptionResult(
            email,
            await this.subscribeEmailOctopus(email, firstName, lastName),
          )
        case "buttondown":
          return this.logSubscriptionResult(
            email,
            await this.subscribeButtondown(email, firstName, lastName),
          )
        case "custom":
          return this.logSubscriptionResult(
            email,
            await this.subscribeCustom(email, firstName, lastName),
          )
        default:
          throw new Error("Unsupported email service provider")
      }
    } catch (error) {
      console.error(
        `[EmailService] Subscription error for provider ${this.config.provider} and email ${this.maskEmail(email)}:`,
        error,
      )
      return {
        success: false,
        message: "Something went wrong. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private validateConfiguration(): { valid: boolean; missing: string[] } {
    const missing: string[] = []

    switch (this.config.provider) {
      case "mailchimp":
        if (!this.config.apiKey) missing.push("MAILCHIMP_API_KEY")
        if (!this.config.audienceId) missing.push("MAILCHIMP_AUDIENCE_ID")
        break
      case "convertkit":
        if (!this.config.apiKey) missing.push("CONVERTKIT_API_KEY")
        if (!this.config.formId) missing.push("CONVERTKIT_FORM_ID")
        break
      case "emailoctopus":
        if (!this.config.apiKey) missing.push("EMAILOCTOPUS_API_KEY")
        if (!this.config.listId) missing.push("EMAILOCTOPUS_LIST_ID")
        break
      case "buttondown":
        if (!this.config.apiKey) missing.push("BUTTONDOWN_API_KEY")
        break
      case "custom":
        if (!this.config.customEndpoint) missing.push("CUSTOM_EMAIL_ENDPOINT")
        break
      default:
        missing.push("EMAIL_SERVICE_PROVIDER")
    }

    return {
      valid: missing.length === 0,
      missing,
    }
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split("@")
    if (!domain) return "[invalid-email]"
    if (localPart.length <= 2) {
      return `${localPart[0] ?? "*"}***@${domain}`
    }
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`
  }

  private logSubscriptionResult(email: string, result: SubscribeResponse): SubscribeResponse {
    const maskedEmail = this.maskEmail(email)

    if (result.success) {
      console.info("[EmailService] Subscription successful", {
        provider: this.config.provider,
        email: maskedEmail,
      })
    } else {
      console.warn("[EmailService] Subscription unsuccessful", {
        provider: this.config.provider,
        email: maskedEmail,
        message: result.message,
      })
    }

    return result
  }

  private async subscribeMailchimp(email: string, firstName?: string, lastName?: string): Promise<SubscribeResponse> {
    if (!this.config.apiKey || !this.config.audienceId) {
      throw new Error("Mailchimp API key and audience ID are required")
    }

    // Extract datacenter from API key (e.g., "us1" from "abc123-us1")
    const datacenter = this.config.apiKey.split("-")[1]

    const response = await fetch(
      `https://${datacenter}.api.mailchimp.com/3.0/lists/${this.config.audienceId}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
          merge_fields: {
            FNAME: firstName || "",
            LNAME: lastName || "",
          },
          tags: ["website-signup", "blog-reader"],
        }),
      },
    )

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: "Successfully subscribed! Check your email for confirmation.",
      }
    } else if (data.title === "Member Exists") {
      return {
        success: true,
        message: "You're already subscribed! Thanks for your interest.",
      }
    } else {
      throw new Error(data.detail || "Failed to subscribe")
    }
  }

  private async subscribeConvertKit(email: string, firstName?: string, lastName?: string): Promise<SubscribeResponse> {
    if (!this.config.apiKey || !this.config.formId) {
      throw new Error("ConvertKit API key and form ID are required")
    }

    const response = await fetch(`https://api.convertkit.com/v3/forms/${this.config.formId}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: this.config.apiKey,
        email: email,
        first_name: firstName || "",
        tags: ["website-signup", "seo-blog"],
      }),
    })

    const data = await response.json()

    if (response.ok && data.subscription) {
      return {
        success: true,
        message: "Successfully subscribed! Check your email for confirmation.",
      }
    } else {
      throw new Error(data.message || "Failed to subscribe")
    }
  }

  private async subscribeEmailOctopus(
    email: string,
    firstName?: string,
    lastName?: string,
  ): Promise<SubscribeResponse> {
    if (!this.config.apiKey || !this.config.listId) {
      throw new Error("EmailOctopus API key and list ID are required")
    }

    const response = await fetch(`https://emailoctopus.com/api/1.6/lists/${this.config.listId}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: this.config.apiKey,
        email_address: email,
        fields: {
          FirstName: firstName || "",
          LastName: lastName || "",
        },
        tags: ["website-signup", "blog-reader"],
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: "Successfully subscribed! Check your email for confirmation.",
      }
    } else if (data.error && data.error.code === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS") {
      return {
        success: true,
        message: "You're already subscribed! Thanks for your interest.",
      }
    } else {
      throw new Error(data.error?.message || "Failed to subscribe")
    }
  }

  private async subscribeButtondown(email: string, firstName?: string, lastName?: string): Promise<SubscribeResponse> {
    if (!this.config.apiKey) {
      throw new Error("Buttondown API key is required")
    }

    const response = await fetch("https://api.buttondown.email/v1/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Token ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        metadata: {
          first_name: firstName || "",
          last_name: lastName || "",
          source: "website-blog",
        },
        tags: ["website-signup", "seo-insights"],
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: "Successfully subscribed! Check your email for confirmation.",
      }
    } else if (response.status === 400 && data.email?.[0]?.includes("already exists")) {
      return {
        success: true,
        message: "You're already subscribed! Thanks for your interest.",
      }
    } else {
      throw new Error(data.email?.[0] || "Failed to subscribe")
    }
  }

  private async subscribeCustom(email: string, firstName?: string, lastName?: string): Promise<SubscribeResponse> {
    if (!this.config.customEndpoint) {
      throw new Error("Custom endpoint is required")
    }

    const response = await fetch(this.config.customEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        source: "website-blog",
        timestamp: new Date().toISOString(),
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Successfully subscribed! Check your email for confirmation.",
      }
    } else {
      throw new Error(data.error || "Failed to subscribe")
    }
  }
}

// Configuration - Replace with your actual credentials
export const emailServiceConfig: EmailServiceConfig = {
  // Change provider to EmailOctopus
  provider: "emailoctopus",

  // EmailOctopus configuration
  apiKey: process.env.EMAILOCTOPUS_API_KEY,
  listId: process.env.EMAILOCTOPUS_LIST_ID,

  // Comment out other providers
  // Mailchimp configuration
  // apiKey: process.env.MAILCHIMP_API_KEY,
  // audienceId: process.env.MAILCHIMP_AUDIENCE_ID,

  // ConvertKit configuration
  // apiKey: process.env.CONVERTKIT_API_KEY,
  // formId: process.env.CONVERTKIT_FORM_ID,

  // Buttondown configuration
  // apiKey: process.env.BUTTONDOWN_API_KEY,

  // Custom endpoint configuration
  // customEndpoint: process.env.CUSTOM_EMAIL_ENDPOINT,
}

export const emailService = new EmailService(emailServiceConfig)
