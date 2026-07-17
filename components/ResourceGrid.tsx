"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ResourceCard } from "./ResourceCard";
import { formatResourceDate, type Resource } from "@/lib/types";

/** Cards shown before the "see more" button appears. */
const INITIAL_COUNT = 11;
const STEP = 12;

export function ResourceGrid({ resources }: { resources: Resource[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [shown, setShown] = useState(INITIAL_COUNT);

  // Restore the visitor's preferred view.
  useEffect(() => {
    if (window.localStorage.getItem("library-view") === "list") setView("list");
  }, []);

  const switchView = (v: "grid" | "list") => {
    setView(v);
    window.localStorage.setItem("library-view", v);
  };

  const visible = resources.slice(0, shown);
  const remaining = resources.length - visible.length;

  return (
    <div>
      {resources.length > 4 && (
        <div className="resources-controls">
          <div className="view-toggle" role="group" aria-label="Library view">
            <button
              type="button"
              className={view === "grid" ? "active" : ""}
              onClick={() => switchView("grid")}
            >
              Cards
            </button>
            <button
              type="button"
              className={view === "list" ? "active" : ""}
              onClick={() => switchView("list")}
            >
              List
            </button>
          </div>
        </div>
      )}

      {view === "grid" ? (
        <div className="resource-grid">
          {visible.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      ) : (
        <div className="resource-list">
          {visible.map((r) => (
            <Link key={r.id} href={`/r/${r.id}`} className="resource-list-row">
              <span className="resource-list-title">
                {r.title}
                {r.featured && <span className="pill pill--featured">Featured</span>}
              </span>
              <span className="resource-list-meta">
                {r.format} · {formatResourceDate(r.published_date)} <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <div className="show-more-wrap">
          <button
            type="button"
            className="btn-dark"
            onClick={() => setShown((n) => n + STEP)}
          >
            Click to see more ({remaining}) <span>↓</span>
          </button>
        </div>
      )}
    </div>
  );
}
