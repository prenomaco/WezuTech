"use client";

import { useLayoutEffect, useRef } from "react";
import { MotionRegistry } from "@/motion/motion-registry";

/**
 * Mount point for the page's choreography.
 *
 * Renders nothing: the registry finds its targets through `data-motion`
 * attributes, which keeps every section a plain server component.
 */
export function SiteMotion() {
  const mounted = useRef(false);

  useLayoutEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const registry = MotionRegistry.withDefaults();
    registry.mount(document.body);

    return () => {
      mounted.current = false;
      registry.unmount();
    };
  }, []);

  return null;
}
