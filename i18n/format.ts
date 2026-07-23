import type { Messages } from "./dictionaries/fr";
import type {
  AttributeKey,
  Category,
  Pattern,
  Season,
  WardrobeStyle,
} from "@/components/wardrobe/wardrobe.types";

export const formatMessage = (
  template: string,
  values: Record<string, string | number>,
) =>
  Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replaceAll(`{${key}}`, String(value)),
    template,
  );

export const getCategoryLabel = (
  messages: Messages,
  category: Category,
) => messages.attributes.categories[category];

export const getColorLabel = (messages: Messages, color: string) =>
  messages.attributes.colors[
    color as keyof typeof messages.attributes.colors
  ] ?? color;

export const getAttributeLabel = (
  messages: Messages,
  field: AttributeKey,
  value: string,
) => {
  if (field === "colors") return getColorLabel(messages, value);
  if (field === "seasons") {
    return messages.attributes.seasons[value as Season];
  }
  if (field === "styles") {
    return messages.attributes.styles[value as WardrobeStyle];
  }
  return messages.attributes.patterns[value as Pattern];
};
