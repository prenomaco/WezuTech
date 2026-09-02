/* eslint-disable @next/next/no-img-element */
import { figmaAssets } from "@/lib/figma-assets";

export function Footer() {
  return <footer className="site-footer"><div className="footer-grid"><div><a className="brand footer-brand" href="#home"><img className="brand-mark" src={figmaAssets.footerMark} alt="" /><img className="brand-wordmark" src={figmaAssets.logoWordmark} alt="Wezu Technologies" /></a><p className="contact-details"><span><img src={figmaAssets.nameIcon} alt="" />Name Surname</span><span><img src={figmaAssets.emailIcon} alt="" />name@gmail.com</span><span><img src={figmaAssets.phoneIcon} alt="" />+91 00000 00000</span></p></div><div><h3>Navigation</h3><div className="footer-links"><a href="#home">Home</a><a href="#about">About</a><a href="#products">Products</a><a href="#gallery">Gallery</a><a href="#contact">Contact</a></div></div><div><h3>Legal</h3><a href="/privacy-policy">Privacy Policy</a><a href="/terms-of-service">Terms of Service</a></div></div><p className="copyright">© 2026 Wezu Technologies | Website Designed &amp; Developed by <a href="https://prenoma.co">prenoma.co</a></p></footer>;
}
