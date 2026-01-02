export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a string; Next will safely escape by default.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

