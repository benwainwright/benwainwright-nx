import { Environment } from "./environment";

export const getDomainName = (envName: Environment) => {
  switch(envName) {
    case "prod":
      return "quickbudget.co.uk"
  }
}
