import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Note: a
    .model({
      title: a.string().required(),
      content: a.string(),
    })
    // Cada persona solo puede leer, crear, editar y borrar sus propias notas.
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
