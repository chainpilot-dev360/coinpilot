import { useEffect, useState } from "react";
import axios from "axios";
import { siteConfig } from "../config/siteConfig";

const API_URL = import.meta.env.VITE_API_URL;

export default function useSystemSettings() {
  const [settings, setSettings] = useState({
    site_name: siteConfig.siteName,
    company_short_name: siteConfig.companyNameShort,
    support_email: siteConfig.supportEmail,
    investment_email: siteConfig.investmentEmail,
    btc_wallet: siteConfig.btcWallet,
    eth_wallet: siteConfig.ethWallet,
    company_logo: "",
    tagline: siteConfig.tagline || "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await axios.get(`${API_URL}/api/system-settings`);

        setSettings({
          site_name: res.data.site_name || siteConfig.siteName,
          company_short_name:
            res.data.company_short_name || siteConfig.companyNameShort,
          support_email: res.data.support_email || siteConfig.supportEmail,
          investment_email:
            res.data.investment_email || siteConfig.investmentEmail,
          btc_wallet: res.data.btc_wallet || siteConfig.btcWallet,
          eth_wallet: res.data.eth_wallet || siteConfig.ethWallet,
          company_logo: res.data.company_logo || "",
          tagline: res.data.tagline || siteConfig.tagline || "",
        });
      } catch (error) {
        console.error("Failed to load public system settings", error);
      }
    }

    loadSettings();
  }, []);

  return settings;
}
