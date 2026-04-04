"use client";

interface Contact {
  phone: string | null;
  line: string | null;
  email: string | null;
  website: string | null;
}

interface MobileContactBarProps {
  contact: Contact;
}

function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

export default function MobileContactBar({ contact }: MobileContactBarProps) {
  // Build ordered list of contact actions
  type Action = { label: string; href: string; icon: string; style: "line" | "whatsapp" | "default" };
  const actions: Action[] = [];

  if (contact.line) {
    actions.push({
      label: "LINE",
      href: `https://line.me/R/ti/p/${contact.line.replace("@", "")}`,
      icon: "💬",
      style: "line",
    });
  }

  if (contact.phone) {
    actions.push({
      label: "WhatsApp",
      href: `https://wa.me/${cleanPhone(contact.phone)}`,
      icon: "📱",
      style: "whatsapp",
    });
  }

  if (contact.email) {
    actions.push({
      label: "Email",
      href: `mailto:${contact.email}`,
      icon: "✉",
      style: "default",
    });
  }

  if (contact.phone) {
    actions.push({
      label: "Call",
      href: `tel:${contact.phone}`,
      icon: "📞",
      style: "default",
    });
  }

  if (actions.length === 0) return null;

  const primary = actions[0];
  const secondary = actions.slice(1);

  const primaryClasses = {
    line: "bg-[#06C755] text-white",
    whatsapp: "bg-[#25D366] text-white",
    default: "bg-espresso text-cream",
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-milk/95 backdrop-blur-sm border-t border-sand px-4 py-3 lg:hidden z-40">
      <div className="flex gap-2 items-stretch">
        {/* Primary CTA — takes remaining space */}
        <a
          href={primary.href}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-bold transition-opacity hover:opacity-90 active:opacity-80 ${primaryClasses[primary.style]}`}
        >
          <span>{primary.icon}</span>
          <span>{primary.label}</span>
        </a>

        {/* Secondary CTAs — compact square-ish buttons */}
        {secondary.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-[13px] font-semibold bg-sand text-dark-roast transition-colors hover:bg-espresso/10 active:bg-espresso/15"
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
