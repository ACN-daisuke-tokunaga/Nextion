import {
  PostResult,
  PropertyValueMap,
  PropertyValueSelect,
} from "../../@types/notion-api-types";
import { SelectProperty } from "../valueObject/SelectProperty";
import { Config } from "../../Config";
import { LastEditedAt } from "../valueObject/LastEditedAt";
import { isDetectiveDatabasePropertyType } from "../../utils";

const { Status, Prop } = Config.Notion;

// type PageStatus = typeof Status[keyof typeof Status];

export interface IPageEntity {
  id: string;
  status: SelectProperty;
  properties: PropertyValueMap;
  lastEditedAt: Date;
}

export class PageEntity implements IPageEntity {
  #id;
  #status;
  #properties;
  #lastEditedAt;
  constructor(args: PostResult) {
    const { id, properties, last_edited_time } = args;
    this.#id = id;
    this.#status = new SelectProperty(properties[Config.Notion.Prop.STATUS]);
    this.#properties = properties;
    this.#lastEditedAt = new LastEditedAt(last_edited_time).date;
  }

  get id() {
    return this.#id;
  }

  get status() {
    return this.#status;
  }

  get properties() {
    return this.#properties;
  }

  set properties(value) {
    this.#properties = value;
  }

  get lastEditedAt() {
    return this.#lastEditedAt;
  }

  updateProperties(status: SelectProperty) {
    const updateProperties = Object.keys(this.#properties).reduce(
      (acc, cur) => {
        const prop = this.#properties[cur];
        if (cur !== Prop.STATUS) return acc;
        if (!isDetectiveDatabasePropertyType<PropertyValueSelect>(prop))
          return acc;
        console.log({ acc, cur, prop });
        if (!prop.select) {
          console.log({ acc, cur, prop });
          acc[Prop.STATUS] = {
            select: {
              id: status.id,
              name: status,
              color: "default",
            },
          };
          return acc;
        }
        prop.select.name = status;
        acc[Prop.STATUS] = prop;
        return acc;
      },
      {} as PropertyValueMap
    );
    console.log({ updateProperties });
    this.properties = updateProperties;
  }
}
