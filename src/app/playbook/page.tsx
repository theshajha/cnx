import { Metadata } from "next";
import { getPlaybookContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Rental Playbook — CNX Cribs",
  description: "Everything you need to know about renting in Chiang Mai. Unit selection, pricing norms, negotiation tips, and red flags.",
};

function parsePlaybookSections(content: string) {
  const sections: { title: string; lines: string[] }[] = [];
  const parts = content.split(/^## /m);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const newlineIndex = trimmed.indexOf("\n");
    if (newlineIndex === -1) continue;
    const title = trimmed.slice(0, newlineIndex).trim();
    const body = trimmed.slice(newlineIndex + 1).trim();
    const lines = body.split("\n").filter((l) => l.trim() !== "");
    sections.push({ title, lines });
  }
  return sections;
}

export default function PlaybookPage() {
  const { content } = getPlaybookContent();
  const sections = parsePlaybookSections(content);

  return (
    <div className="max-w-3xl mx-auto pt-4">
      <h1 className="font-serif font-bold text-[40px] text-espresso tracking-tight leading-tight mb-10">
        The Rental Playbook
      </h1>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-4">
              {section.title}
            </h2>
            <div className="bg-milk rounded-[14px] border border-sand border-l-4 border-l-terracotta p-6">
              {section.lines.map((line, i) => {
                if (line.trimStart().startsWith("- ")) {
                  const text = line.trimStart().slice(2);
                  return (
                    <div key={i} className="flex gap-2 mb-2.5 last:mb-0">
                      <span className="text-terracotta mt-1 shrink-0">&#8226;</span>
                      <span
                        className="text-dark-roast text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: text.replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong class="text-espresso font-semibold">$1</strong>'
                          ),
                        }}
                      />
                    </div>
                  );
                }
                return (
                  <p
                    key={i}
                    className="text-dark-roast text-sm leading-relaxed mb-3 last:mb-0"
                    dangerouslySetInnerHTML={{
                      __html: line.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-espresso font-semibold">$1</strong>'
                      ),
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
