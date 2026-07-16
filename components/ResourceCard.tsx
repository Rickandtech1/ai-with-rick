import Link from "next/link";
import { formatResourceDate, type Resource } from "@/lib/types";

export function ResourceCard({ resource }: { resource: Resource }) {
  const featured = resource.featured;
  return (
    <Link
      href={`/r/${resource.id}`}
      className={featured ? "resource-card resource-card--featured" : "resource-card"}
    >
      <div className="resource-card-meta">
        {resource.format} · {formatResourceDate(resource.published_date)}
      </div>
      <h3 className="resource-card-title">{resource.title}</h3>
      <p className="resource-card-desc">{resource.description}</p>
      <div className="resource-card-link">
        Read &amp; download <span>→</span>
      </div>
    </Link>
  );
}
