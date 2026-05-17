const config = {
  siteName: process.env.SITE_NAME || "ChainPilot",

  supportEmail:
    process.env.SUPPORT_EMAIL || "support@chainpilot.com",

  investmentEmail:
    process.env.INVESTMENT_EMAIL || "investments@chainpilot.com",

  frontendUrl:
    process.env.FRONTEND_URL || "https://yourfrontend.com",

  companyShortName:
    process.env.COMPANY_SHORT_NAME || "CPX",
};

module.exports = config;
