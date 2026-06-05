const config = {
  siteName: process.env.SITE_NAME || "CoinPilot",

  supportEmail:
    process.env.SUPPORT_EMAIL || "support@coinpilot.com",

  investmentEmail:
    process.env.INVESTMENT_EMAIL || "investments@coinpilot.com",

  frontendUrl:
    process.env.FRONTEND_URL || "https://yourfrontend.com",

  companyShortName:
    process.env.COMPANY_SHORT_NAME || "CPX",
};

export default config;
