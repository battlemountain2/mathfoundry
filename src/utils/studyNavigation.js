import { getMathUnit } from "../data/courses/mathFoundations.js";
import { getGeometryUnit } from "../data/courses/geometryFoundations.js";

const geometryAliases = {
  angles: "angles-lines",
  triangles: "triangles-pythagoras",
  pythagorean: "triangles-pythagoras",
  circles: "circles-radians",
  "volume-surface": "volume-surface-area",
  coordinate: "coordinate-geometry",
};

// Old rulebook/module IDs and new course IDs resolve to the same available topic.
export function resolveStudyUnit(entry) {
  const identifiers = [
    entry.unitPath,
    entry.unitId,
    entry.conceptId,
    entry.moduleId,
  ].filter(Boolean);
  let unit;
  for (const id of identifiers) {
    unit =
      getMathUnit(id) ||
      getGeometryUnit(id) ||
      getGeometryUnit(geometryAliases[id]);
    if (unit) break;
  }
  if (
    !unit &&
    ["linear-equations", "linear-inequalities"].includes(entry.moduleId)
  ) {
    unit = getMathUnit("intro-algebra");
  }
  return unit;
}

export function studyTopicLink(entry, activity = "practice") {
  const unit = resolveStudyUnit(entry);
  if (!unit) return { path: "/courses", label: "Explore available topics" };
  const base = `/courses/${unit.courseId}/${unit.id}`;
  const available = unit.hasPractice;
  return {
    path: available ? `${base}/${activity}` : base,
    label: available
      ? activity === "lesson"
        ? "Review lesson examples"
        : "Practice this topic"
      : "Explore this topic",
  };
}
