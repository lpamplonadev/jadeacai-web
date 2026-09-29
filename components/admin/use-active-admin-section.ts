"use client";

import { useEffect, useState } from "react";
import {
  adminSections,
  type AdminSectionId,
} from "@/components/admin/admin-sections";

export function useActiveAdminSection() {
  const [activeSection, setActiveSection] =
    useState<AdminSectionId>("dashboard");

  useEffect(() => {
    let frame = 0;

    function updateActiveSection() {
      frame = 0;
      const activationLine = window.innerHeight * 0.38;
      let nextActiveSection: AdminSectionId = adminSections[0].id;

      for (const section of adminSections) {
        const top = document
          .getElementById(section.id)
          ?.getBoundingClientRect().top;
        if (top !== undefined && top <= activationLine) {
          nextActiveSection = section.id;
        }
      }

      setActiveSection(nextActiveSection);
    }

    function scheduleUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    }

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return activeSection;
}
