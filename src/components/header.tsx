/* eslint-disable @next/next/no-img-element */
import { figmaAssets } from "@/lib/figma-assets";

const links = ["Home", "About", "Products", "Gallery"];

export function Header() {
  return <header className="site-header"><a className="brand" href="#home" aria-label="Wezu Technologies home"><img className="brand-mark" src={figmaAssets.logoMark} alt="" /><img className="brand-wordmark" src={figmaAssets.logoWordmark} alt="Wezu Technologies" /></a><nav>{links.map((link) => <a key={link} href={`#${link.toLowerCase()}`}>{link}</a>)}<a className="button" href="#contact">Contact Us</a></nav></header>;
}
