interface ContactCardProps {
  contact: {
    phone: string | null;
    line: string | null;
    email: string | null;
    website: string | null;
  };
}

export default function ContactCard({ contact }: ContactCardProps) {
  const hasAny = contact.phone || contact.line || contact.email || contact.website;
  if (!hasAny) return null;

  return (
    <div className="bg-milk rounded-[14px] p-6 border border-sand">
      <h3 className="font-serif font-bold text-[17px] text-espresso mb-4">Get in Touch</h3>
      <div className="flex flex-col gap-2.5">
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="bg-dark-roast text-cream py-3.5 px-4 rounded-[10px] text-sm font-semibold text-center block hover:opacity-90 transition-opacity">
            📞 {contact.phone}
          </a>
        )}
        {contact.line && (
          <a href={`https://line.me/R/ti/p/${contact.line.replace("@", "")}`} className="bg-line-green text-white py-3.5 px-4 rounded-[10px] text-sm font-semibold text-center block hover:opacity-90 transition-opacity">
            💬 LINE {contact.line}
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="bg-terracotta text-cream py-3.5 px-4 rounded-[10px] text-sm font-semibold text-center block hover:opacity-90 transition-opacity">
            ✉️ Email
          </a>
        )}
        {contact.website && (
          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="bg-sand text-dark-roast py-3.5 px-4 rounded-[10px] text-sm font-semibold text-center block hover:opacity-90 transition-opacity">
            🌐 Website
          </a>
        )}
      </div>
    </div>
  );
}
