import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  real,
  boolean,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// Application tables
// (Auth is handled by Neon Auth in the neon_auth schema)
// ============================================================

// Schools
export const schools = pgTable("school", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// Admins (maps email -> school)
export const admins = pgTable("admin", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  schoolId: uuid("school_id")
    .notNull()
    .references(() => schools.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// Categories (per school)
export const categories = pgTable("category", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id")
    .notNull()
    .references(() => schools.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Subjects (per school, in a category)
export const subjects = pgTable("subject", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id")
    .notNull()
    .references(() => schools.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  units: integer("units").notNull().default(0),
  hasLevels: boolean("has_levels").notNull().default(false),
  dependsOnId: uuid("depends_on_id").references(
    (): AnyPgColumn => subjects.id,
    { onDelete: "set null" }
  ),
  depLabel: text("dep_label"),
  depWeight: real("dep_weight"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Levels (for multi-level subjects like Math)
export const levels = pgTable("level", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  units: integer("units").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Components (grade components: belongs to subject OR level)
export const components = pgTable("component", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").references(() => subjects.id, {
    onDelete: "cascade",
  }),
  levelId: uuid("level_id").references(() => levels.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  weight: real("weight").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ============================================================
// Relations
// ============================================================

export const schoolsRelations = relations(schools, ({ many }) => ({
  admins: many(admins),
  categories: many(categories),
  subjects: many(subjects),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  school: one(schools, { fields: [admins.schoolId], references: [schools.id] }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  school: one(schools, {
    fields: [categories.schoolId],
    references: [schools.id],
  }),
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  school: one(schools, {
    fields: [subjects.schoolId],
    references: [schools.id],
  }),
  category: one(categories, {
    fields: [subjects.categoryId],
    references: [categories.id],
  }),
  dependsOn: one(subjects, {
    fields: [subjects.dependsOnId],
    references: [subjects.id],
    relationName: "subjectDependency",
  }),
  dependents: many(subjects, { relationName: "subjectDependency" }),
  levels: many(levels),
  components: many(components),
}));

export const levelsRelations = relations(levels, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [levels.subjectId],
    references: [subjects.id],
  }),
  components: many(components),
}));

export const componentsRelations = relations(components, ({ one }) => ({
  subject: one(subjects, {
    fields: [components.subjectId],
    references: [subjects.id],
  }),
  level: one(levels, {
    fields: [components.levelId],
    references: [levels.id],
  }),
}));

