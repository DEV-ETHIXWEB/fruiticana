"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

const structure: StructureResolver = (S) =>
  S.list()
    .title("Fruiticana")
    .items([
      S.listItem().title("Site settings").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("flyer").title("Weekly flyers"),
      S.documentTypeListItem("campaign").title("Homepage banners"),
      S.documentTypeListItem("store").title("Stores"),
      S.divider(),
      S.documentTypeListItem("page").title("Pages"),
      S.documentTypeListItem("post").title("Community posts"),
      S.documentTypeListItem("event").title("Events"),
      S.documentTypeListItem("video").title("Commercials"),
      S.divider(),
      S.documentTypeListItem("submission").title("Inbox · form submissions"),
    ]);

export default defineConfig({
  name: "fruiticana",
  title: "Fruiticana",
  basePath: "/studio",
  projectId: projectId || "missing-project-id",
  dataset,
  schema: {
    types: schemaTypes,
    // Settings is a singleton, hide it from "create new"
    templates: (templates) => templates.filter((t) => !["siteSettings", "submission"].includes(t.schemaType)),
  },
  document: {
    actions: (actions, ctx) => (ctx.schemaType === "siteSettings" ? actions.filter((a) => a.action !== "duplicate" && a.action !== "delete") : actions),
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
