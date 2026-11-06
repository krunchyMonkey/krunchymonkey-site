export interface PublicProject {
  readonly id: string;
  readonly name: string;
  readonly kind: "Project" | "Experiment";
  readonly summary: string;
  readonly status: "Public overview" | "Concept";
}

export const publicProjects: readonly PublicProject[] = [
  {
    id: "tracing-guatemala",
    name: "Tracing Guatemala",
    kind: "Project",
    summary: "Research workspace built around the people doing the research.",
    status: "Public overview",
  },
  {
    id: "krunchos",
    name: "KrunchOS (This!)",
    kind: "Project",
    summary: "A personal workstation, part portfolio and part open workshop.",
    status: "Public overview",
  },
  {
    id: "field-notes",
    name: "Field Notes Lab",
    kind: "Experiment",
    summary: "An idea for collecting and organizing research discoveries.",
    status: "Concept",
  },
  {
    id: "data-sketches",
    name: "Data Sketches",
    kind: "Experiment",
    summary: "Little experiments in visual explanations and software.",
    status: "Concept",
  },
];
